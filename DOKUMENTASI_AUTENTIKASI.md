# Dokumentasi Sistem Autentikasi & Role-Based Access Control

## 📋 Ringkasan Implementasi

Sistem autentikasi dengan dua role (`admin` dan `user`) telah diimplementasikan menggunakan Firebase Authentication dan Firestore. Berikut adalah komponen-komponen yang telah dibuat:

---

## 🗂️ Struktur File

```
frontend/src/
├── firebase.js                      # Konfigurasi Firebase
├── App.jsx                          # Main App dengan routing
├── main.jsx                         # Entry point (sudah ada)
├── pages/
│   ├── Login.jsx                    # Halaman Login
│   ├── Register.jsx                 # Halaman Registrasi
│   ├── Unauthorized.jsx             # Halaman 403 Akses Ditolak
│   ├── Dashboard.jsx                # (sudah ada)
│   └── StatusPAB.jsx                # (sudah ada)
├── components/
│   ├── ProtectedRoute.jsx           # Higher Order Component untuk proteksi route
│   ├── Navbar.jsx                   # (sudah ada)
│   └── ...
└── context/
    └── AuthContext.jsx              # Auth Context Provider
```

---

## 🔐 Fitur-Fitur

### 1. **Registrasi Mandiri** (`Register.jsx`)
- Input form: Nama, Email, Password, Konfirmasi Password
- Upload foto profil dengan preview
- Validasi:
  - Email format
  - Password minimal 6 karakter
  - File foto max 5MB, tipe image
- Proses:
  1. Buat akun Firebase Auth
  2. Upload foto ke Firebase Storage
  3. Simpan data user ke Firestore dengan struktur:
     ```json
     {
       "uid": "user-id",
       "nama": "Nama User",
       "email": "user@email.com",
       "fotoUrl": "https://storage.url/...",
       "role": "user",
       "nilai": {
         "fisik": 0,
         "wawancara": 0,
         "pengetahuan": 0,
         "presentasi": 0
       },
       "createdAt": "2024-01-15T10:30:00Z",
       "updatedAt": "2024-01-15T10:30:00Z"
     }
     ```

### 2. **Login** (`Login.jsx`)
- Form standar: Email & Password
- Validasi kredensial
- Mengambil role dari Firestore
- Redirect berdasarkan role:
  - `admin` → `/admin/dashboard`
  - `user` → `/dashboard`

### 3. **Auth Context** (`AuthContext.jsx`)
- Mengelola state autentikasi global
- Properties:
  - `user` - Firebase user object
  - `userRole` - Role dari Firestore (admin/user)
  - `userData` - Data lengkap user dari Firestore
  - `loading` - State loading
  - `logout()` - Fungsi logout
- Dapat diakses di mana saja dengan hook `useAuth()`

### 4. **Protected Route** (`ProtectedRoute.jsx`)
- Melindungi route yang memerlukan autentikasi
- Support role-based access:
  ```jsx
  <ProtectedRoute requiredRole="admin">
    {/* component */}
  </ProtectedRoute>
  ```
- Redirect otomatis ke login jika tidak authenticated

### 5. **Halaman Unauthorized** (`Unauthorized.jsx`)
- Ditampilkan ketika user mencoba akses route yang tidak sesuai role

---

## 🚀 Cara Menggunakan

### Setup Awal (di `main.jsx`)
Pastikan React Router sudah dikonfigurasi:
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

### Menggunakan Auth Context

**Di component manapun:**
```jsx
import { useAuth } from '../context/AuthContext';

export function MyComponent() {
  const { user, userRole, userData, logout } = useAuth();

  return (
    <div>
      <p>User: {userData?.nama}</p>
      <p>Role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Membuat Protected Route

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Route untuk user biasa (authenticated)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Route khusus admin
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  }
/>
```

---

## 📊 Data Flow

### Registrasi
```
User Input Form
    ↓
Validasi Input
    ↓
Firebase Auth: createUserWithEmailAndPassword()
    ↓
Firebase Storage: uploadBytes() → getDownloadURL()
    ↓
Firestore: setDoc(db, 'users/{uid}', userData)
    ↓
Redirect ke Login
```

### Login
```
User Input Email & Password
    ↓
Firebase Auth: signInWithEmailAndPassword()
    ↓
Firestore: getDoc('users/{uid}') → ambil role
    ↓
Redirect berdasarkan role
```

### Automatic Auth Check
```
App Mount
    ↓
AuthContext: onAuthStateChanged()
    ↓
Get Firestore user data
    ↓
Update global auth state
    ↓
Route protection di ProtectedRoute
```

---

## 🔄 Firestore Collection Schema

### Collection: `users`
```
users/
├── {uid1}/
│   ├── uid: string
│   ├── nama: string
│   ├── email: string
│   ├── fotoUrl: string
│   ├── role: string (enum: 'admin', 'user')
│   ├── nilai: object
│   │   ├── fisik: number
│   │   ├── wawancara: number
│   │   ├── pengetahuan: number
│   │   └── presentasi: number
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
└── {uid2}/
    └── ...
```

---

## 🛡️ Security Rules (Firebase)

Untuk Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User hanya bisa membaca/update data dirinya sendiri
    match /users/{uid} {
      allow read, update: if request.auth.uid == uid;
      allow create: if request.auth.uid == uid;
    }
    
    // Admin bisa read semua user (opsional)
    match /users/{document=**} {
      allow read: if request.auth.customClaims.role == 'admin';
    }
  }
}
```

Untuk Storage:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePictures/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
      allow delete: if request.auth.uid == uid;
    }
  }
}
```

---

## 🎯 Next Steps (Opsional)

1. **Email Verification**
   ```jsx
   await sendEmailVerification(auth.currentUser);
   ```

2. **Profile Update**
   - Create EditProfile component
   - Update Firestore data
   - Update profile picture

3. **Admin Panel**
   - List semua user
   - Edit role/nilai
   - Delete user

4. **Password Reset**
   ```jsx
   await sendPasswordResetEmail(auth, email);
   ```

5. **Session Management**
   - Tambah timeout auto-logout
   - Remember me functionality

---

## 🐛 Troubleshooting

### Error: "useAuth harus digunakan dalam AuthProvider"
**Solusi:** Pastikan App dibungkus dengan `<AuthProvider>`

### Login tidak redirect
**Solusi:** Periksa console untuk error, validasi Firestore security rules

### Foto tidak upload
**Solusi:** Validasi Firebase Storage rules, ukuran file, tipe file

### Role tidak terbaca
**Solusi:** Pastikan role tersimpan di Firestore dengan tepat

---

## 📝 Testing Credentials

Untuk testing, buat user terlebih dahulu di Firebase Console atau gunakan Register form.

---

## ✅ Checklist Implementasi

- [x] Firebase Auth (Email/Password)
- [x] Firestore User Collection
- [x] Firebase Storage (Profile Picture)
- [x] Register Component
- [x] Login Component
- [x] AuthContext
- [x] Protected Routes
- [x] Role-Based Redirect
- [x] Unauthorized Page
- [ ] Email Verification (Optional)
- [ ] Password Reset (Optional)
- [ ] Admin Dashboard (Optional)

---

Generated: 2024
