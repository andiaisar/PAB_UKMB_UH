import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function StatusPAB() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    pab_progress: {
      wawancara: false,
      fisik: false,
      kemampuan: false,
      diklat: false
    },
    nilai_wawancara: 0,
    nilai_fisik: 0,
    nilai_kemampuan: 0,
    catatan_atlet: ''
  });
  const [antrianRefresh, setAntrianRefresh] = useState(0);

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

  const countChecklistCompleted = (pabProgress) => {
    if (!pabProgress) return 0;
    let count = 0;
    if (pabProgress.wawancara) count++;
    if (pabProgress.fisik) count++;
    if (pabProgress.kemampuan) count++;
    if (pabProgress.diklat) count++;
    return count;
  };

  const getKelulusanStatus = (pabProgress) => {
    const completed = countChecklistCompleted(pabProgress);
    
    if (completed === 4) {
      return {
        text: '✅ LULUS',
        bgClass: 'bg-gradient-to-r from-green-500 to-teal-500',
        textClass: 'text-white',
        weight: 4
      };
    } else if (completed === 3) {
      return {
        text: '⚠️ LULUS BERSYARAT',
        bgClass: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        textClass: 'text-white',
        weight: 3
      };
    } else {
      return {
        text: '❌ TIDAK LULUS',
        bgClass: 'bg-gradient-to-r from-red-500 to-pink-500',
        textClass: 'text-white',
        weight: 1
      };
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      pab_progress: {
        wawancara: user.pab_progress?.wawancara || false,
        fisik: user.pab_progress?.fisik || false,
        kemampuan: user.pab_progress?.kemampuan || false,
        diklat: user.pab_progress?.diklat || false
      },
      nilai_wawancara: user.nilai_wawancara || 0,
      nilai_fisik: user.nilai_fisik || 0,
      nilai_kemampuan: user.nilai_kemampuan || 0,
      catatan_atlet: user.catatan_atlet || ''
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setFormData({
      pab_progress: {
        wawancara: false,
        fisik: false,
        kemampuan: false,
        diklat: false
      },
      nilai_wawancara: 0,
      nilai_fisik: 0,
      nilai_kemampuan: 0,
      catatan_atlet: ''
    });
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    // Validasi nilai
    const nilaiWawancara = parseFloat(formData.nilai_wawancara) || 0;
    const nilaiFisik = parseFloat(formData.nilai_fisik) || 0;
    const nilaiKemampuan = parseFloat(formData.nilai_kemampuan) || 0;

    if (nilaiWawancara < 0 || nilaiWawancara > 30) {
      alert('Nilai Wawancara harus antara 0-30!');
      return;
    }
    if (nilaiFisik < 0 || nilaiFisik > 30) {
      alert('Nilai Fisik harus antara 0-30!');
      return;
    }
    if (nilaiKemampuan < 0 || nilaiKemampuan > 40) {
      alert('Nilai Kemampuan harus antara 0-40!');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', editingUser.id);
      await updateDoc(userDocRef, {
        pab_progress: formData.pab_progress,
        nilai_wawancara: nilaiWawancara,
        nilai_fisik: nilaiFisik,
        nilai_kemampuan: nilaiKemampuan,
        catatan_atlet: formData.catatan_atlet
      });

      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              pab_progress: formData.pab_progress,
              nilai_wawancara: nilaiWawancara,
              nilai_fisik: nilaiFisik,
              nilai_kemampuan: nilaiKemampuan,
              catatan_atlet: formData.catatan_atlet
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

  const handleAntre = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      const timestamp = new Date().toISOString();
      
      await updateDoc(userDocRef, {
        wawancara_timestamp: timestamp
      });

      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, wawancara_timestamp: timestamp }
          : u
      ));

      setAntrianRefresh(prev => prev + 1);
      alert(`${user.nama} berhasil masuk antrian wawancara!`);
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Gagal menambahkan ke antrian: ' + error.message);
    }
  };


  // Filter untuk antrian wawancara
  const antrianWawancara = users
    .filter(user => {
      // Hanya tampilkan yang sudah antre tapi belum lulus wawancara
      return user.wawancara_timestamp && !user.pab_progress?.wawancara;
    })
    .sort((a, b) => {
      // Urutkan berdasarkan timestamp (FIFO - First In First Out)
      const timeA = new Date(a.wawancara_timestamp).getTime();
      const timeB = new Date(b.wawancara_timestamp).getTime();
      return timeA - timeB;
    });

  // Process users: filter by search term, filter by status, and sort by checklist completion
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
    .filter(user => {
      if (filterStatus === 'all') return true;
      const completed = countChecklistCompleted(user.pab_progress);
      if (filterStatus === 'lulus') return completed === 4;
      if (filterStatus === 'bersyarat') return completed === 3;
      if (filterStatus === 'tidak-lulus') return completed <= 2;
      return true;
    })
    .sort((a, b) => {
      // Urutkan berdasarkan jumlah checklist (tinggi ke rendah)
      const countA = countChecklistCompleted(a.pab_progress);
      const countB = countChecklistCompleted(b.pab_progress);
      
      if (countA !== countB) {
        return countB - countA;
      }
      
      // Jika sama, urutkan berdasarkan nama (A-Z)
      const namaA = (a.nama || '').toLowerCase();
      const namaB = (b.nama || '').toLowerCase();
      
      if (namaA < namaB) return -1;
      if (namaA > namaB) return 1;
      return 0;
    });

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
      <div className="mb-6 md:mb-8 px-2 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Status PAB - Monitoring Semua Peserta</h2>
        <p className="text-sm md:text-base text-gray-600">Progress Tahapan Wajib (Wawancara, Fisik, Kemampuan, Diklat) & Status Kelulusan</p>
        <div className="mt-3 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-green-800 font-bold flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span><strong>Syarat LULUS:</strong> Minimal 3 checklist tercapai + <strong className="text-green-600">Diklat WAJIB Hadir</strong></span>
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Data</h3>
          <p className="text-gray-600">
            Silakan import data terlebih dahulu melalui menu Import.
          </p>
        </div>
      ) : (
        <>
          {/* Antrian Wawancara */}
          {antrianWawancara.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 shadow-lg border-2 border-purple-300 mb-6 md:mb-8 mx-2 md:mx-0">
              <div className="flex items-center gap-2 md:gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 md:p-3 rounded-xl shadow-lg">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-black text-gray-800">🎤 Antrian Wawancara Hari Ini</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Total {antrianWawancara.length} peserta sedang menunggu</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">No. Antrian</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">NIM</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Fakultas</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Waktu Antre</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Durasi Tunggu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {antrianWawancara.map((user, index) => {
                        const antrianTime = new Date(user.wawancara_timestamp);
                        const now = new Date();
                        const waitMinutes = Math.floor((now - antrianTime) / 1000 / 60);
                        
                        return (
                          <tr key={user.id} className={`${
                            index === 0 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-purple-50 transition-colors`}>
                            <td className="px-4 py-3 text-sm font-black text-purple-700">
                              {index === 0 ? (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                                  🔥 SELANJUTNYA
                                </span>
                              ) : (
                                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                                  #{index + 1}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono font-bold text-gray-800">{user.nim}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">{user.nama}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {user.fakultas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                              {antrianTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`font-bold ${
                                waitMinutes > 30 ? 'text-red-600' : 
                                waitMinutes > 15 ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {waitMinutes} menit
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 px-2 md:px-0">
            <div className="bg-white rounded-lg shadow p-3 md:p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Total Peserta</p>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">Semua Camaba</p>
                </div>
                <div className="bg-indigo-100 p-2 md:p-3 rounded-lg self-end md:self-auto">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-3 md:p-6 border border-green-200">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Lulus</p>
                  <p className="text-2xl md:text-4xl font-bold text-green-600">{users.filter(u => countChecklistCompleted(u.pab_progress) === 4).length}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">4 Checklist</p>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-lg self-end md:self-auto">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-3 md:p-6 border border-yellow-200">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Lulus Bersyarat</p>
                  <p className="text-2xl md:text-4xl font-bold text-yellow-600">{users.filter(u => countChecklistCompleted(u.pab_progress) === 3).length}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">3 Checklist</p>
                </div>
                <div className="bg-yellow-100 p-2 md:p-3 rounded-lg self-end md:self-auto">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-3 md:p-6 border border-red-200">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="text-gray-600 text-xs md:text-sm font-semibold mb-1">Tidak Lulus</p>
                  <p className="text-2xl md:text-4xl font-bold text-red-600">{users.filter(u => countChecklistCompleted(u.pab_progress) <= 2).length}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">0-2 Checklist</p>
                </div>
                <div className="bg-red-100 p-2 md:p-3 rounded-lg self-end md:self-auto">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border border-gray-200 mx-2 md:mx-0">
            {/* Search and Filter */}
            <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
              {/* Search Input */}
              <div>
                <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-700 mb-3">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full px-4 md:px-6 py-3 md:py-4 pl-12 md:pl-14 pr-10 md:pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all text-sm md:text-base text-gray-700 font-medium shadow-lg"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-xl">
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

              {/* Filter by Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Berdasarkan Status Kelulusan
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterStatus === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua ({users.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('lulus')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterStatus === 'lulus'
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    ✅ Lulus ({users.filter(u => countChecklistCompleted(u.pab_progress) === 4).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('bersyarat')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterStatus === 'bersyarat'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    ⚠️ Bersyarat ({users.filter(u => getKelulusanStatus(u.pab_progress).text === '⚠️ LULUS BERSYARAT').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('tidak-lulus')}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterStatus === 'tidak-lulus'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    ❌ Tidak Lulus ({users.filter(u => getKelulusanStatus(u.pab_progress).text === '❌ TIDAK LULUS').length})
                  </button>
                </div>
              </div>

              {/* Info */}
              {(searchTerm || filterStatus !== 'all') && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Menampilkan {processedUsers.length} dari {users.length} peserta
                  </p>
                </div>
              )}

              {/* Legenda Status */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-gray-800 text-sm uppercase">Kriteria Status Kelulusan</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-green-200">
                    <span className="text-lg">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-700">LULUS</p>
                      <p className="text-xs text-gray-600">Minimal 3 checklist tercapai + <strong className="text-green-600">Diklat Hadir (Wajib)</strong></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-yellow-200">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-700">LULUS BERSYARAT</p>
                      <p className="text-xs text-gray-600">2 checklist saja, atau 3+ checklist tapi <strong className="text-yellow-600">Diklat tidak hadir</strong></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-red-200">
                    <span className="text-lg">❌</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-700">TIDAK LULUS</p>
                      <p className="text-xs text-gray-600">Kurang dari 2 checklist tercapai</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-4 md:mx-0 md:rounded-lg border-t md:border border-gray-300 bg-white">
              <table className="min-w-full">
                <thead className="bg-indigo-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      NIM
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Fakultas
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Wawancara
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Tes Fisik
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Tes Kemampuan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Diklat
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Total Skor PAB
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider border-b border-indigo-800">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center bg-gray-50">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-gray-600 font-medium">Tidak ada data yang sesuai dengan filter</p>
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((user, index) => {
                      const status = getKelulusanStatus(user.pab_progress);
                      const completed = countChecklistCompleted(user.pab_progress);
                      const progress = Math.round((completed / 4) * 100);
                      
                      // Hitung total skor PAB
                      const nilaiWawancara = user.nilai_wawancara || 0;
                      const nilaiFisik = user.nilai_fisik || 0;
                      const nilaiKemampuan = user.nilai_kemampuan || 0;
                      const totalSkor = nilaiWawancara + nilaiFisik + nilaiKemampuan;
                      
                      // Tentukan warna total skor
                      let skorColor = 'text-red-600 bg-red-50';
                      if (totalSkor > 80) skorColor = 'text-green-600 bg-green-50';
                      else if (totalSkor >= 60) skorColor = 'text-yellow-600 bg-yellow-50';
                      
                      return (
                        <tr key={user.id} className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 border-b border-gray-200">{index + 1}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-mono border-b border-gray-200">{user.nim}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <span>{user.nama}</span>
                              {totalSkor > 80 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-yellow-500 text-white shadow-md animate-pulse">
                                  ⭐ Nilai Tinggi
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm border-b border-gray-200">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {user.fakultas}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">
                                  {user.pab_progress?.wawancara ? '✅' : '⭕'}
                                </span>
                                {!user.pab_progress?.wawancara && !user.wawancara_timestamp && (
                                  <button
                                    onClick={() => handleAntre(user)}
                                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-105"
                                    title="Klik untuk masuk antrian wawancara"
                                  >
                                    Antre
                                  </button>
                                )}
                                {!user.pab_progress?.wawancara && user.wawancara_timestamp && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg border border-yellow-300">
                                    🕐 Antre
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                                {nilaiWawancara}/30
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="text-2xl">
                                {user.pab_progress?.fisik ? '✅' : '⭕'}
                              </span>
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                {nilaiFisik}/30
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="text-2xl">
                                {user.pab_progress?.kemampuan ? '✅' : '⭕'}
                              </span>
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                                {nilaiKemampuan}/40
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <span className="text-2xl">
                              {user.pab_progress?.diklat ? '✅' : '⭕'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">{completed}/4</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    progress === 100 ? 'bg-green-600' :
                                    progress >= 67 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <div className="flex flex-col items-center gap-2">
                              <span className={`text-2xl font-black ${skorColor} px-4 py-2 rounded-xl border-2`}>
                                {totalSkor}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">/100</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-gray-200">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              status.text === 'LULUS' ? 'bg-green-100 text-green-800 border border-green-200' :
                              status.text === 'LULUS BERSYARAT' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {status.text}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border-2 border-green-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500"></div>
            
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex items-center justify-between mb-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-2xl shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">Edit Status PAB</h2>
                    <p className="text-gray-600 text-sm mt-1 font-medium">Update checklist, nilai & catatan</p>
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border-2 border-green-300 shadow-xl">
                <div className="space-y-3">
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-green-600">🎫 NIM:</span>
                    <span className="font-mono font-bold text-gray-800">{editingUser.nim}</span>
                  </p>
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-teal-600">👤 Nama:</span>
                    <span className="font-bold text-gray-800">{editingUser.nama}</span>
                  </p>
                  <p className="text-sm flex items-center gap-3">
                    <span className="font-black text-blue-600">🏛️ Fakultas:</span>
                    <span className="font-bold text-gray-800">{editingUser.fakultas}</span>
                  </p>
                </div>
              </div>

              {/* Checklist PAB */}
              <div className="bg-gradient-to-r from-green-50 via-teal-50 to-blue-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-5">
                  <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">✅</span>
                  <span className="text-lg font-black text-gray-800">Checklist Tahapan PAB</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-green-100 hover:to-teal-100 hover:border-green-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.wawancara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, wawancara: e.target.checked }
                      })}
                      className="w-7 h-7 text-green-600 rounded-xl focus:ring-4 focus:ring-green-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1">🎤 Wawancara</span>
                    <span className="text-3xl">{formData.pab_progress.wawancara ? '✅' : '⭕'}</span>
                  </label>

                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.fisik}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, fisik: e.target.checked }
                      })}
                      className="w-7 h-7 text-blue-600 rounded-xl focus:ring-4 focus:ring-blue-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1">🏃 Tes Fisik</span>
                    <span className="text-3xl">{formData.pab_progress.fisik ? '✅' : '⭕'}</span>
                  </label>

                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.kemampuan}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, kemampuan: e.target.checked }
                      })}
                      className="w-7 h-7 text-indigo-600 rounded-xl focus:ring-4 focus:ring-indigo-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1">💡 Tes Kemampuan</span>
                    <span className="text-3xl">{formData.pab_progress.kemampuan ? '✅' : '⭕'}</span>
                  </label>

                  <label className="flex items-center gap-4 p-5 border-2 border-white bg-white/80 rounded-2xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 cursor-pointer transition-all shadow-lg hover:shadow-2xl group hover:scale-105">
                    <input
                      type="checkbox"
                      checked={formData.pab_progress.diklat}
                      onChange={(e) => setFormData({
                        ...formData,
                        pab_progress: { ...formData.pab_progress, diklat: e.target.checked }
                      })}
                      className="w-7 h-7 text-purple-600 rounded-xl focus:ring-4 focus:ring-purple-400 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-black text-base flex-1">📚 Diklat</span>
                    <span className="text-3xl">{formData.pab_progress.diklat ? '✅' : '⭕'}</span>
                  </label>
                </div>
              </div>

              {/* Input Nilai Tes */}
              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-5">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">📊</span>
                  <span className="text-lg font-black text-gray-800">Nilai Tes PAB</span>
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">🎤 Nilai Wawancara (Maks 30)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={formData.nilai_wawancara}
                      onChange={(e) => setFormData({ ...formData, nilai_wawancara: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all text-gray-700 font-bold"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">🏃 Nilai Fisik (Maks 30)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={formData.nilai_fisik}
                      onChange={(e) => setFormData({ ...formData, nilai_fisik: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 font-bold"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">💡 Nilai Kemampuan (Maks 40)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      step="0.5"
                      value={formData.nilai_kemampuan}
                      onChange={(e) => setFormData({ ...formData, nilai_kemampuan: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all text-gray-700 font-bold"
                      placeholder="0"
                    />
                  </div>
                  <div className="bg-white border-2 border-gray-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">Total Skor:</span>
                      <span className="text-2xl font-black text-indigo-600">
                        {(parseFloat(formData.nilai_wawancara) || 0) + (parseFloat(formData.nilai_fisik) || 0) + (parseFloat(formData.nilai_kemampuan) || 0)} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Atlet */}
              <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
                <label className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-5">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-xs shadow-lg">📝</span>
                  <span className="text-lg font-black text-gray-800">Catatan Atlet</span>
                </label>
                <textarea
                  value={formData.catatan_atlet}
                  onChange={(e) => setFormData({ ...formData, catatan_atlet: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-gray-700 font-medium resize-none"
                  placeholder="Tuliskan catatan tentang potensi atlet, kekuatan, area yang perlu ditingkatkan, dll..."
                />
              </div>

              {/* Preview Status */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Preview Status:</p>
                {(() => {
                  const previewStatus = getKelulusanStatus(formData.pab_progress);
                  const previewCompleted = countChecklistCompleted(formData.pab_progress);
                  const previewTotal = (parseFloat(formData.nilai_wawancara) || 0) + (parseFloat(formData.nilai_fisik) || 0) + (parseFloat(formData.nilai_kemampuan) || 0);
                  let previewSkorColor = 'text-red-600';
                  if (previewTotal > 80) previewSkorColor = 'text-green-600';
                  else if (previewTotal >= 60) previewSkorColor = 'text-yellow-600';
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-block ${previewStatus.bgClass} ${previewStatus.textClass} px-6 py-3 rounded-2xl font-black text-sm shadow-xl`}>
                          {previewStatus.text}
                        </span>
                        <span className="text-2xl font-black text-blue-600">{previewCompleted}/3</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl">
                        <span className="text-sm font-bold text-gray-700">Total Skor PAB:</span>
                        <span className={`text-2xl font-black ${previewSkorColor}`}>
                          {previewTotal}/100
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Actions */}
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
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl font-black shadow-2xl transition-all"
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

export default StatusPAB;
