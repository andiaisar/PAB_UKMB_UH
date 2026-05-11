import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * CONTOH IMPLEMENTASI NAVIGASI BERDASARKAN ROLE
 * File ini menunjukkan berbagai cara navigate dan conditional rendering
 */

// ============================================================
// 1. SMART NAVIGATION BASED ON ROLE
// ============================================================

export function SmartNavigation() {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    // Navigate ke dashboard yang sesuai dengan role
    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'user') {
      navigate('/dashboard-user');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">UKMB System</h1>
        
        <div className="space-x-4">
          <button
            onClick={handleDashboardClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// 2. CONDITIONAL NAVIGATION MENU
// ============================================================

export function ConditionalMenu() {
  const { userRole, userData } = useAuth();

  return (
    <aside className="w-64 bg-gray-100 p-4 space-y-4">
      <div className="p-4 bg-white rounded">
        <p className="text-sm text-gray-600">Logged in as:</p>
        <p className="font-semibold">{userData?.nama}</p>
        <p className="text-sm text-gray-500">Role: {userRole}</p>
      </div>

      <nav className="space-y-2">
        {/* Menu untuk ADMIN */}
        {userRole === 'admin' && (
          <>
            <h3 className="font-bold text-gray-700 px-4 py-2">Admin Menu</h3>
            <Link
              to="/admin/dashboard"
              className="block px-4 py-2 hover:bg-gray-200 rounded"
            >
              📊 Admin Dashboard
            </Link>
            <Link
              to="/kartu-kontrol"
              className="block px-4 py-2 hover:bg-gray-200 rounded"
            >
              📋 Kartu Kontrol
            </Link>
            <Link
              to="/import-excel"
              className="block px-4 py-2 hover:bg-gray-200 rounded"
            >
              📤 Import Excel
            </Link>
          </>
        )}

        {/* Menu untuk USER */}
        {userRole === 'user' && (
          <>
            <h3 className="font-bold text-gray-700 px-4 py-2">User Menu</h3>
            <Link
              to="/dashboard-user"
              className="block px-4 py-2 hover:bg-gray-200 rounded"
            >
              📊 My Dashboard
            </Link>
          </>
        )}

        {/* Menu umum */}
        <hr />
        <Link
          to="/profile"
          className="block px-4 py-2 hover:bg-gray-200 rounded"
        >
          👤 Profile
        </Link>
        <Link
          to="/settings"
          className="block px-4 py-2 hover:bg-gray-200 rounded"
        >
          ⚙️ Settings
        </Link>
      </nav>
    </aside>
  );
}

// ============================================================
// 3. ROLE-BASED CONTENT DISPLAY
// ============================================================

export function RoleBasedContent() {
  const { userRole, userData } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {userData?.nama}!</h2>
        
        {userRole === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-4">
            <h3 className="font-semibold text-blue-900">👨‍💼 Admin Features</h3>
            <p className="text-blue-800">Anda memiliki akses admin untuk mengelola sistem</p>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Mengelola pengguna</li>
              <li>Melihat laporan</li>
              <li>Import/Export data</li>
              <li>Mengubah pengaturan sistem</li>
            </ul>
            <Link
              to="/admin/dashboard"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Go to Admin Panel
            </Link>
          </div>
        )}

        {userRole === 'user' && (
          <div className="bg-green-50 border border-green-200 rounded p-4 space-y-4">
            <h3 className="font-semibold text-green-900">👤 User Features</h3>
            <p className="text-green-800">Anda dapat mengakses fitur standar aplikasi</p>
            <ul className="list-disc list-inside space-y-2 text-green-800">
              <li>Melihat dashboard personal</li>
              <li>Mengubah profile</li>
              <li>Melihat data penjualan</li>
            </ul>
            <Link
              to="/dashboard-user"
              className="inline-block mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Go to My Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Info Box berdasarkan Role */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800">
          <strong>Current Role:</strong> {userRole?.toUpperCase()}
        </p>
        <p className="text-yellow-800 text-sm mt-2">
          {userRole === 'admin' 
            ? 'Anda adalah administrator sistem. Gunakan akses admin dengan bijak.'
            : 'Anda adalah pengguna biasa. Hubungi admin untuk upgrade akses.'
          }
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 4. PROTECTED BUTTON COMPONENT
// ============================================================

export function ProtectedButton({ 
  requiredRole, 
  children, 
  onClick, 
  className = '',
  ...props 
}) {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Jika role tidak sesuai
  if (requiredRole && userRole !== requiredRole) {
    return (
      <button
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
        title={`Hanya ${requiredRole} yang bisa mengakses`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage Example:
// <ProtectedButton
//   requiredRole="admin"
//   onClick={() => navigate('/import-excel')}
//   className="px-4 py-2 bg-blue-600 text-white rounded"
// >
//   Import Excel
// </ProtectedButton>

// ============================================================
// 5. PROTECTED LINK COMPONENT
// ============================================================

export function ProtectedLink({ 
  requiredRole, 
  to, 
  children, 
  className = '',
  ...props 
}) {
  const { userRole } = useAuth();

  // Jika role tidak sesuai
  if (requiredRole && userRole !== requiredRole) {
    return (
      <span
        className={`opacity-50 cursor-not-allowed ${className}`}
        title={`Hanya ${requiredRole} yang bisa mengakses`}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

// Usage Example:
// <ProtectedLink
//   requiredRole="admin"
//   to="/kartu-kontrol"
//   className="text-blue-600 hover:underline"
// >
//   Kartu Kontrol
// </ProtectedLink>

// ============================================================
// 6. COMPLETE LAYOUT EXAMPLE
// ============================================================

export function CompleteLayoutExample() {
  const { userRole, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">UKMB</h2>
          <p className="text-sm text-gray-300">Management System</p>
        </div>

        <nav className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Main</p>
            {userRole === 'admin' ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/kartu-kontrol"
                  className="block px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  📋 Kartu Kontrol
                </Link>
                <Link
                  to="/import-excel"
                  className="block px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                  📤 Import
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard-user"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                📊 Dashboard
              </Link>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Account</p>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm">
            <p className="text-gray-600">Welcome, {userData?.nama}</p>
            <p className="text-xs text-gray-400">Role: {userRole}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <RoleBasedContent />
        </div>
      </main>
    </div>
  );
}

// ============================================================
// EXPORT ALL EXAMPLES
// ============================================================

export const NavigationExamples = {
  SmartNavigation,
  ConditionalMenu,
  RoleBasedContent,
  ProtectedButton,
  ProtectedLink,
  CompleteLayoutExample,
};

export default NavigationExamples;
