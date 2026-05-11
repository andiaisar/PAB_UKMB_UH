# 🔐 Role-Based Routing & Protected Routes

Dokumentasi sistem routing berbasis role yang telah diimplementasikan.

---

## 📋 Struktur Route

### Public Routes (Tidak memerlukan autentikasi)

```
GET /login                → Halaman login
GET /register             → Halaman registrasi
GET /unauthorized         → Halaman 403 akses ditolak
```

### Protected Routes - USER ONLY

```
GET /dashboard-user       → Dashboard khusus user
                            (Hanya bisa diakses oleh role 'user')
```

### Protected Routes - ADMIN ONLY

```
GET /kartu-kontrol        → Manajemen kartu kontrol
                            (Hanya admin, memerlukan requiredRole="admin")

GET /admin/dashboard      → Admin control panel
                            (Hanya admin, memerlukan requiredRole="admin")

GET /import-excel         → Import data dari Excel
                            (Hanya admin, memerlukan requiredRole="admin")
```

### Catatan
- Route `/status-pab` dan `/dashboard` **telah dinonaktifkan** (commented out)
- Route default (`/`) redirect ke `/dashboard-user`
- Semua wildcard (`*`) redirect ke `/dashboard-user`

---

## 🔒 ProtectedRoute Component

Komponen yang digunakan untuk melindungi routes berdasarkan login status dan role.

### Implementasi

File: `components/ProtectedRoute.jsx`

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, loading } = useAuth();

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

  // Jika user belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika diperlukan role tertentu
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

---

## 🔄 Access Flow Diagram

```
┌─────────────────────────────────────────┐
│  User Akses URL                         │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Public Route?        │
    └──┬──────────────────┬┘
    YES│                 NO│
       │                  │
       ▼                  ▼
   ┌─────────┐    ┌─────────────┐
   │Show     │    │User logged  │
   │Content  │    │in?          │
   └─────────┘    └──┬────────┬─┘
                   NO│      YES│
                     │        ▼
                     │   ┌──────────────┐
                     │   │Role required?│
                     │   └──┬────────┬──┘
                     │    YES│      NO│
                     │      │        │
                     │      ▼        ▼
                     │  ┌────────┐ ┌────────┐
                     │  │Check   │ │Show    │
                     │  │Role    │ │Content │
                     │  └─┬────┬─┘ └────────┘
                     │  YES│  NO│
                     │    │    │
                     ▼    ▼    ▼
               ┌─────────────────┐
               │/login    /unauth  /content
               └─────────────────┘
```

---

## 💡 Cara Menggunakan

### 1. Basic Protected Route (Login Required)

```jsx
<Route
  path="/mypage"
  element={
    <ProtectedRoute>
      <MyPageComponent />
    </ProtectedRoute>
  }
/>
```

**Behavior:**
- Tidak login → redirect ke `/login`
- Login → tampilkan component

### 2. Role-Based Protected Route

```jsx
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  }
/>
```

**Behavior:**
- Tidak login → redirect ke `/login`
- Login tapi role bukan "admin" → redirect ke `/unauthorized`
- Login dengan role "admin" → tampilkan component

### 3. Multiple Routes dengan Layout

```jsx
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
```

---

## 🧪 Testing Role-Based Access

### Test 1: Akses Tanpa Login
1. Buka `http://localhost:5173/kartu-kontrol`
2. **Expected:** Redirect ke `/login`

### Test 2: Login sebagai USER
1. Login dengan akun user
2. Buka `http://localhost:5173/kartu-kontrol`
3. **Expected:** Redirect ke `/unauthorized` (403 error page)

### Test 3: Login sebagai ADMIN
1. Login dengan akun admin (atau ubah role di Firestore)
2. Buka `http://localhost:5173/kartu-kontrol`
3. **Expected:** Tampilkan halaman KartuKontrol

### Test 4: USER Akses Dashboard
1. Login sebagai user
2. Buka `http://localhost:5173/dashboard-user`
3. **Expected:** Tampilkan dashboard user

---

## 📊 Route & Role Mapping

| Route | Component | Role Required | Status |
|-------|-----------|---------------|--------|
| `/login` | Login | None | Public ✅ |
| `/register` | Register | None | Public ✅ |
| `/unauthorized` | Unauthorized | None | Public ✅ |
| `/dashboard-user` | Dashboard User | user | Protected ✅ |
| `/kartu-kontrol` | KartuKontrol | admin | Protected ✅ |
| `/admin/dashboard` | Admin Dashboard | admin | Protected ✅ |
| `/import-excel` | ImportExcel | admin | Protected ✅ |
| `/status-pab` | StatusPAB | - | ❌ Disabled |
| `/dashboard` | StatusPAB | - | ❌ Disabled |

---

## 🔧 Modifying Routes

### Menambah Route Baru untuk Admin

```jsx
<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
          <div className="container mx-auto max-w-7xl">
            <UserManagement />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  }
/>
```

### Menambah Route untuk User Biasa

```jsx
<Route
  path="/profile"
  element={
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
          <div className="container mx-auto max-w-7xl">
            <UserProfile />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  }
/>
```

### Mengaktifkan Kembali StatusPAB Route

Di `App.jsx`, uncomment bagian ini:

```jsx
<Route
  path="/status-pab"
  element={
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 px-3 md:px-6 pb-6 md:pb-8">
          <div className="container mx-auto max-w-7xl">
            <StatusPAB />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  }
/>
```

---

## ⚙️ How ProtectedRoute Works

### Step-by-Step Execution

1. **Component Renders**
   ```jsx
   <ProtectedRoute requiredRole="admin">
     <MyComponent />
   </ProtectedRoute>
   ```

2. **Get Auth State dari Context**
   ```jsx
   const { user, userRole, loading } = useAuth();
   ```

3. **Check Loading State**
   - Jika sedang loading → tampilkan loading spinner
   - Tunggu hingga auth state ter-populate

4. **Check Login Status**
   - Jika `user === null` → navigate ke `/login`
   - User belum authenticated

5. **Check Role (jika diperlukan)**
   - Jika `requiredRole` diberikan
   - Dan `userRole !== requiredRole` → navigate ke `/unauthorized`

6. **Render Children**
   - Jika semua check passed → render component children

---

## 🔐 Security Considerations

### Client-Side Protection
- ProtectedRoute melindungi akses dari client side
- Mencegah user biasa mengakses URL admin

### Server-Side Protection
- Implement additional checks di backend
- Validate user role sebelum return sensitive data
- Contoh: `/api/users` hanya accessible oleh admin di backend

### Best Practices
1. ✅ Always protect sensitive routes
2. ✅ Check role di both client dan server
3. ✅ Set proper Firestore security rules
4. ✅ Use HTTPS di production
5. ✅ Add rate limiting untuk auth endpoints

---

## 🎯 Checklist

- [x] ProtectedRoute component implemented
- [x] Role-based access control setup
- [x] Routes configured in App.jsx
- [x] /kartu-kontrol protected untuk admin
- [x] /dashboard-user untuk user
- [x] /status-pab disabled
- [x] Unauthorized page setup
- [x] Default redirect configured
- [ ] Add more admin routes (optional)
- [ ] Add user profile route (optional)
- [ ] Implement logout redirect

---

## 📖 Related Files

- [ProtectedRoute Component](../src/components/ProtectedRoute.jsx)
- [AuthContext](../src/context/AuthContext.jsx)
- [App.jsx Routing](../src/App.jsx)
- [Unauthorized Page](../src/pages/Unauthorized.jsx)
- [Login Component](../src/pages/Login.jsx)

---

**Last Updated:** 2024
**Status:** Complete & Ready for Use
