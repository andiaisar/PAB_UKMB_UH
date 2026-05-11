import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      let usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        // Hanya ambil user biasa
        if (data.role === 'admin') return null;
        
        const totalNilai = ((data.jumlah_kepanitiaan || 0) * 10) + 
                           ((data.jumlah_rapat || 0) * 2) + 
                           ((data.jumlah_latihan || 0) * 2) + 
                           (data.poin_kinerja || 0);

        return {
          id: doc.id,
          nama: data.nama || 'Tanpa Nama',
          email: data.email || 'Tanpa Email',
          totalNilai
        };
      }).filter(user => user !== null);

      // Urutkan dari nilai tertinggi ke terendah
      usersData.sort((a, b) => b.totalNilai - a.totalNilai);

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-yellow-500 rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">🏆 Papan Peringkat PAB</h1>
        <p className="text-lg text-gray-600">Tetap semangat! Berikut adalah perolehan total nilai sementara semua anggota.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Peringkat</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama Anggota</th>
                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Total Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => {
                const isTop3 = index < 3;
                let rankBadge = '';
                
                if (index === 0) rankBadge = '🥇';
                else if (index === 1) rankBadge = '🥈';
                else if (index === 2) rankBadge = '🥉';
                else rankBadge = `#${index + 1}`;

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-yellow-50 transition-colors duration-200 ${isTop3 ? 'bg-yellow-50/50' : ''}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-xl font-bold ${isTop3 ? 'text-2xl' : 'text-gray-500'}`}>
                        {rankBadge}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900 text-lg">{user.nama}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
                        isTop3 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.totalNilai}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    Belum ada data nilai peserta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}