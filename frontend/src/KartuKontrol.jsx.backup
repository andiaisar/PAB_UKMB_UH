import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const STANDAR_POIN = {
  KEPANITIAAN: 10,
  RAPAT: 5,
  DIKLAT: 20
};

function KartuKontrol() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    poin_aktif: 0,
    jumlah_kepanitiaan: 0,
    jumlah_rapat: 0,
    pab_progress: {
      wawancara: false,
      fisik: false,
      diklat: false
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRowBackgroundColor = (poin) => {
    if (poin > 70) return 'bg-green-100 hover:bg-green-200';
    if (poin >= 40) return 'bg-yellow-100 hover:bg-yellow-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      poin_aktif: user.poin_aktif || 0,
      jumlah_kepanitiaan: user.jumlah_kepanitiaan || 0,
      jumlah_rapat: user.jumlah_rapat || 0,
      pab_progress: {
        wawancara: user.pab_progress?.wawancara || false,
        fisik: user.pab_progress?.fisik || false,
        diklat: user.pab_progress?.diklat || false
      }
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setFormData({
      poin_aktif: 0,
      jumlah_kepanitiaan: 0,
      jumlah_rapat: 0,
      pab_progress: {
        wawancara: false,
        fisik: false,
        diklat: false
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const userDocRef = doc(db, 'users', editingUser.id);
      await updateDoc(userDocRef, {
        poin_aktif: parseInt(formData.poin_aktif),
        jumlah_kepanitiaan: parseInt(formData.jumlah_kepanitiaan),
        jumlah_rapat: parseInt(formData.jumlah_rapat),
        pab_progress: formData.pab_progress
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              poin_aktif: parseInt(formData.poin_aktif),
              jumlah_kepanitiaan: parseInt(formData.jumlah_kepanitiaan),
              jumlah_rapat: parseInt(formData.jumlah_rapat),
              pab_progress: formData.pab_progress 
            }
          : user
      ));

      handleCloseModal();
      alert('Data berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Gagal memperbarui data: ' + error.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const countChecklistCompleted = (pabProgress) => {
    if (!pabProgress) return 0;
    let count = 0;
    if (pabProgress.wawancara) count++;
    if (pabProgress.fisik) count++;
    if (pabProgress.diklat) count++;
    return count;
  };

  const getStatusWeight = (pabProgress) => {
    const completed = countChecklistCompleted(pabProgress);
    if (completed === 3) return 3; // LULUS
    if (completed === 2) return 2; // LULUS BERSYARAT
    return 1; // TIDAK LULUS (0-1 checklist)
  };

  // Process users: filter by search term and sort
  const processedUsers = users
    .filter(user => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        user.nama?.toLowerCase().includes(search) ||
        user.nim?.toLowerCase().includes(search) ||
        user.fakultas?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      // Jika ada sortConfig dari user (klik header kolom), gunakan itu
      if (sortConfig.key) {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // For strings, convert to lowercase
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Default sorting: berdasarkan bobot status kelulusan (tinggi ke rendah)
      const weightA = getStatusWeight(a.pab_progress);
      const weightB = getStatusWeight(b.pab_progress);
      
      if (weightA !== weightB) {
        return weightB - weightA; // Bobot tinggi di atas
      }
      
      // Jika bobot sama, urutkan berdasarkan nama (A-Z)
      const namaA = (a.nama || '').toLowerCase();
      const namaB = (b.nama || '').toLowerCase();
      
      if (namaA < namaB) return -1;
      if (namaA > namaB) return 1;
      return 0;
    });

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1">🔼</span> : 
      <span className="ml-1">🔽</span>;
  };

  const calculateTotalPoin = (user) => {
    const kepanitian = (user.jumlah_kepanitiaan || 0) * STANDAR_POIN.KEPANITIAAN;
    const rapat = (user.jumlah_rapat || 0) * STANDAR_POIN.RAPAT;
    const diklat = user.pab_progress?.diklat ? STANDAR_POIN.DIKLAT : 0;
    return kepanitian + rapat + diklat;
  };

  const getKelulusanStatus = (pabProgress) => {
    const completed = countChecklistCompleted(pabProgress);
    
    if (completed === 3) {
      return {
        text: '✅ LULUS',
        bgClass: 'bg-gradient-to-r from-green-500 to-teal-500',
        textClass: 'text-white'
      };
    } else if (completed === 2) {
      return {
        text: '⚠️ LULUS BERSYARAT',
        bgClass: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        textClass: 'text-white'
      };
    } else {
      return {
        text: '❌ TIDAK LULUS',
        bgClass: 'bg-gradient-to-r from-red-500 to-pink-500',
        textClass: 'text-white'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header dengan design modern */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 opacity-10 blur-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Kartu Kontrol PAB</h1>
                  <p className="text-gray-600 text-sm mt-2 font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Monitoring Progress UKMB 2026
                  </p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="group bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Memuat Data...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 font-medium">Memuat data...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">Belum ada data Camaba</p>
            <p className="text-gray-500 text-sm mt-2">Silakan import data terlebih dahulu</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Total Peserta</p>
                    <p className="text-4xl font-black text-gray-900">{processedUsers.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Lulus</p>
                    <p className="text-4xl font-black text-green-600">{users.filter(u => countChecklistCompleted(u.pab_progress) === 3).length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Lulus Bersyarat</p>
                    <p className="text-4xl font-black text-yellow-600">{users.filter(u => countChecklistCompleted(u.pab_progress) === 2).length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Tidak Lulus</p>
                    <p className="text-4xl font-black text-red-600">{users.filter(u => countChecklistCompleted(u.pab_progress) <= 1).length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-4 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-400 to-teal-500 p-2 rounded-xl shadow-md">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800">
                    Data Anggota UKMB 2026
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>{processedUsers.length} peserta</span>
                      {searchTerm && <span className="text-green-200 text-sm">({users.length} total)</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Input */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pencarian Data
                </label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition duration-500"></div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ketik Nama, NIM, atau Fakultas untuk mencari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-6 py-5 pl-20 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all text-gray-700 font-medium shadow-lg hover:shadow-xl"
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2.5 rounded-xl shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-100 hover:bg-red-200 text-red-600 p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {searchTerm && (
                  <p className="mt-3 text-sm text-gray-600 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Ditemukan {processedUsers.length} dari {users.length} peserta
                  </p>
                )}
              </div>

              <div className="mb-8 bg-gradient-to-r from-blue-50 via-green-50 to-teal-50 p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-800 text-base uppercase tracking-wide">Legenda Kategori Poin</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-green-200 hover:shadow-lg transition-all hover:-translate-y-1 duration-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md flex-shrink-0"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin &gt; 70</p>
                      <p className="text-green-600 font-extrabold text-xs">Kategori Baik</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-yellow-200 hover:shadow-lg transition-all hover:-translate-y-1 duration-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md flex-shrink-0"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin 40-70</p>
                      <p className="text-yellow-600 font-extrabold text-xs">Kategori Cukup</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-red-200 hover:shadow-lg transition-all hover:-translate-y-1 duration-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md flex-shrink-0"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin &lt; 40</p>
                      <p className="text-red-600 font-extrabold text-xs">Kategori Kurang</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border-2 border-gray-200 shadow-2xl bg-white">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white shadow-lg">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-wider">No</th>
                      <th 
                        onClick={() => handleSort('nim')}
                        className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:bg-teal-700 hover:shadow-lg transition-all duration-200 select-none group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="group-hover:scale-110 transition-transform">🎫</span>
                          <span>NIM</span>
                          {getSortIcon('nim')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('nama')}
                        className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:bg-teal-700 hover:shadow-lg transition-all duration-200 select-none group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="group-hover:scale-110 transition-transform">👤</span>
                          <span>Nama</span>
                          {getSortIcon('nama')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('fakultas')}
                        className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:bg-teal-700 hover:shadow-lg transition-all duration-200 select-none group"
                      >
                        <div className="flex items-center gap-1">
                          <span className="group-hover:scale-110 transition-transform">🏛️</span>
                          <span>Fakultas</span>
                          {getSortIcon('fakultas')}
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>📱</span>
                          <span>WhatsApp</span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>✅</span>
                          <span>Checklist PAB</span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>🎯</span>
                          <span>Total Poin</span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>🏆</span>
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-extrabold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>⚙️</span>
                          <span>Aksi</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="text-gray-600 font-medium">Tidak ada data yang sesuai dengan pencarian</p>
                          <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain</p>
                        </td>
                      </tr>
                    ) : (
                      processedUsers.map((user, index) => (
                      <tr key={user.id} className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${getRowBackgroundColor(calculateTotalPoin(user))}`}>
                        <td className="px-6 py-5 text-sm font-extrabold text-gray-900 border-r border-gray-100">{index + 1}</td>
                        <td className="px-6 py-5 text-sm text-gray-700 font-mono font-bold border-r border-gray-100">{user.nim}</td>
                        <td className="px-6 py-5 text-sm text-gray-900 font-bold border-r border-gray-100">{user.nama}</td>
                        <td className="px-6 py-5 text-sm border-r border-gray-100">
                          <span className="bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 px-4 py-2 rounded-xl text-xs font-extrabold shadow-md border border-teal-200">
                            {user.fakultas}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600 font-mono font-semibold border-r border-gray-100">{user.whatsapp}</td>
                        <td className="px-6 py-5 text-center border-r border-gray-100">
                          <div className="flex justify-center gap-4 text-3xl">
                            <span title="Wawancara" className={`transform transition-all duration-200 hover:scale-125 ${user.pab_progress?.wawancara ? 'text-green-500 drop-shadow-lg' : 'text-gray-300'}`}>🎤</span>
                            <span title="Fisik" className={`transform transition-all duration-200 hover:scale-125 ${user.pab_progress?.fisik ? 'text-green-500 drop-shadow-lg' : 'text-gray-300'}`}>🏃</span>
                            <span title="Diklat" className={`transform transition-all duration-200 hover:scale-125 ${user.pab_progress?.diklat ? 'text-green-500 drop-shadow-lg' : 'text-gray-300'}`}>📚</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center border-r border-gray-100">
                          <div className="space-y-2">
                            <span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200">
                              {calculateTotalPoin(user)}
                            </span>
                            <div className="text-xs text-gray-600 font-bold bg-gray-50 rounded-lg px-3 py-1 inline-block">
                              🎪 K:{user.jumlah_kepanitiaan || 0} | 📋 R:{user.jumlah_rapat || 0}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center border-r border-gray-100">
                          {(() => {
                            const status = getKelulusanStatus(user.pab_progress);
                            return (
                              <span className={`inline-block ${status.bgClass} ${status.textClass} px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white`}>
                                {status.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleEdit(user)}
                            className="group relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 mx-auto transform hover:scale-110 hover:-translate-y-1"
                          >
                            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    )))
                    }
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border-2 border-blue-200 transform transition-all animate-slideUp relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500"></div>
            
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 pb-4">
            <div className="flex items-center justify-between mb-8 mt-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Data Peserta
                  </h2>
                  <p className="text-gray-600 text-sm mt-1 font-medium">Perbarui informasi PAB</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-red-500 hover:bg-red-100 p-3 rounded-2xl transition-all transform hover:rotate-90 hover:scale-110 duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
            <div className="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative space-y-3">
                <p className="text-sm flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <span className="font-black text-blue-600 text-base">🎫 NIM:</span>
                  <span className="font-mono font-bold text-gray-800 text-base">{editingUser.nim}</span>
                </p>
                <p className="text-sm flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <span className="font-black text-indigo-600 text-base">👤 Nama:</span>
                  <span className="font-bold text-gray-800 text-base">{editingUser.nama}</span>
                </p>
                <p className="text-sm flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <span className="font-black text-purple-600 text-base">🏛️ Fakultas:</span>
                  <span className="font-bold text-gray-800 text-base">{editingUser.fakultas}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Jumlah Kepanitiaan */}
              <div className="relative group">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">🎪</span>
                  <span className="text-base">Jumlah Kepanitiaan <span className="text-purple-600">(x10 poin)</span></span>
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
                  <input
                    type="number"
                    min="0"
                    value={formData.jumlah_kepanitiaan}
                    onChange={(e) => setFormData({ ...formData, jumlah_kepanitiaan: e.target.value })}
                    className="relative w-full px-6 py-5 border-2 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all text-2xl font-black text-center text-purple-600 shadow-xl hover:shadow-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 hover:scale-105"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Jumlah Rapat */}
              <div className="relative group">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">📋</span>
                  <span className="text-base">Jumlah Rapat <span className="text-orange-600">(x5 poin)</span></span>
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
                  <input
                    type="number"
                    min="0"
                    value={formData.jumlah_rapat}
                    onChange={(e) => setFormData({ ...formData, jumlah_rapat: e.target.value })}
                    className="relative w-full px-6 py-5 border-2 border-orange-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-2xl font-black text-center text-orange-600 shadow-xl hover:shadow-2xl bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 hover:scale-105"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Poin Aktif */}
              <div className="relative group">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">🎯</span>
                  <span className="text-base">Total Poin Aktif</span>
                </label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
                  <input
                    type="number"
                    value={formData.poin_aktif}
                    onChange={(e) => setFormData({ ...formData, poin_aktif: e.target.value })}
                    className="relative w-full px-6 py-5 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-3xl font-black text-center text-blue-600 shadow-xl hover:shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 hover:scale-105"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status PAB */}
              <div className="bg-gradient-to-r from-green-50 via-teal-50 to-blue-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-5">
                  <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">✅</span>
                  <span className="text-lg font-black text-gray-800">Status Checklist PAB</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-r hover:from-green-100 hover:to-teal-100 hover:border-green-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105 transform duration-300">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.wawancara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, wawancara: e.target.checked }
                      })}
                      className="w-7 h-7 text-green-600 rounded-xl focus:ring-4 focus:ring-green-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1 group-hover:text-green-700 transition-colors">🎤 Wawancara</span>
                    <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{formData.pab_progress.wawancara ? '✅' : '⭕'}</span>
                  </label>

                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105 transform duration-300">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.fisik}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, fisik: e.target.checked }
                      })}
                      className="w-7 h-7 text-blue-600 rounded-xl focus:ring-4 focus:ring-blue-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1 group-hover:text-blue-700 transition-colors">🏃 Fisik</span>
                    <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{formData.pab_progress.fisik ? '✅' : '⭕'}</span>
                  </label>

                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105 transform duration-300">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.diklat}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, diklat: e.target.checked }
                      })}
                      className="w-7 h-7 text-purple-600 rounded-xl focus:ring-4 focus:ring-purple-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1 group-hover:text-purple-700 transition-colors">📚 Diklat</span>
                    <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{formData.pab_progress.diklat ? '✅' : '⭕'}</span>
                  </label>
                </div>
              </div>
            </div>
            </div>

            {/* Action Buttons - Fixed */}
            <div className="flex-shrink-0 p-6 pt-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-8 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl font-black text-base hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-xl">❌</span>
                <span>Batal</span>
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-base shadow-2xl hover:shadow-[0_20px_50px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="text-xl relative z-10">💾</span>
                <span className="relative z-10">Simpan Perubahan</span>
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KartuKontrol;
