import React, { useState } from 'react';
import ImportExcel from './ImportExcel';
import KartuKontrol from './KartuKontrol'; // Pastikan file ini ada

function App() {
  const [activeTab, setActiveTab] = useState('kontrol'); // Default tab

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
            Sistem PAB & Kartu Kontrol UKMB
          </h1>
          <p className="text-gray-600 font-medium">Dashboard Evaluasi Keaktifan Anggota</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md flex space-x-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'import'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              📥 Import Data (Excel)
            </button>
            <button
              onClick={() => setActiveTab('kontrol')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'kontrol'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              📋 Kartu Kontrol Keaktifan
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-300">
          {activeTab === 'import' && <ImportExcel />}
          {activeTab === 'kontrol' && <KartuKontrol />}
        </div>
      </div>
    </div>
  );
}

export default App;