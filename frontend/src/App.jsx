import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import KartuKontrol from './KartuKontrol';
import StatusPAB from './pages/StatusPAB';
import ImportExcel from './ImportExcel';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content with padding-top to account for fixed navbar */}
      <main className="pt-20 px-6 pb-8">
        <div className="container mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<Navigate to="/status-pab" replace />} />
            <Route path="/status-pab" element={<StatusPAB />} />
            <Route path="/kartu-kontrol" element={<KartuKontrol />} />
            <Route path="/import-excel" element={<ImportExcel />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;