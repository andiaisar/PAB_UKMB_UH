import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData } = useAuth();

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

  const navItemsAdmin = [
    { path: '/kartu-kontrol', label: 'Kartu Kontrol', icon: '📋' },
    { path: '/import-excel', label: 'Import Excel', icon: '📊' },
    { path: '/peringkat', label: 'Peringkat', icon: '🏆' },
  ];

  const navItemsUser = [
    { path: '/dashboard-user', label: 'Dashboard', icon: '🏠' },
    { path: '/peringkat', label: 'Peringkat', icon: '🏆' },
  ];

  const navItems = userData?.role === 'admin' ? navItemsAdmin : navItemsUser;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800 shadow-lg z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg shadow-lg overflow-hidden">
              <img src="/logo.png" alt="UKMB Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-white">UKMB Management</h1>
              <p className="text-xs text-slate-300">Sistem Monitoring PAB</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-base font-bold text-white">UKMB</h1>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <span>🚪</span>
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-700 mt-2">
            <div className="flex flex-col space-y-2 pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-3 ${
                    isActive(item.path)
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-4 py-3 rounded-md font-medium transition-all duration-200 flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
