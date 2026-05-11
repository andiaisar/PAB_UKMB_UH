# 👤 Dashboard User Component Documentation

Dokumentasi lengkap untuk komponen `DashboardUser.jsx` - halaman dashboard khusus user (read-only).

---

## 📋 Overview

**DashboardUser** adalah komponen yang menampilkan profil user dan nilai mereka dengan mode read-only. User tidak dapat mengedit data apapun, hanya dapat melihat informasi mereka.

### Fitur Utama
- ✅ Menampilkan foto profil
- ✅ Menampilkan nama dan email
- ✅ Menampilkan daftar nilai (fisik, wawancara, pengetahuan, presentasi)
- ✅ Menampilkan progress bar untuk setiap nilai
- ✅ Menampilkan statistik (total nilai, rata-rata)
- ✅ Menampilkan status untuk setiap nilai (Belum Dinilai, Perlu Ditingkatkan, Cukup Baik, Baik, Sangat Baik)
- ✅ Read-only mode (tidak bisa diedit)
- ✅ Loading state
- ✅ Error handling

---

## 🗂️ File Location

```
frontend/src/pages/DashboardUser.jsx
```

---

## 🚀 How to Use

### Import
```jsx
import DashboardUser from '../pages/DashboardUser';
```

### Basic Usage
```jsx
<DashboardUser />
```

### In Routing
```jsx
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
```

---

## 📊 Component Structure

### Sections

#### 1. **Profile Header Card**
- Gradient background
- Profile photo (circular)
- User name
- Email
- Role badge (User)
- User ID
- Join date

#### 2. **Nilai/Score Section**
- Title and description
- 4 score cards (Fisik, Wawancara, Pengetahuan, Presentasi)
- Progress bar untuk setiap nilai
- Summary stats (Total, Rata-rata)

#### 3. **Detail Nilai Table**
- Kategori
- Nilai
- Progress visualization
- Status label

#### 4. **Info Message**
- Read-only notice
- Administrator contact info

---

## 🎨 UI Components Used

### 1. Profile Header
```jsx
{/* Profile Photo */}
{userData.fotoUrl ? (
  <img src={userData.fotoUrl} alt={userData.nama} className="..." />
) : (
  <div className="...">Icon</div>
)}

{/* Profile Info */}
<h1>{userData.nama}</h1>
<p>{userData.email}</p>
<span className="badge">User</span>
```

### 2. Score Cards
```jsx
<div className="score-card">
  <span className="icon">💪</span>
  <p className="label">Fisik</p>
  <p className="score">80</p>
  <div className="progress-bar">
    <div style={{ width: '80%' }}></div>
  </div>
</div>
```

### 3. Stats Summary
```jsx
<div className="stats-box">
  <div>
    <p className="label">Total Nilai</p>
    <p className="value">320</p>
  </div>
  <div>
    <p className="label">Rata-Rata</p>
    <p className="value">80.00</p>
  </div>
</div>
```

### 4. Details Table
```jsx
<table>
  <thead>
    <tr>
      <th>Kategori</th>
      <th>Nilai</th>
      <th>Progress</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {nilaiItems.map(...)}
  </tbody>
</table>
```

---

## 📈 Data Structure

### Expected userData Format
```json
{
  "uid": "user-id-123",
  "nama": "John Doe",
  "email": "john@example.com",
  "fotoUrl": "https://storage.url/photo.jpg",
  "role": "user",
  "nilai": {
    "fisik": 85,
    "wawancara": 78,
    "pengetahuan": 90,
    "presentasi": 88
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T15:45:00Z"
}
```

---

## 🎯 Status Calculation

Status ditentukan berdasarkan nilai:

| Range | Status | Color |
|-------|--------|-------|
| 0 | Belum Dinilai | Red |
| 1-39 | Perlu Ditingkatkan | Red |
| 40-69 | Cukup Baik | Yellow |
| 70-84 | Baik | Blue |
| 85-100 | Sangat Baik | Green |

---

## ⚡ Features

### 1. Auto-Loading
```jsx
useEffect(() => {
  if (!loading && userData) {
    setIsLoading(false);
  }
}, [loading, userData]);
```

### 2. Loading State
```jsx
if (isLoading || loading) {
  return <LoadingSpinner />;
}
```

### 3. Error State
```jsx
if (!userData) {
  return <ErrorMessage />;
}
```

### 4. Calculations
```jsx
// Total Nilai
const totalNilai = fisik + wawancara + pengetahuan + presentasi;

// Rata-rata
const rataRataNilai = (totalNilai / 4).toFixed(2);

// Status
let statusLabel = 'Belum Dinilai';
if (nilai > 0 && nilai < 40) {
  statusLabel = 'Perlu Ditingkatkan';
} else if (nilai >= 40 && nilai < 70) {
  statusLabel = 'Cukup Baik';
} // ... etc
```

---

## 🔒 Read-Only Features

Semua fitur di halaman ini **read-only**:
- ❌ Tidak bisa edit nama
- ❌ Tidak bisa edit email
- ❌ Tidak bisa ubah nilai
- ❌ Tidak bisa upload foto baru
- ✅ Hanya bisa view/baca data

Untuk mengedit data, user harus hubungi administrator.

