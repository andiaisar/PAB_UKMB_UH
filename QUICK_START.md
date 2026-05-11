# 🚀 Quick Start Guide - Sistem Autentikasi & Role-Based Access

Panduan cepat untuk memulai menggunakan sistem autentikasi yang telah diimplementasikan.

---

## ⚡ 5 Menit Setup

### 1. Pastikan Dependency Sudah Terinstall

```bash
npm install
# atau
yarn install
```

Pastikan sudah ada:
- `react-router-dom` 
- `firebase`
- `tailwindcss` (opsional, untuk styling)

Jika belum:
```bash
npm install react-router-dom firebase
npm install -D tailwindcss postcss autoprefixer
```

### 2. Konfigurasi main.jsx

Pastikan `main.jsx` sudah menggunakan BrowserRouter:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

### 3. Selesai! 🎉

Aplikasi sudah siap:
- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/dashboard` - Dashboard user
- `/unauthorized` - Halaman akses ditolak

---

## 🧪 Testing

### Test Registrasi
1. Buka http://localhost:5173/register
2. Isi form dengan data:
   - Nama: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Pilih foto dari komputer
3. Klik "Daftar Akun"
4. Redirect ke login dengan pesan sukses

### Test Login
1. Gunakan email & password yang baru didaftar
2. Klik "Sign In"
3. Redirect ke `/dashboard` (role: user)

### Test Role Admin
1. Di Firebase Console → Firestore → users collection
2. Edit document user → ubah role dari "user" ke "admin"
3. Logout → login lagi
4. Redirect ke `/admin/dashboard`

---

## 📁 File Structure Recap

```
frontend/src/
├── firebase.js                          # Config Firebase (sudah ada)
├── App.jsx                              # Main routing [UPDATED]
├── main.jsx                             # Entry point (perlu update)
│
├── pages/
│   ├── Login.jsx                        # ✅ NEW
│   ├── Register.jsx                     # ✅ NEW
│   ├── Unauthorized.jsx                 # ✅ NEW
│   ├── Dashboard.jsx                    # (sudah ada)
│   └── StatusPAB.jsx                    # (sudah ada)
│
├── components/
│   ├── ProtectedRoute.jsx               # ✅ NEW
│   ├── Navbar.jsx                       # (sudah ada)
│   └── ...
│
├── context/
│   └── AuthContext.jsx                  # ✅ NEW
│
└── utils/
    └── authUtils.js                     # ✅ NEW
```

---

## 🔑 Key Concepts

### Auth Flow

```
User tidak login → /login atau /register
        ↓
Input credentials
        ↓
Firebase Auth ← → Firestore
        ↓
Check role
        ↓
Redirect ke dashboard sesuai role
```

### Using Auth Hook

Gunakan di component mana saja:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, userRole, userData, logout } = useAuth();
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Hello, {userData?.nama}</p>
      <p>Role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Route yang require login
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Route yang require admin
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

---

## 🎨 Customization

### Ubah Styling

Semua components menggunakan Tailwind CSS classes. Edit di:
- `pages/Login.jsx` - styling login
- `pages/Register.jsx` - styling register
- `components/ProtectedRoute.jsx` - styling loading

### Ubah Redirect URL

Di `pages/Login.jsx`, ubah redirect:
```jsx
// Baris ~58-60
if (userRole === 'admin') {
  navigate('/admin/dashboard');  // Ubah URL ke sini
} else if (userRole === 'user') {
  navigate('/dashboard');  // Atau ke sini
}
```

### Tambah Field Registration

Di `pages/Register.jsx`, tambah field dan update Firestore:
```jsx
// Tambah input
<input name="nomor_telepon" ... />

// Saat create user di Firestore:
await setDoc(doc(db, 'users', uid), {
  // ... existing fields
  nomor_telepon: formData.nomor_telepon,  // Tambah ini
});
```

---

## 🐛 Common Issues & Solutions

| Issue | Solusi |
|-------|--------|
| "App is not defined" | Import { AuthProvider } dari context, wrap app |
| "useAuth outside provider" | Gunakan AuthProvider di App.jsx |
| Role redirect tidak jalan | Check Firestore rules, pastikan role tersimpan |
| Foto tidak upload | Check Storage rules, file size, tipe file |
| Email exist error | Email sudah terdaftar, gunakan email baru |

---

## 📚 Reference Files

- **Login Logic:** [pages/Login.jsx](../src/pages/Login.jsx)
- **Register Logic:** [pages/Register.jsx](../src/pages/Register.jsx)
- **Auth Context:** [context/AuthContext.jsx](../src/context/AuthContext.jsx)
- **Protected Routes:** [components/ProtectedRoute.jsx](../src/components/ProtectedRoute.jsx)
- **Utilities:** [utils/authUtils.js](../src/utils/authUtils.js)
- **Examples:** [examples/ComponentExamples.jsx](../src/examples/ComponentExamples.jsx)

---

## 🔐 Security Checklist

- [x] Password hashed oleh Firebase
- [x] Email verification (opsional)
- [x] Role-based access control
- [x] Protected routes
- [ ] HTTPS enforce
- [ ] Rate limiting
- [ ] Session timeout
- [ ] CSRF protection

---

## 🎯 Next Steps

1. **Test semua fitur** - Register, login, role redirect
2. **Customize styling** - Sesuaikan dengan brand Anda
3. **Tambah admin panel** - Edit user, manage roles
4. **Setup email verification** - Kirim email ke user baru
5. **Add password reset** - Firebase sendPasswordResetEmail

---

## 💬 FAQ

**Q: Bagaimana cara set user jadi admin?**
A: Di Firebase Console → Firestore → users → edit document → ubah role ke "admin"

**Q: Bisa tambah role lain selain admin/user?**
A: Bisa, tapi perlu update ProtectedRoute.jsx dan login redirect logic

**Q: Foto profile max berapa ukuran?**
A: 5MB, bisa diubah di Register.jsx line ~28

**Q: User bisa ubah role sendiri?**
A: Tidak, butuh admin yang ubah di Firestore (opsional tambah updateRole function)

---

Generated: 2024
Created with ❤️ for UKMB Management System
