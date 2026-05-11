import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Tampilkan pesan sukses dari registrasi
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Hapus message setelah 5 detik
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login dengan Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Ambil data user dari Firestore untuk mengetahui role
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        throw new Error('Data user tidak ditemukan di database');
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Redirect berdasarkan role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'user') {
        navigate('/dashboard-user');
      } else {
        navigate('/dashboard-user');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah');
      } else if (err.code === 'auth/user-not-found') {
        setError('User tidak ditemukan');
      } else if (err.code === 'auth/wrong-password') {
        setError('Password salah');
      } else {
        setError(err.message || 'Gagal login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-800 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-lg mb-4 overflow-hidden">
            <img src="/logo.png" alt="UKMB Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">UKMB Management System</h1>
          <p className="text-slate-300 text-sm">Sistem Monitoring PAB</p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM6.54 6.54l2.12 2.12A2 2 0 1010 6a1 1 0 00-3.46.54zm8.16 8.16l-2.12-2.12a4 4 0 00-5.656-5.656l-2.12-2.12a6 6 0 018.896 8.896zM12.828 12.828l2.12 2.12a6 6 0 01-8.896 0l2.12-2.12a4 4 0 004.656-4.656l2.12 2.12z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Belum punya akun?{' '}
              <Link to="/register" className="text-slate-700 font-semibold hover:text-slate-900">
                Daftar di sini
              </Link>
            </p>
            <p className="text-xs text-gray-500 text-center">
              For access issues, please contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
