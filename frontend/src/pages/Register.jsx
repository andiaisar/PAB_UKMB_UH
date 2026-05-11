import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    nim: '',
    fakultas: '',
    prodi: '',
    jenis_kelamin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProgress('');
    setLoading(true);

    try {
      // Validasi input
      if (!formData.nama || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Semua field harus diisi');
      }

      if (!formData.nim || !formData.fakultas || !formData.prodi || !formData.jenis_kelamin) {
        throw new Error('NIM, Fakultas, Program Studi, dan Jenis Kelamin harus diisi');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      if (formData.password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Step 1: Buat akun Firebase Auth
      setProgress('📝 Membuat akun...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // Step 3: Simpan data user ke Firestore
      setProgress('💾 Menyimpan data profil...');
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        nama: formData.nama,
        email: formData.email,
        nim: formData.nim,
        fakultas: formData.fakultas,
        prodi: formData.prodi,
        jenis_kelamin: formData.jenis_kelamin,
        fotoUrl: '', // Foto dinonaktifkan sementara
        role: 'user', // Default role adalah 'user'
        jumlah_kepanitiaan: 0,
        jumlah_rapat: 0,
        jumlah_latihan: 0,
        poin_kinerja: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Step 4: Redirect ke login
      setProgress('✅ Berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registrasi berhasil! Data Anda telah tersimpan di Firebase. Silakan login dengan email dan password.' } });
      }, 500);
    } catch (err) {
      console.error('Register error:', err);
      setProgress('');
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Gunakan email lain atau login jika sudah punya akun.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid. Periksa kembali email Anda.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Gunakan minimal 6 karakter.');
      } else if (err.message.includes('upload foto')) {
        setError(err.message);
      } else {
        setError(err.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-800 px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-3 overflow-hidden">
            <img src="/logo.png" alt="UKMB Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Daftar Akun</h1>
          <p className="text-slate-300 text-sm">Bergabunglah dengan UKMB Management System</p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {progress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 font-medium">{progress}</p>
                </div>
              </div>
            )}

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

            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan email"
              />
            </div>

            {/* NIM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NIM (Nomor Identitas Mahasiswa)
              </label>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan NIM"
              />
            </div>

            {/* Fakultas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fakultas
              </label>
              <input
                type="text"
                name="fakultas"
                value={formData.fakultas}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan nama fakultas"
              />
            </div>

            {/* Program Studi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Program Studi (Prodi)
              </label>
              <input
                type="text"
                name="prodi"
                value={formData.prodi}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                placeholder="Masukkan program studi"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all text-gray-900"
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </span>
              ) : (
                'Daftar Akun'
              )}
            </button>

            {/* Info Storage */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">📊 Data Anda akan tersimpan di:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ <strong>Firebase Authentication</strong> - Email & Password</li>
                <li>✓ <strong>Firestore Database</strong> - Profil & nilai</li>
              </ul>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-slate-700 font-semibold hover:text-slate-900">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
