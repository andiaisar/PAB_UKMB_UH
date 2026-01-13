import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [pesertaData, setPesertaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPeserta: 0,
    totalLulus: 0,
    persentaseLulus: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Real-time listener dengan onSnapshot
    const pesertaRef = collection(db, 'peserta');
    
    const unsubscribe = onSnapshot(pesertaRef, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPesertaData(data);
      calculateStats(data);
      prepareChartData(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });

    // Cleanup listener saat component unmount
    return () => unsubscribe();
  }, []);

  const calculateStats = (data) => {
    const total = data.length;
    
    // Peserta dianggap lulus jika semua tahap (1-5) sudah selesai
    const lulus = data.filter(p => 
      p.tahap_1 && p.tahap_2 && p.tahap_3 && p.tahap_4 && p.tahap_5
    ).length;
    
    const persentase = total > 0 ? ((lulus / total) * 100).toFixed(1) : 0;
    
    setStats({
      totalPeserta: total,
      totalLulus: lulus,
      persentaseLulus: persentase
    });
  };

  const prepareChartData = (data) => {
    // Hitung jumlah peserta per fakultas
    const fakultasCount = {};
    
    data.forEach(peserta => {
      const fakultas = peserta.fakultas || 'Tidak Diketahui';
      fakultasCount[fakultas] = (fakultasCount[fakultas] || 0) + 1;
    });
    
    // Convert ke format array untuk Recharts
    const chartArray = Object.keys(fakultasCount).map(fakultas => ({
      fakultas: fakultas,
      jumlah: fakultasCount[fakultas]
    }));
    
    // Sort berdasarkan jumlah (descending)
    chartArray.sort((a, b) => b.jumlah - a.jumlah);
    
    setChartData(chartArray);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Peserta */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Peserta</p>
              <p className="text-4xl font-bold mt-2">{stats.totalPeserta}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Lulus */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Lulus</p>
              <p className="text-4xl font-bold mt-2">{stats.totalLulus}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Persentase Lulus */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Persentase Lulus</p>
              <p className="text-4xl font-bold mt-2">{stats.persentaseLulus}%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - Jumlah Peserta per Fakultas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📊 Distribusi Peserta per Fakultas
        </h2>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fakultas" 
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="jumlah" 
                fill="#3b82f6" 
                name="Jumlah Peserta"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada data untuk ditampilkan</p>
            <p className="text-sm mt-2">Silakan sync data dari Google Sheet terlebih dahulu</p>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>Data diperbarui secara real-time</span>
      </div>
    </div>
  );
};

export default Dashboard;
