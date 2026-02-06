import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard() {
  const [stats, setStats] = useState({
    totalAnggota: 0,
    kehadiranTotal: 0,
    rataRataKehadiran: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const kehadiranSnapshot = await getDocs(collection(db, 'kehadiran'));
      const kehadiranData = kehadiranSnapshot.docs.map((doc) => doc.data());

      const totalKehadiran = kehadiranData.length;
      
      // Hitung jumlah anggota unik
      const anggotaSet = new Set(kehadiranData.map((item) => item.nama));
      const totalAnggota = anggotaSet.size;

      // Hitung rata-rata kehadiran per anggota
      const rataRata = totalAnggota > 0 ? (totalKehadiran / totalAnggota).toFixed(2) : 0;

      setStats({
        totalAnggota,
        kehadiranTotal: totalKehadiran,
        rataRataKehadiran: rataRata,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Anggota',
      value: stats.totalAnggota,
      icon: '👥',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Kehadiran',
      value: stats.kehadiranTotal,
      icon: '✓',
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Rata-rata Kehadiran',
      value: stats.rataRataKehadiran,
      icon: '📊',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Ringkasan data keaktifan anggota UKMB</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl p-3 bg-gradient-to-br ${card.color} rounded-lg shadow-md`}>
                <span className="text-white">{card.icon}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className={`text-4xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 shadow-lg">
            <span className="text-4xl">👋</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Selamat Datang di Sistem PAB & Kartu Kontrol UKMB
            </h3>
            <p className="text-gray-600 mb-4">
              Sistem ini dirancang untuk membantu Anda mengelola dan memantau keaktifan anggota UKMB 
              dengan lebih efisien. Gunakan menu navigasi di atas untuk mengakses berbagai fitur.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Kartu Kontrol</h4>
                  <p className="text-sm text-gray-600">Pantau kehadiran dan evaluasi anggota</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Status PAB</h4>
                  <p className="text-sm text-gray-600">Lihat penilaian aktivitas bulanan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Import Data</h4>
                  <p className="text-sm text-gray-600">Unggah data dari file Excel</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Dashboard</h4>
                  <p className="text-sm text-gray-600">Lihat statistik secara keseluruhan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
