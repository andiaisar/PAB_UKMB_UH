import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

function KartuKontrol() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    poin_aktif: 0,
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
        pab_progress: formData.pab_progress
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, poin_aktif: parseInt(formData.poin_aktif), pab_progress: formData.pab_progress }
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
      if (!sortConfig.key) return 0;
      
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
    });

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1">🔼</span> : 
      <span className="ml-1">🔽</span>;
  };

  return (
    <div className="container mx-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border-2 border-gray-100 backdrop-blur-lg">
        {/* Header dengan card design */}
        <div className="bg-gradient-to-r from-green-500 via-teal-500 to-green-600 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Kartu Kontrol PAB</h1>
                <p className="text-green-50 text-sm mt-1">✨ Monitoring Progress Camaba</p>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Memuat...' : 'Refresh'}</span>
            </button>
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-400 to-teal-500 p-2 rounded-xl shadow-md">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800">
                    Data Camaba
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
              <div className="mb-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔎 Cari berdasarkan Nama, NIM, atau Fakultas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-6 py-4 pl-14 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-400 outline-none transition-all text-gray-700 font-medium shadow-lg hover:shadow-xl"
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="bg-gradient-to-br from-green-400 to-teal-500 p-2 rounded-lg shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-2xl border-2 border-gray-200 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Kategori Poin</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border-2 border-green-200">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700 font-semibold text-sm">Poin &gt; 70 <span className="text-green-600 font-bold">(Baik)</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border-2 border-yellow-200">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700 font-semibold text-sm">Poin 40-70 <span className="text-yellow-600 font-bold">(Cukup)</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border-2 border-red-200">
                    <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700 font-semibold text-sm">Poin &lt; 40 <span className="text-red-600 font-bold">(Kurang)</span></span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 shadow-2xl">
                <table className="min-w-full bg-white">
                  <thead className="bg-gradient-to-r from-green-600 via-teal-600 to-green-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">No</th>
                      <th 
                        onClick={() => handleSort('nim')}
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-green-700 transition-colors select-none"
                      >
                        <div className="flex items-center">
                          NIM {getSortIcon('nim')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('nama')}
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-green-700 transition-colors select-none"
                      >
                        <div className="flex items-center">
                          Nama {getSortIcon('nama')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('fakultas')}
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-green-700 transition-colors select-none"
                      >
                        <div className="flex items-center">
                          Fakultas {getSortIcon('fakultas')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">WhatsApp</th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Status PAB</th>
                      <th 
                        onClick={() => handleSort('poin_aktif')}
                        className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-green-700 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center">
                          Total Poin {getSortIcon('poin_aktif')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="text-gray-600 font-medium">Tidak ada data yang sesuai dengan pencarian</p>
                          <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain</p>
                        </td>
                      </tr>
                    ) : (
                      processedUsers.map((user, index) => (
                      <tr key={user.id} className={`transition-colors duration-200 ${getRowBackgroundColor(user.poin_aktif || 0)}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{user.nim}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.nama}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {user.fakultas}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.whatsapp}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-600 mb-1">Wawancara</span>
                              <span className="text-xl">{user.pab_progress?.wawancara ? '✅' : '❌'}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-600 mb-1">Fisik</span>
                              <span className="text-xl">{user.pab_progress?.fisik ? '✅' : '❌'}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-600 mb-1">Diklat</span>
                              <span className="text-xl">{user.pab_progress?.diklat ? '✅' : '❌'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                            {user.poin_aktif || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEdit(user)}
                            className="group relative bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 mx-auto transform hover:scale-105"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </>
        )}
      </div>

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 border-2 border-gray-200 transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">
                  Edit Data
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all transform hover:rotate-90 duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200 shadow-inner">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-bold text-blue-600">🎫 NIM:</span>
                  <span className="font-mono font-semibold text-gray-800">{editingUser.nim}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-bold text-blue-600">👤 Nama:</span>
                  <span className="font-semibold text-gray-800">{editingUser.nama}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-bold text-blue-600">🏛️ Fakultas:</span>
                  <span className="font-semibold text-gray-800">{editingUser.fakultas}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Poin Aktif */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg text-xs">🎯</span>
                  Total Poin Aktif
                </label>
                <input
                  type="number"
                  value={formData.poin_aktif}
                  onChange={(e) => setFormData({ ...formData, poin_aktif: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-2xl font-extrabold text-center text-blue-600 shadow-lg hover:shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50"
                  placeholder="0"
                />
              </div>

              {/* Status PAB */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-lg text-xs">✅</span>
                  Status PAB
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 hover:border-green-300 cursor-pointer transition-all shadow-md hover:shadow-lg group">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.wawancara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, wawancara: e.target.checked }
                      })}
                      className="w-6 h-6 text-green-600 rounded-lg focus:ring-2 focus:ring-green-500 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-bold flex-1 group-hover:text-green-700">Wawancara</span>
                    <span className="text-2xl transform group-hover:scale-110 transition-transform">{formData.pab_progress.wawancara ? '✅' : '❌'}</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 cursor-pointer transition-all shadow-md hover:shadow-lg group">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.fisik}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, fisik: e.target.checked }
                      })}
                      className="w-6 h-6 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-bold flex-1 group-hover:text-blue-700">Fisik</span>
                    <span className="text-2xl transform group-hover:scale-110 transition-transform">{formData.pab_progress.fisik ? '✅' : '❌'}</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 cursor-pointer transition-all shadow-md hover:shadow-lg group">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.diklat}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, diklat: e.target.checked }
                      })}
                      className="w-6 h-6 text-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-bold flex-1 group-hover:text-purple-700">Diklat</span>
                    <span className="text-2xl transform group-hover:scale-110 transition-transform">{formData.pab_progress.diklat ? '✅' : '❌'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 hover:border-gray-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ❌ Batal
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                💾 Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KartuKontrol;
