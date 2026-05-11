import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, updateProfilePicture } from '../utils/authUtils';

/**
 * EXTENDED DASHBOARD USER EXAMPLES
 * File ini menunjukkan berbagai cara memperluas DashboardUser component
 */

// ============================================================
// 1. EDIT PROFILE SECTION (Optional Addition)
// ============================================================

export function EditProfileSection() {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: userData?.nama || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateUserProfile(user.uid, {
        nama: formData.nama,
      });

      if (result.success) {
        setMessage('Profil berhasil diperbarui!');
        setIsEditing(false);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Edit Profil
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-4 bg-gray-50 p-4 rounded">
      <input
        type="text"
        value={formData.nama}
        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />
      
      {message && <div className="text-sm text-blue-600">{message}</div>}
      
      <div className="space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ============================================================
// 2. PERFORMANCE ANALYTICS (Optional Addition)
// ============================================================

export function PerformanceAnalytics({ userData }) {
  const scores = [
    userData.nilai?.fisik || 0,
    userData.nilai?.wawancara || 0,
    userData.nilai?.pengetahuan || 0,
    userData.nilai?.presentasi || 0,
  ];

  const highest = Math.max(...scores);
  const lowest = Math.min(...scores.filter(s => s > 0));
  const average = (scores.reduce((a, b) => a + b) / 4).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">📊 Analisis Performa</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Nilai Tertinggi</p>
          <p className="text-3xl font-bold text-green-600">{highest}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Rata-Rata</p>
          <p className="text-3xl font-bold text-blue-600">{average}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded">
          <p className="text-sm text-gray-600">Nilai Terendah</p>
          <p className="text-3xl font-bold text-orange-600">{lowest || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">Insight:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li>Fokus pada area dengan nilai terendah</li>
          <li>Pertahankan performa di area terbaik</li>
          <li>Target rata-rata score adalah 85+</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// 3. ACTIVITY TIMELINE (Optional Addition)
// ============================================================

export function ActivityTimeline({ userData }) {
  const activities = [
    {
      date: userData.createdAt,
      title: 'Akun Dibuat',
      description: 'Akun Anda telah terdaftar dalam sistem',
      icon: '✨',
    },
    {
      date: userData.updatedAt,
      title: 'Profil Diperbarui',
      description: 'Nilai atau profil terakhir diperbarui',
      icon: '📝',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">📅 Timeline Aktivitas</h3>
      
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex space-x-4">
            <div className="text-2xl">{activity.icon}</div>
            <div>
              <p className="font-semibold text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.date).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4. CERTIFICATES SECTION (Optional Addition)
// ============================================================

export function CertificatesSection() {
  const certificates = [
    {
      name: 'Certificate of Excellence',
      issued: '2024-01-15',
      issuer: 'UKMB Management',
    },
    {
      name: 'Performance Badge',
      issued: '2024-02-20',
      issuer: 'UKMB Management',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">🎖️ Sertifikat & Badge</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {certificates.length > 0 ? (
          certificates.map((cert, idx) => (
            <div key={idx} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <p className="font-semibold text-gray-900">{cert.name}</p>
              <p className="text-sm text-gray-600 mt-1">Dikeluarkan: {cert.issuer}</p>
              <p className="text-xs text-gray-500 mt-1">{cert.issued}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-2">Belum ada sertifikat</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 5. QUICK STATS WIDGET (Optional Addition)
// ============================================================

export function QuickStatsWidget({ userData }) {
  const stats = [
    {
      label: 'Total Poin',
      value: (userData.nilai?.fisik || 0) + (userData.nilai?.wawancara || 0) + 
             (userData.nilai?.pengetahuan || 0) + (userData.nilai?.presentasi || 0),
      unit: 'poin',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Kategori Terbaik',
      value: 'Pengetahuan',
      unit: userData.nilai?.pengetahuan || 0,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Persentase Kompletion',
      value: '100',
      unit: '%',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className={`${stat.color} rounded-lg p-4`}>
          <p className="text-sm font-semibold opacity-75">{stat.label}</p>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
          <p className="text-xs opacity-75 mt-1">{stat.unit}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 6. GOALS & ASPIRATIONS (Optional Addition)
// ============================================================

export function GoalsSection() {
  const goals = [
    {
      title: 'Capai Rata-Rata 90',
      target: 90,
      current: 85.25,
      progress: 94.72,
    },
    {
      title: 'Maksimalkan Fisik',
      target: 100,
      current: 85,
      progress: 85,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">🎯 Tujuan Saya</h3>
      
      <div className="space-y-4">
        {goals.map((goal, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-900">{goal.title}</p>
              <p className="text-sm text-gray-600">{goal.current}/{goal.target}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{goal.progress.toFixed(1)}% tercapai</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 7. NOTIFICATIONS SECTION (Optional Addition)
// ============================================================

export function NotificationsSection() {
  const notifications = [
    {
      type: 'success',
      title: 'Nilai Diperbarui',
      message: 'Nilai wawancara Anda telah diperbarui menjadi 78',
      icon: '✓',
    },
    {
      type: 'info',
      title: 'Reminder',
      message: 'Pastikan nilai Anda sudah dilihat oleh administrator',
      icon: 'ℹ',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">🔔 Notifikasi</h3>
      
      <div className="space-y-3">
        {notifications.map((notif, idx) => (
          <div key={idx} className={`${
            notif.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-blue-50 border border-blue-200'
          } rounded-lg p-4`}>
            <div className="flex space-x-3">
              <div className="text-xl">{notif.icon}</div>
              <div>
                <p className="font-semibold text-gray-900">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 8. COMPLETE EXTENDED DASHBOARD EXAMPLE
// ============================================================

export function ExtendedDashboardUser() {
  const { user, userData, loading } = useAuth();

  if (loading || !userData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Quick Stats */}
      <QuickStatsWidget userData={userData} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance */}
          <PerformanceAnalytics userData={userData} />
          
          {/* Goals */}
          <GoalsSection />
          
          {/* Timeline */}
          <ActivityTimeline userData={userData} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Certificates */}
          <CertificatesSection />
          
          {/* Notifications */}
          <NotificationsSection />
        </div>
      </div>
    </div>
  );
}

export default ExtendedDashboardUser;
