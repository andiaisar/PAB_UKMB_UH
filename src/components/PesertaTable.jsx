import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PesertaTable = () => {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFakultas, setFilterFakultas] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    // Real-time listener
    const pesertaRef = collection(db, 'peserta');
    
    const unsubscribe = onSnapshot(pesertaRef, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort berdasarkan nama
      data.sort((a, b) => a.nama?.localeCompare(b.nama));
      
      setPeserta(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle checkbox toggle
  const handleCheckboxChange = async (nimId, tahapField, currentValue) => {
    try {
      // Set loading state untuk checkbox spesifik
      setUpdating({ [`${nimId}-${tahapField}`]: true });

      const pesertaDocRef = doc(db, 'peserta', nimId);
      
      // Update field tahap di Firestore
      await updateDoc(pesertaDocRef, {
        [tahapField]: !currentValue
      });

      // Loading akan otomatis hilang karena onSnapshot akan update data
      setTimeout(() => {
        setUpdating({});
      }, 500);

    } catch (error) {
      console.error('Error updating tahap:', error);
      alert('Gagal memperbarui status tahap');
      setUpdating({});
    }
  };

  // Get unique fakultas for filter
  const uniqueFakultas = [...new Set(peserta.map(p => p.fakultas).filter(Boolean))];

  // Filter data
  const filteredPeserta = peserta.filter(p => {
    const matchSearch = searchTerm === '' || 
      p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nim?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFakultas = filterFakultas === '' || p.fakultas === filterFakultas;
    
    return matchSearch && matchFakultas;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-gray-600">Memuat data peserta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header & Filter */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          👥 Data Peserta PAB UKM
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Cari nama atau NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Fakultas */}
          <div className="md:w-64">
            <select
              value={filterFakultas}
              onChange={(e) => setFilterFakultas(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Fakultas</option>
              {uniqueFakultas.map(fakultas => (
                <option key={fakultas} value={fakultas}>{fakultas}</option>
              ))}
            </select>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-gray-600">
          Menampilkan {filteredPeserta.length} dari {peserta.length} peserta
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredPeserta.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  NIM
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fakultas
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tahap 1
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tahap 2
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tahap 3
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tahap 4
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tahap 5
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPeserta.map((p, index) => {
                const allComplete = p.tahap_1 && p.tahap_2 && p.tahap_3 && p.tahap_4 && p.tahap_5;
                
                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      allComplete ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {p.nama}
                      </div>
                      <div className="text-xs text-gray-500">{p.prodi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.nim}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {p.fakultas}
                      </span>
                    </td>
                    
                    {/* Checkbox Tahap 1-5 */}
                    {[1, 2, 3, 4, 5].map(tahap => {
                      const fieldName = `tahap_${tahap}`;
                      const isChecked = p[fieldName];
                      const isUpdating = updating[`${p.id}-${fieldName}`];
                      
                      return (
                        <td key={tahap} className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCheckboxChange(p.id, fieldName, isChecked)}
                            disabled={isUpdating}
                            className="relative inline-flex items-center justify-center"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by button onClick
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                              disabled={isUpdating}
                            />
                            {isUpdating && (
                              <svg className="absolute animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-gray-600">Tidak ada data peserta ditemukan</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || filterFakultas ? 'Coba ubah filter pencarian' : 'Silakan sync data dari Google Sheet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Real-time sync aktif</span>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ = Peserta Lulus Semua Tahap
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PesertaTable;
