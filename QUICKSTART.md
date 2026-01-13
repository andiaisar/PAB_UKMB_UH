# Quick Start Guide - PAB UKM Dashboard

## 🚀 Instalasi Cepat

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

Edit file `src/firebase.js` dan masukkan konfigurasi Firebase Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... dst
};
```

### 3. Setup Google Sheet URL

Edit file `src/components/SyncButton.jsx` baris 14:

```javascript
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRa643VjZQBJcqFd--Jr2ihV5U0rp34fEsxlE-3E6g-HRWYf9UGzEaNEsCH-kopqYZjsp8ZwL52LyoQ/pubhtml";
```

### 4. Jalankan

```bash
npm run dev
```

## 📊 Format Google Sheet

Buat Google Sheet dengan header:

```
nama | nim | fakultas | prodi | hp
```

Publish sebagai CSV:

1. File → Share → Publish to web
2. Format: CSV
3. Copy URL

## 🔥 Firestore Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /peserta/{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning:** Rules di atas hanya untuk development. Untuk production, gunakan authentication.

## ✅ Checklist Setup

- [ ] npm install selesai
- [ ] Firebase config sudah diisi
- [ ] Google Sheet sudah dibuat dan dipublish
- [ ] URL Google Sheet sudah dimasukkan ke SyncButton.jsx
- [ ] Firestore rules sudah diset
- [ ] npm run dev berhasil jalan
- [ ] Sync pertama berhasil

## 🎯 Fitur Utama

1. **Sync Button** - Import data dari Google Sheet
2. **Dashboard** - Statistik & grafik real-time
3. **Tabel Peserta** - Update checkbox langsung ke Firestore
4. **Real-time Updates** - Semua perubahan langsung terlihat

## 📱 Cara Pakai

1. Klik "Sync dari Google Sheet" untuk import data
2. Buka tab "Dashboard" untuk lihat statistik
3. Buka tab "Data Peserta" untuk update checkbox tahap
4. Checkbox langsung tersimpan ke Firestore

## 🐛 Troubleshooting Cepat

**Data tidak muncul?**

- Cek Firebase config
- Cek Firestore rules
- Lihat Console browser (F12) untuk error

**Sync gagal?**

- Pastikan Google Sheet sudah dipublish
- Cek format URL (harus .../export?format=csv)
- Cek koneksi internet

**Checkbox tidak bisa diklik?**

- Cek Firestore rules allow write
- Cek koneksi Firebase

## 📚 Dokumentasi Lengkap

Lihat `README_PANDUAN.md` untuk dokumentasi lengkap.

---

**Happy Coding! 🚀**
