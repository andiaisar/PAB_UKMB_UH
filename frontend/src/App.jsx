import { useState } from 'react'
import ImportExcel from './ImportExcel'
import KartuKontrol from './KartuKontrol'

function App() {
  const [activeTab, setActiveTab] = useState('import')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              📊 Admin Portal
            </div>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Dashboard Admin PAB
          </h1>
          <p className="text-xl text-gray-600 font-medium">Unit Kegiatan Mahasiswa Bola UH</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
            <div className="h-1 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📁 Import Data
            </button>
            <button
              onClick={() => setActiveTab('kartu')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'kartu'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Kartu Kontrol
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'import' ? <ImportExcel /> : <KartuKontrol />}
      </div>
    </div>
  )
}

export default App
