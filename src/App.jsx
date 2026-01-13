import { useState } from 'react';
import SyncButton from './components/SyncButton';
import Dashboard from './components/Dashboard';
import PesertaTable from './components/PesertaTable';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                PAB UKM Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Sistem Manajemen Peserta UKM Universitas Hasanuddin
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Academic Year</div>
              <div className="text-lg font-semibold text-gray-800">2026</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Sync Button */}
        <SyncButton />

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📊 Dashboard & Statistik
            </button>
            <button
              onClick={() => setActiveTab('peserta')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'peserta'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              👥 Data Peserta
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'peserta' && <PesertaTable />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2026 PAB UKM Dashboard - Universitas Hasanuddin
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Firebase Connected</span>
              </div>
              <div className="text-sm text-gray-500">
                Built with React + Firebase
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
