 ✅ Setup Checklist - PAB UKM Dashboard

## 📦 Yang Telah Dibuat

### Komponen React (src/components/)

- ✅ SyncButton.jsx - Sync dari Google Sheet dengan merge: true
- ✅ Dashboard.jsx - Statistik + Bar Chart (Recharts)
- ✅ PesertaTable.jsx - Tabel dengan checkbox real-time

### File Utama (src/)

- ✅ App.jsx - Main app dengan tab navigation
- ✅ main.jsx - Entry point
- ✅ firebase.js - Config Firebase (perlu diisi)
- ✅ FirebaseTest.jsx - Test koneksi Firebase
- ✅ index.css - Custom styles
- ✅ utils/helpers.js - Utility functions

### Dokumentasi

- ✅ README_PANDUAN.md - Panduan lengkap Bahasa Indonesia
- ✅ QUICKSTART.md - Panduan cepat mulai
- ✅ SUMMARY.md - Ringkasan semua fitur
- ✅ firestore.rules - Firebase security rules
- ✅ sample-data.csv - Contoh data untuk testing

### Dependencies

- ✅ recharts - Sudah terinstall

---

## 🔧 Yang Perlu Dilakukan

### [ ] 1. Setup Firebase Config

File: `src/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // ← ISI INI
  authDomain: "YOUR_AUTH_DOMAIN", // ← ISI INI
  projectId: "YOUR_PROJECT_ID", // ← ISI INI
  storageBucket: "YOUR_STORAGE_BUCKET", // ← ISI INI
  messagingSenderId: "YOUR_SENDER_ID", // ← ISI INI
  appId: "YOUR_APP_ID", // ← ISI INI
};
```

**Cara mendapatkan:**

1. Buka https://console.firebase.google.com
2. Pilih project Anda
3. Settings ⚙️ → Project settings
4. Scroll ke "Your apps" → Web app
5. Copy config

---

### [ ] 2. Setup Google Sheet URL

File: `src/components/SyncButton.jsx` (baris 14)

```javascript
const sheetUrl = "YOUR_GOOGLE_SHEET_URL_HERE"; // ← GANTI INI
```

**Format URL yang benar:**

```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/export?format=csv
```

**Cara publish Google Sheet:**

1. Buka Google Sheet Anda
2. File → Share → Publish to web
3. Tab: Pilih sheet yang aktif
4. Format: **Comma-separated values (.csv)**
5. Klik "Publish"
6. Copy URL → paste ke SyncButton.jsx

**Format header Google Sheet:**

```
nama | nim | fakultas | prodi | hp
```

---

### [ ] 3. Setup Firestore Rules

Buka Firebase Console → Firestore → Rules

Copy paste dari file `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /peserta/{pesertaId} {
      allow read: if true;
      allow write: if true;  // ⚠️ Untuk development only!
    }
  }
}
```

Klik **"Publish"**

---

## ▶️ Cara Menjalankan

```bash
npm run dev
```

Buka browser: http://localhost:5173

---

## 🎯 First Time Usage

1. **Klik "Sync dari Google Sheet"**

   - Import data peserta pertama kali
   - Tunggu hingga muncul "✅ Berhasil sync X peserta!"

2. **Buka Tab "Dashboard & Statistik"**

   - Lihat total peserta
   - Lihat grafik distribusi per fakultas

3. **Buka Tab "Data Peserta"**
   - Lihat tabel semua peserta
   - Klik checkbox untuk update status tahap
   - Data langsung tersimpan ke Firestore

---

## 🔍 Cara Test Koneksi Firebase (Opsional)

Edit `src/main.jsx`:

```javascript
import FirebaseTest from "./FirebaseTest.jsx"; // Tambah
// import App from './App.jsx'  // Comment out

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FirebaseTest /> {/* Ganti dengan FirebaseTest */}
  </React.StrictMode>
);
```

Jalankan `npm run dev` untuk test koneksi.

Jika berhasil, kembalikan ke `App`:

```javascript
import App from "./App.jsx";
// import FirebaseTest from './FirebaseTest.jsx'  // Comment out

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📊 Struktur Data Firestore

**Collection:** `peserta`
**Document ID:** NIM peserta

```javascript
{
  nama: "Ahmad Yani",
  nim: "H071211001",
  fakultas: "MIPA",
  prodi: "Matematika",
  hp: "081234567890",
  tahap_1: false,  // Boolean
  tahap_2: false,
  tahap_3: false,
  tahap_4: false,
  tahap_5: false
}
```

---

## 🚨 Troubleshooting

### Error: "Firebase is not defined"

✅ **Solusi:** Isi config di `src/firebase.js`

### Sync gagal / CORS error

✅ **Solusi:** Pastikan Google Sheet sudah dipublish sebagai CSV

### Checkbox tidak bisa diklik

✅ **Solusi:** Cek Firestore rules sudah allow write

### Data tidak muncul

✅ **Solusi:** Klik "Sync dari Google Sheet" terlebih dahulu

---

## 📚 Dokumentasi Lengkap

- **README_PANDUAN.md** - Panduan lengkap dengan penjelasan detail
- **QUICKSTART.md** - Panduan cepat memulai
- **SUMMARY.md** - Ringkasan fitur dan cara pakai

---

## ✨ Fitur Utama

### 1. Sync dengan Merge: True

```javascript
setDoc(docRef, data, { merge: true });
```

- ✅ Peserta baru ditambahkan
- ✅ Data profil diupdate
- ✅ Checkbox TIDAK direset

### 2. Real-time Updates

```javascript
onSnapshot(collection, callback);
```

- ✅ Perubahan langsung terlihat
- ✅ Tidak perlu refresh

### 3. Checkbox Auto-save

```javascript
updateDoc(docRef, { tahap_1: true });
```

- ✅ Klik checkbox → langsung tersimpan
- ✅ Loading indicator

---

## 🎓 Tech Stack

- ⚛️ React 18 (Vite)
- 🔥 Firebase Firestore
- 🎨 Tailwind CSS
- 📊 Recharts

---

**Selamat Menggunakan PAB UKM Dashboard! 🎉**

Jika ada pertanyaan, baca dokumentasi lengkap di `README_PANDUAN.md`
