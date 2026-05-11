import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import KartuKontrol from './KartuKontrol';
import ImportExcel from './ImportExcel';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import DashboardUser from './pages/DashboardUser';
import Leaderboard from './pages/Leaderboard';

function MainApp() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full animate-bounce mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ========================================
          PUBLIC ROUTES (Tidak memerlukan login)
          ======================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ========================================
          PROTECTED ROUTES - USER ONLY
          ======================================== */}
      <Route
        path="/dashboard-user"
        element={
          <ProtectedRoute requiredRole="user">
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
                <div className="container mx-auto max-w-7xl">
                  <DashboardUser />
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/peringkat"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
                <div className="container mx-auto max-w-7xl">
                  <Leaderboard />
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* ========================================
          PROTECTED ROUTES - ADMIN ONLY
          ======================================== */}
      <Route
        path="/kartu-kontrol"
        element={
          <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
                <div className="container mx-auto max-w-7xl">
                  <KartuKontrol />
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
                <div className="container mx-auto max-w-7xl">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Selamat datang di admin dashboard</p>
                  </div>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/import-excel"
        element={
          <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
                <div className="container mx-auto max-w-7xl">
                  <ImportExcel />
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* ========================================
          DEFAULT REDIRECT
          ======================================== */}
      <Route path="/" element={<Navigate to="/dashboard-user" replace />} />
      <Route path="*" element={<Navigate to="/dashboard-user" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;