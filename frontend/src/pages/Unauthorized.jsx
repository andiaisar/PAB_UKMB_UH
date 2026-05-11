import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden text-center">
        <div className="bg-red-50 px-8 py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 6.343a8 8 0 1 1 11.314 11.314" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">403</h1>
          <p className="text-xl font-semibold text-gray-800 mb-2">Akses Ditolak</p>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>

        <div className="px-8 py-8">
          <p className="text-sm text-gray-600 mb-6">
            Hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Kembali ke Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