---

## 🎨 Styling

### Colors Used
- Primary: Blue (`from-blue-500 to-blue-600`)
- Secondary: Gray (`gray-50`, `gray-900`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)

### Responsive Design
- Mobile: Single column
- Tablet/Desktop: Multi-column grid
- Breakpoints: `sm:`, `lg:` Tailwind classes

### Layout
```
Header Card (Full Width)
  ├─ Gradient background
  ├─ Profile photo
  └─ Profile info

Nilai Section (Full Width)
  ├─ Score cards (Grid 1-4 columns)
  └─ Stats summary

Details Table (Full Width, scrollable on mobile)

Info Message (Full Width)
```

---

## 🧪 Testing Scenarios

### Test 1: Display Profile Information
```
1. Login as user
2. Navigate to /dashboard-user
3. Expected:
   - Profile photo displayed
   - Nama, email shown correctly
   - User badge visible
```

### Test 2: Display Nilai
```
1. User has nilai in Firestore
2. Navigate to /dashboard-user
3. Expected:
   - 4 score cards displayed
   - Values correct from Firestore
   - Progress bars showing correct progress
```

### Test 3: Calculate Stats
```
1. User nilai: Fisik=85, Wawancara=78, Pengetahuan=90, Presentasi=88
2. Expected:
   - Total Nilai = 341
   - Rata-rata = 85.25
```

### Test 4: Status Labels
```
1. Check different nilai values
2. Expected:
   - nilai=0 → Belum Dinilai (red)
   - nilai=35 → Perlu Ditingkatkan (red)
   - nilai=55 → Cukup Baik (yellow)
   - nilai=75 → Baik (blue)
   - nilai=90 → Sangat Baik (green)
```

### Test 5: Loading State
```
1. Komponenterender dengan loading=true
2. Expected:
   - Spinner ditampilkan
   - "Memuat data profil Anda..." text shown
```

### Test 6: Error State
```
1. userData = null
2. Expected:
   - Error message displayed
   - "Data Tidak Ditemukan" shown
```

### Test 7: Read-Only Mode
```
1. User in dashboard
2. Try to edit data
3. Expected:
   - No edit buttons present
   - All fields appear disabled
   - Only view/read possible
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Full width cards
- Single column layout
- Stacked profile info
- Scrollable table

### Tablet (640px - 1024px)
- 2-column score cards grid
- Side-by-side profile photo & info

### Desktop (> 1024px)
- 4-column score cards grid
- Full width table
- Optimal spacing

---

## 🔄 Data Flow

```
User Navigate to /dashboard-user
        ↓
ProtectedRoute check (requiredRole="user")
        ↓
AuthContext provides userData
        ↓
Component mounts
        ↓
useEffect triggers loading state
        ↓
Data renders:
  - Loading state? → Show spinner
  - No data? → Show error
  - Has data? → Render dashboard
        ↓
Display:
  - Profile header
  - Score cards
  - Summary stats
  - Details table
  - Info message
```

---

## 🛠️ Customization Guide

### Change Colors
```jsx
// Profile header gradient
<div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

// Change to:
<div className="h-32 bg-gradient-to-r from-green-500 to-green-600"></div>
```

### Add More Fields
```jsx
{/* Add more info */}
<div>
  <p className="text-sm text-gray-600">Departemen</p>
  <p className="text-gray-900">{userData.departemen}</p>
</div>
```

### Change Layout
```jsx
// Default: 4-column grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Change to 3-column:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## ⚠️ Important Notes

1. **Read-Only Only**
   - This dashboard is read-only
   - User cannot modify any data
   - Contact administrator to update values

2. **Data From AuthContext**
   - Uses `userData` from AuthContext
   - Auto-populated on login
   - Updates when role changes

3. **Date Formatting**
   - Uses Indonesian locale (`id-ID`)
   - Format: `Day, Month Date, Year`
   - Example: `1 Januari 2024`

4. **Progress Bars**
   - Show nilai/100 percentage
   - Dynamic width based on nilai value
   - Visual representation of progress

5. **Styling with Tailwind**
   - All styling done with Tailwind CSS
   - No external CSS files
   - Responsive design built-in

---

## 🚀 Future Enhancements

### Possible Additions
- [ ] PDF export of profile
- [ ] Print functionality
- [ ] Historical nilai tracking
- [ ] Comparison with average
- [ ] Charts and graphs
- [ ] Share profile (anonymized)
- [ ] Edit profile (with admin approval)
- [ ] Notifications for nilai updates

---

## 📞 Support

### Common Issues

**Issue: Data not showing**
- Solution: Check if userData is populated in AuthContext

**Issue: Photo not displaying**
- Solution: Check if fotoUrl is valid URL

**Issue: Styling looks off**
- Solution: Ensure Tailwind CSS is properly imported in main.jsx

---

## 📚 Related Files

- [AuthContext](../context/AuthContext.jsx)
- [ProtectedRoute](../components/ProtectedRoute.jsx)
- [App.jsx](../App.jsx)
- [Navbar](../components/Navbar.jsx)

---

**Last Updated:** 2024
**Component Status:** ✅ Production Ready
**Read-Only:** Yes
**Role Required:** user
