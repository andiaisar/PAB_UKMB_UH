import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardUser Component
 * 
 * Menampilkan dashboard khusus user (read-only)
 * Menampilkan:
 * - Foto profil
 * - Nama user
 * - Email
 * - Daftar nilai (fisik, wawancara, pengetahuan, presentasi)
 * 
 * Data diambil dari Firestore berdasarkan UID user yang login
 */

// Progress Bar Component
const ProgressBar = ({ value, max }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-slate-600 h-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// Achievement Status Component
const AchievementStatus = ({ totalNilai }) => {
  let statusConfig = {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    title: '📈 Level Basic',
    description: 'Saatnya meningkatkan aktivitas'
  };

  if (totalNilai >= 200) {
    statusConfig = {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      title: '🏆 Level Excellent',
      description: 'Performa yang luar biasa'
    };
  } else if (totalNilai >= 100) {
    statusConfig = {
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      text: 'text-slate-800',
      title: '🎯 Level Good',
      description: 'Terus tingkatkan performa'
    };
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Anda</h3>
      <div className={`p-6 rounded-lg mb-4 ${statusConfig.bg} border ${statusConfig.border}`}>
        <p className={`text-sm font-medium ${statusConfig.text}`}>
          {statusConfig.title}
        </p>
      </div>
      <p className="text-sm text-gray-600">
        {statusConfig.description}
      </p>
    </div>
  );
};

export default function DashboardUser() {
  const { user, userData, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading state
    if (!loading && userData) {
      setIsLoading(false);
    }
  }, [loading, userData]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-400 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data profil Anda...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600">Tidak dapat memuat data profil Anda. Silakan coba lagi atau hubungi administrator.</p>
        </div>
      </div>
    );
  }

  // Hitung total nilai mengikuti kartu kontrol
  const kepanitiaan = (userData.jumlah_kepanitiaan || 0) * 10;
  const rapat = (userData.jumlah_rapat || 0) * 2;
  const latihan = (userData.jumlah_latihan || 0) * 2;
  const kinerja = userData.poin_kinerja || 0;

  const totalNilai = kepanitiaan + rapat + latihan + kinerja;

  // Data nilai dalam array untuk easier iteration
  const nilaiItems = [
    { label: 'Kepanitiaan', value: kepanitiaan, rawValue: userData.jumlah_kepanitiaan || 0, icon: '👥', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    { label: 'Rapat', value: rapat, rawValue: userData.jumlah_rapat || 0, icon: '📋', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    { label: 'Latihan', value: latihan, rawValue: userData.jumlah_latihan || 0, icon: '🎯', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    { label: 'Kinerja', value: kinerja, rawValue: userData.poin_kinerja || 0, icon: '⭐', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card - Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-50"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-sm border border-gray-200 mb-4 sm:mb-0">
                👤
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-gray-900">{userData.nama}</h1>
                <p className="text-gray-500 text-base mt-1">{userData.email}</p>
              </div>
            </div>

            {/* Personal Data Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-200">
              {/* NIM */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">NIM</p>
                <p className="text-lg font-semibold text-gray-900">{userData.nim || '-'}</p>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Jenis Kelamin</p>
                <p className="text-lg font-semibold text-gray-900">{userData.jenis_kelamin || '-'}</p>
              </div>

              {/* Fakultas */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Fakultas</p>
                <p className="text-lg font-semibold text-gray-900">{userData.fakultas || '-'}</p>
              </div>

              {/* Program Studi */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Program Studi</p>
                <p className="text-lg font-semibold text-gray-900">{userData.prodi || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {nilaiItems.map((item, index) => (
            <div key={index} className={`${item.bgColor} rounded-lg p-6 border ${item.borderColor}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {item.rawValue}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-3">{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">Poin</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ProgressBar value={item.value} max={100} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Total Score */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Total Performa</h2>
            
            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-5xl font-bold text-slate-700">{totalNilai}</span>
                <span className="text-sm text-gray-500">dari 300 poin</span>
              </div>
              <ProgressBar value={totalNilai} max={300} />
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              {nilaiItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.rawValue} aktivitas</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info & Achievement */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <AchievementStatus totalNilai={totalNilai} />

            {/* Info Card */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Informasi</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Halaman ini menampilkan rekapitulasi nilai Anda yang telah ditetapkan oleh administrator sistem.
              </p>
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rincian Detail</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-700">Kategori</th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-700">Aktivitas</th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-700">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nilaiItems.map((item, index) => {
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-gray-600">{item.rawValue}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-semibold text-slate-700">{item.value} Poin</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
