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
  const [filterPoin, setFilterPoin] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    jumlah_kepanitiaan: 0,
    jumlah_rapat: 0,
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

  const calculateTotalPoin = (user) => {
    const kepanitian = (user.jumlah_kepanitiaan || 0) * STANDAR_POIN.KEPANITIAAN;
    const rapat = (user.jumlah_rapat || 0) * STANDAR_POIN.RAPAT;
    const diklat = user.pab_progress?.diklat ? STANDAR_POIN.DIKLAT : 0;
    return kepanitian + rapat + diklat;
  };

  const countChecklistCompleted = (pabProgress) => {
    if (!pabProgress) return 0;
    let count = 0;
    if (pabProgress.wawancara) count++;
    if (pabProgress.fisik) count++;
    if (pabProgress.diklat) count++;
    return count;
  };

  const getRowBackgroundColor = (poin) => {
    if (poin > 70) return 'bg-green-100 hover:bg-green-200';
    if (poin >= 40) return 'bg-yellow-100 hover:bg-yellow-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      jumlah_kepanitiaan: user.jumlah_kepanitiaan || 0,
      jumlah_rapat: user.jumlah_rapat || 0,
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setFormData({
      jumlah_kepanitiaan: 0,
      jumlah_rapat: 0,
    });
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const userDocRef = doc(db, 'users', editingUser.id);
      await updateDoc(userDocRef, {
        jumlah_kepanitiaan: parseInt(formData.jumlah_kepanitiaan),
        jumlah_rapat: parseInt(formData.jumlah_rapat),
      });

      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              jumlah_kepanitiaan: parseInt(formData.jumlah_kepanitiaan),
              jumlah_rapat: parseInt(formData.jumlah_rapat),
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

  const processedUsers = users
    // FILTER PENTING: Hanya tampilkan yang minimal 2 checklist (Lulus/Bersyarat)
    .filter(user => {
      const checklistCount = countChecklistCompleted(user.pab_progress);
      return checklistCount >= 2; // Minimal 2 checklist
    })
    .filter(user => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        user.nama?.toLowerCase().includes(search) ||
        user.nim?.toLowerCase().includes(search) ||
        user.fakultas?.toLowerCase().includes(search)
      );
    })
    .filter(user => {
      if (filterPoin === 'all') return true;
      const totalPoin = calculateTotalPoin(user);
      if (filterPoin === 'baik') return totalPoin > 70;
      if (filterPoin === 'cukup') return totalPoin >= 40 && totalPoin <= 70;
      if (filterPoin === 'kurang') return totalPoin < 40;
      return true;
    })
    .sort((a, b) => {
      if (sortConfig.key) {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
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
      
      const poinA = calculateTotalPoin(a);
      const poinB = calculateTotalPoin(b);
      
      if (poinA !== poinB) {
        return poinB - poinA;
      }
      
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

  return (
    <div className="animate-fadeIn">
      {/* Header with Export Button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Kartu Kontrol Keaktifan</h2>
          <p className="text-gray-600">Finalis: Peserta dengan Status Lulus / Lulus Bersyarat</p>
          <p className="text-sm text-indigo-600 font-medium mt-1">
            ✓ Hanya menampilkan peserta dengan minimal 2 checklist PAB
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full animate-bounce mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat data...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data</h3>
          <p className="text-gray-600">Silakan import data terlebih dahulu melalui menu Import.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Total Finalis</p>
                  <p className="text-4xl font-bold text-indigo-600">{processedUsers.length}</p>
                  <p className="text-xs text-gray-500 mt-1">≥2 Checklist</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Poin Baik</p>
                  <p className="text-4xl font-bold text-green-600">{processedUsers.filter(u => calculateTotalPoin(u) > 70).length}</p>
                  <p className="text-xs text-gray-500 mt-1">&gt; 70 poin</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-3xl">🌟</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Poin Cukup</p>
                  <p className="text-4xl font-bold text-yellow-600">{processedUsers.filter(u => calculateTotalPoin(u) >= 40 && calculateTotalPoin(u) <= 70).length}</p>
                  <p className="text-xs text-gray-500 mt-1">40-70 poin</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Poin Kurang</p>
                  <p className="text-4xl font-bold text-red-600">{processedUsers.filter(u => calculateTotalPoin(u) < 40).length}</p>
                  <p className="text-xs text-gray-500 mt-1">&lt; 40 poin</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="mb-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pencarian Data
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Ketik Nama, NIM, atau Fakultas untuk mencari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 pl-14 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium shadow-lg"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Berdasarkan Kategori Poin
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setFilterPoin('all')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterPoin === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua ({users.length})
                  </button>
                  <button
                    onClick={() => setFilterPoin('baik')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterPoin === 'baik'
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    Baik &gt;70 ({users.filter(u => calculateTotalPoin(u) > 70).length})
                  </button>
                  <button
                    onClick={() => setFilterPoin('cukup')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterPoin === 'cukup'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    Cukup 40-70 ({users.filter(u => calculateTotalPoin(u) >= 40 && calculateTotalPoin(u) <= 70).length})
                  </button>
                  <button
                    onClick={() => setFilterPoin('kurang')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterPoin === 'kurang'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Kurang &lt;40 ({users.filter(u => calculateTotalPoin(u) < 40).length})
                  </button>
                </div>
              </div>

              {(searchTerm || filterPoin !== 'all') && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Menampilkan {processedUsers.length} dari {users.length} peserta
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 via-green-50 to-teal-50 p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-800 text-base uppercase tracking-wide">Legenda Kategori Poin</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-green-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin &gt; 70</p>
                      <p className="text-green-600 font-extrabold text-xs">Kategori Baik</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-yellow-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin 40-70</p>
                      <p className="text-yellow-600 font-extrabold text-xs">Kategori Cukup</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border-2 border-red-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md"></div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm">Poin &lt; 40</p>
                      <p className="text-red-600 font-extrabold text-xs">Kategori Kurang</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
              <table className="min-w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-slate-700">No</th>
                    <th 
                      onClick={() => handleSort('nim')}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>NIM</span>
                        {getSortIcon('nim')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('nama')}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>Nama</span>
                        {getSortIcon('nama')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('fakultas')}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>Fakultas</span>
                        {getSortIcon('fakultas')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                      Kepanitiaan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                      Rapat
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                      Total Poin
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center bg-gray-50">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-gray-600 font-medium">Tidak ada data yang sesuai dengan filter</p>
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((user, index) => (
                      <tr key={user.id} className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 border-b border-gray-200">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono border-b border-gray-200">{user.nim}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium border-b border-gray-200">{user.nama}</td>
                        <td className="px-6 py-4 text-sm border-b border-gray-200">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {user.fakultas}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center border-b border-gray-200">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-bold text-purple-600">
                              {user.jumlah_kepanitiaan || 0}
                            </span>
                            <span className="text-xs text-gray-500">×10 poin</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center border-b border-gray-200">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-bold text-orange-600">
                              {user.jumlah_rapat || 0}
                            </span>
                            <span className="text-xs text-gray-500">×5 poin</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center border-b border-gray-200">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-indigo-600 text-white">
                            {calculateTotalPoin(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center border-b border-gray-200">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border-2 border-blue-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex items-center justify-between mb-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Edit Data</h2>
                    <p className="text-gray-600 text-sm mt-1 font-medium">Perbarui nilai keaktifan</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-100 p-3 rounded-2xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-300 shadow-xl">
                <div className="space-y-3">
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-blue-600">🎫 NIM:</span>
                    <span className="font-mono font-bold text-gray-800">{editingUser.nim}</span>
                  </p>
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-indigo-600">👤 Nama:</span>
                    <span className="font-bold text-gray-800">{editingUser.nama}</span>
                  </p>
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-purple-600">🏛️ Fakultas:</span>
                    <span className="font-bold text-gray-800">{editingUser.fakultas}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">🎪</span>
                    <span>Jumlah Kepanitiaan <span className="text-purple-600">(x10 poin)</span></span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.jumlah_kepanitiaan}
                    onChange={(e) => setFormData({ ...formData, jumlah_kepanitiaan: e.target.value })}
                    className="w-full px-6 py-5 border-2 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none text-2xl font-black text-center text-purple-600 shadow-xl"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">📋</span>
                    <span>Jumlah Rapat <span className="text-orange-600">(x5 poin)</span></span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.jumlah_rapat}
                    onChange={(e) => setFormData({ ...formData, jumlah_rapat: e.target.value })}
                    className="w-full px-6 py-5 border-2 border-orange-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none text-2xl font-black text-center text-orange-600 shadow-xl"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 p-6 pt-4 bg-gray-50 border-t-2 border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-8 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-lg"
                >
                  ❌ Batal
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-2xl transition-all"
                >
                  💾 Simpan
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
