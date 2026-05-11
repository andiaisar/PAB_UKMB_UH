# 🧪 Testing Guide - Role-Based Routing

Panduan lengkap untuk testing role-based routing dan protected routes.

---

## 🎯 Test Scenarios

### Setup Awal

1. **Create User Account (Role: USER)**
   - Email: `user@example.com`
   - Password: `password123`
   - Role: `user` (default saat registrasi)

2. **Create Admin Account (Role: ADMIN)**
   - Email: `admin@example.com`
   - Password: `password123`
   - Role: `admin` (ubah manual di Firestore)

---

## 🧬 Test Case 1: Access Without Login

### Scenario: User mencoba akses protected route tanpa login

**Steps:**
1. Buka aplikasi di `http://localhost:5173`
2. Langsung buka URL proteksi: `http://localhost:5173/kartu-kontrol`

**Expected Result:**
- ❌ Redirect ke `/login`
- Halaman login ditampilkan
- User diminta untuk login

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 2: Login as USER Role

### Scenario: User biasa login dan akses dashboard

**Steps:**
1. Buka `/login`
2. Isi form:
   - Email: `user@example.com`
   - Password: `password123`
3. Klik "Sign In"

**Expected Result:**
- ✅ Login berhasil
- Redirect ke `/dashboard-user`
- Halaman "Dashboard User" ditampilkan
- Navbar terlihat di atas

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 3: USER Akses Admin Route

### Scenario: User biasa mencoba akses route admin

**Prerequisites:** Sudah login sebagai USER

**Steps:**
1. Login sebagai user
2. Manual buka URL: `http://localhost:5173/kartu-kontrol`

**Expected Result:**
- ❌ Redirect ke `/unauthorized`
- Halaman 403 ditampilkan
- Button "Kembali ke Dashboard" dan "Logout" tersedia

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 4: USER Akses Admin Dashboard

### Scenario: User biasa mencoba akses admin dashboard

**Prerequisites:** Sudah login sebagai USER

**Steps:**
1. Login sebagai user
2. Manual buka URL: `http://localhost:5173/admin/dashboard`

**Expected Result:**
- ❌ Redirect ke `/unauthorized`
- Halaman 403 ditampilkan

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 5: USER Akses Import Excel

### Scenario: User biasa mencoba akses fitur import excel

**Prerequisites:** Sudah login sebagai USER

**Steps:**
1. Login sebagai user
2. Manual buka URL: `http://localhost:5173/import-excel`

**Expected Result:**
- ❌ Redirect ke `/unauthorized`
- Halaman 403 ditampilkan

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 6: Login as ADMIN Role

### Scenario: Admin login dan akses admin dashboard

**Steps:**
1. Buka `/login`
2. Isi form:
   - Email: `admin@example.com`
   - Password: `password123`
3. Klik "Sign In"

**Expected Result:**
- ✅ Login berhasil
- Redirect ke `/admin/dashboard` (karena role admin)
- Halaman "Admin Dashboard" ditampilkan
- Navbar terlihat

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 7: ADMIN Akses Kartu Kontrol

### Scenario: Admin akses fitur kartu kontrol

**Prerequisites:** Sudah login sebagai ADMIN

**Steps:**
1. Login sebagai admin
2. Manual buka atau klik link: `http://localhost:5173/kartu-kontrol`

**Expected Result:**
- ✅ Akses diizinkan
- Halaman "Kartu Kontrol" ditampilkan
- Component KartuKontrol.jsx terrender
- Navbar terlihat

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 8: ADMIN Akses Import Excel

### Scenario: Admin akses fitur import excel

**Prerequisites:** Sudah login sebagai ADMIN

**Steps:**
1. Login sebagai admin
2. Manual buka atau klik link: `http://localhost:5173/import-excel`

**Expected Result:**
- ✅ Akses diizinkan
- Halaman "Import Excel" ditampilkan
- Component ImportExcel.jsx terrender
- Navbar terlihat

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 9: StatusPAB Route Disabled

### Scenario: Akses route statusPAB yang sudah dinonaktifkan

**Steps:**
1. Buka URL: `http://localhost:5173/status-pab`

**Expected Result:**
- Route tidak ditemukan
- Redirect ke `/dashboard-user` (default redirect)
- Atau tampil 404 page

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 10: Dashboard Route Disabled

### Scenario: Akses route dashboard yang sudah dinonaktifkan

**Steps:**
1. Buka URL: `http://localhost:5173/dashboard`

**Expected Result:**
- Route tidak ditemukan
- Redirect ke `/dashboard-user` (default redirect)
- Atau tampil 404 page

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 11: Role Change During Session

### Scenario: Admin mengubah role user di Firestore, user refresh page

**Prerequisites:** 
- User sudah login sebagai USER
- Buka console/DevTools agar dapat monitor

**Steps:**
1. Login sebagai user
2. Buka halaman: `/dashboard-user`
3. Di Firebase Console → Firestore:
   - Buka collection `users`
   - Edit document user
   - Ubah `role` dari `"user"` ke `"admin"`
4. Kembali ke aplikasi, refresh page (F5)

**Expected Result:**
- ✅ Auth context ter-update dengan role baru
- Jika setup redirect, mungkin redirect ke `/admin/dashboard`
- Atau tetap di `/dashboard-user` tapi bisa akses admin routes

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 12: Logout Functionality

