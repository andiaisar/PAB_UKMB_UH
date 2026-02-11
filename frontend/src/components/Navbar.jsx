import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error:', error);
        alert('Gagal logout: ' + error.message);
      }
    }
  };

  const navItems = [
    { path: '/status-pab', label: 'Status PAB', icon: '📋' },
    { path: '/kartu-kontrol', label: 'Kartu Kontrol', icon: '🏆' },
    { path: '/import-excel', label: 'Import Excel', icon: '📊' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800 shadow-lg z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-lg overflow-hidden">
              <img src="/logo.png" alt="UKMB Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">UKMB Management</h1>
              <p className="text-xs text-slate-300">Sistem Monitoring PAB</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 px-5 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
