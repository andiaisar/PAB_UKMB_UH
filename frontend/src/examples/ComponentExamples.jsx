import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  updateUserProfile, 
  updateProfilePicture, 
  updateUserPassword,
  updateUserNilai,
  isValidEmail,
  getErrorMessage 
} from '../utils/authUtils';

/**
 * CONTOH PENGGUNAAN AUTHENTICATION UTILITIES
 * File ini menunjukkan bagaimana menggunakan helper functions
 */

// ============================================================
// 1. EDIT PROFILE COMPONENT EXAMPLE
// ============================================================

export function EditProfileExample() {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    nama: userData?.nama || '',
    email: userData?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateUserProfile(user.uid, {
        nama: formData.nama,
        email: formData.email,
      });

      if (result.success) {
        setMessage('Profil berhasil diperbarui!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Edit Profil</h2>
      
      {message && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Nama</label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}

// ============================================================
// 2. CHANGE PASSWORD COMPONENT EXAMPLE
// ============================================================

export function ChangePasswordExample() {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      if (passwords.newPassword.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      const result = await updateUserPassword(passwords.newPassword);

      if (result.success) {
        setMessage('Password berhasil diubah!');
        setPasswords({ newPassword: '', confirmPassword: '' });
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Ubah Password</h2>

      {message && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Password Baru</label>
        <input
          type="password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Konfirmasi Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Mengubah...' : 'Ubah Password'}
      </button>
    </form>
  );
}

// ============================================================
// 3. UPDATE PROFILE PICTURE COMPONENT EXAMPLE
// ============================================================

export function UpdateProfilePictureExample() {
  const { user, userData } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(userData?.fotoUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Ukuran file max 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage('File harus berupa gambar');
        return;
      }

      setSelectedFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Pilih file terlebih dahulu');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfilePicture(
        user.uid, 
        selectedFile, 
        userData?.fotoUrl
      );

      if (result.success) {
        setMessage('Foto profil berhasil diperbarui!');
        setSelectedFile(null);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Update Foto Profil</h2>

      {message && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          className="w-32 h-32 rounded-full object-cover border-2 border-blue-300"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full px-3 py-2 border rounded"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Mengupload...' : 'Upload Foto'}
      </button>
    </div>
  );
}

// ============================================================
// 4. UPDATE NILAI/SCORE COMPONENT EXAMPLE
// ============================================================

export function UpdateNilaiExample() {
  const { user } = useAuth();
  const [nilai, setNilai] = useState({
    fisik: 0,
    wawancara: 0,
    pengetahuan: 0,
    presentasi: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNilaiChange = (e) => {
    const { name, value } = e.target;
    setNilai(prev => ({ 
      ...prev, 
      [name]: Math.min(100, Math.max(0, parseInt(value) || 0))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateUserNilai(user.uid, nilai);

      if (result.success) {
        setMessage('Nilai berhasil diperbarui!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Update Nilai</h2>

      {message && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {Object.entries(nilai).map(([key, value]) => (
        <div key={key}>
          <label className="block text-sm font-semibold mb-1 capitalize">
            {key}: {value}/100
          </label>
          <input
            type="range"
            name={key}
            min="0"
            max="100"
            value={value}
            onChange={handleNilaiChange}
            className="w-full"
          />
          <input
            type="number"
            name={key}
            min="0"
            max="100"
            value={value}
            onChange={handleNilaiChange}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan Nilai'}
      </button>
    </form>
  );
}

// ============================================================
// 5. USER LIST COMPONENT EXAMPLE (Admin Only)
// ============================================================

export function UserListExample() {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'admin') {
      return;
    }

    // Fetch users dari Firestore
    // Gunakan getAllUsers() dari authUtils
    // setUsers(result.data);
    // setLoading(false);
  }, [userRole]);

  if (userRole !== 'admin') {
    return <div>Hanya admin yang dapat melihat halaman ini</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <h2 className="text-2xl font-bold">Daftar User</h2>

      {loading ? (
        <div>Memuat...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Nama</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td className="border p-2">{u.nama}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.role}</td>
                  <td className="border p-2 space-x-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMBINED PROFILE PAGE EXAMPLE
// ============================================================

export function UserProfilePageExample() {
  const { user, userData } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        {/* Header dengan foto */}
        <div className="flex items-center space-x-6">
          {userData?.fotoUrl && (
            <img 
              src={userData.fotoUrl} 
              alt={userData.nama}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{userData?.nama}</h1>
            <p className="text-gray-600">{userData?.email}</p>
            <p className="text-sm text-gray-500">Role: {userData?.role}</p>
          </div>
        </div>

        {/* Nilai/Score */}
        {userData?.nilai && (
          <div>
            <h2 className="text-xl font-bold mb-4">Nilai</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(userData.nilai).map(([key, value]) => (
                <div key={key} className="bg-blue-50 p-4 rounded text-center">
                  <p className="text-sm text-gray-600 capitalize">{key}</p>
                  <p className="text-2xl font-bold text-blue-600">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forms */}
        <div className="grid md:grid-cols-2 gap-8">
          <UpdateProfilePictureExample />
          <ChangePasswordExample />
        </div>

        <EditProfileExample />
      </div>
    </div>
  );
}

export default UserProfilePageExample;