### Scenario: User logout dan redirect

**Prerequisites:** Sudah login

**Steps:**
1. Login (bisa sebagai admin atau user)
2. Buka halaman proteksi
3. Klik button "Logout" (jika ada) atau akses logout via code
4. Atau buka Unauthorized page dan klik "Logout"

**Expected Result:**
- ✅ Session berakhir
- Redirect ke `/login`
- Semua protected routes tidak bisa diakses

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 13: Redirect Root Path

### Scenario: Akses root path `/`

**Prerequisites:** Login sebagai user atau admin

**Steps:**
1. Login
2. Buka: `http://localhost:5173/`

**Expected Result:**
- Redirect ke `/dashboard-user`
- Halaman dashboard user ditampilkan

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 14: Redirect Wildcard Path

### Scenario: Akses URL yang tidak ada

**Prerequisites:** Login

**Steps:**
1. Login
2. Buka: `http://localhost:5173/random-page-123`

**Expected Result:**
- Redirect ke `/dashboard-user`
- Halaman dashboard user ditampilkan

**Status:** ✅ / ❌ (catat hasil)

---

## 🧬 Test Case 15: Navbar Visibility

### Scenario: Navbar muncul di protected routes

**Prerequisites:** 
- Login sebagai admin
- Buka multiple protected pages

**Steps:**
1. Login sebagai admin
2. Buka `/admin/dashboard`
   - ✅ Navbar terlihat
3. Buka `/kartu-kontrol`
   - ✅ Navbar terlihat
4. Buka `/import-excel`
   - ✅ Navbar terlihat

**Expected Result:**
- Navbar selalu muncul di semua protected routes
- Navbar tidak muncul di login/register pages

**Status:** ✅ / ❌ (catat hasil)

---

## 📊 Test Results Summary

Buat tabel untuk merangkum hasil testing:

| No. | Test Case | Expected | Actual | Status | Notes |
|-----|-----------|----------|--------|--------|-------|
| 1 | Access without login | Redirect /login | | ✅/❌ | |
| 2 | Login as USER | Redirect /dashboard-user | | ✅/❌ | |
| 3 | USER access /kartu-kontrol | Redirect /unauthorized | | ✅/❌ | |
| 4 | USER access /admin/dashboard | Redirect /unauthorized | | ✅/❌ | |
| 5 | USER access /import-excel | Redirect /unauthorized | | ✅/❌ | |
| 6 | Login as ADMIN | Redirect /admin/dashboard | | ✅/❌ | |
| 7 | ADMIN access /kartu-kontrol | Success | | ✅/❌ | |
| 8 | ADMIN access /import-excel | Success | | ✅/❌ | |
| 9 | Access /status-pab | Redirect /dashboard-user | | ✅/❌ | |
| 10 | Access /dashboard | Redirect /dashboard-user | | ✅/❌ | |
| 11 | Role change during session | Auth updated | | ✅/❌ | |
| 12 | Logout | Redirect /login | | ✅/❌ | |
| 13 | Access / | Redirect /dashboard-user | | ✅/❌ | |
| 14 | Access /random-page-123 | Redirect /dashboard-user | | ✅/❌ | |
| 15 | Navbar visibility | Navbar present | | ✅/❌ | |

---

## 🐛 Debugging Tips

### 1. Check Auth State
Di browser console, buka DevTools dan check:
```javascript
// Di component, tambah log:
const { user, userRole, userData } = useAuth();
console.log('User:', user);
console.log('Role:', userRole);
console.log('UserData:', userData);
```

### 2. Check Firebase Auth
Di Firebase Console:
```
Authentication → Users
```
Pastikan user tersebut tercatat dengan email benar.

### 3. Check Firestore Data
Di Firebase Console:
```
Firestore Database → Collections → users
```
Pastikan document user punya field `role` dengan value yang benar.

### 4. Check Browser Console
Buka F12 → Console tab. Cari ada error?
- `useAuth must be used within AuthProvider` → Auth context tidak di-wrap
- `Cannot read property 'role' of undefined` → userData belum loaded
- Network errors → Check Firebase connection

### 5. Network Tab
Buka DevTools → Network:
- Lihat request ke Firestore saat login
- Pastikan response berisi data user lengkap

---

## ✅ Success Criteria

Semua test case di atas **HARUS PASS** sebelum:
- Deploy ke staging
- Deploy ke production
- Hand-off ke QA team

---

## 📝 Test Execution Checklist

- [ ] Setup test accounts (1 user, 1 admin)
- [ ] Test Case 1-15 semua run
- [ ] Catat hasil di tabel
- [ ] Fix bugs jika ada
- [ ] Re-run failed tests
- [ ] All tests pass ✅

---

## 🚀 After Testing

### Jika semua test PASS:
1. ✅ Push code ke repository
2. ✅ Deploy ke staging environment
3. ✅ QA team review
4. ✅ Ready for production

### Jika ada test FAIL:
1. ❌ Identify root cause
2. ❌ Fix the bug
3. ❌ Re-run test
4. ❌ Repeat hingga pass

---

Generated: 2024
Test & Quality Assurance Document
