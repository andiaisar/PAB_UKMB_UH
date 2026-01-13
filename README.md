# 🎓 PAB UKM Dashboard

Sistem Manajemen Peserta PAB (Penerimaan Anggota Baru) UKM Universitas Hasanuddin.

Dashboard real-time untuk tracking progress peserta dengan sinkronisasi data dari Google Sheet dan update status tahap menggunakan Firebase Firestore.

---

## ✨ Fitur Utama

- 🔄 **Sync dari Google Sheet** - Import data peserta dengan proteksi checkbox (merge: true)
- 📊 **Dashboard Real-time** - Statistik dan grafik distribusi peserta per fakultas
- ✅ **Checkbox Tracking** - Update status tahap (1-5) langsung ke Firestore
- 🔍 **Filter & Search** - Cari peserta berdasarkan nama/NIM/fakultas
- 📱 **Responsive Design** - Tampilan optimal di desktop dan mobile

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Vite)
- **Database:** Firebase Firestore (NoSQL)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Real-time:** Firebase onSnapshot

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

Edit `src/firebase.js` dan masukkan Firebase config Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... dst
};
```

### 3. Setup Google Sheet

1. Buat Google Sheet dengan header: `nama`, `nim`, `fakultas`, `prodi`, `hp`
2. Publish sebagai CSV (File → Share → Publish to web → CSV)
3. Copy URL ke `src/components/SyncButton.jsx` (baris 14)

### 4. Setup Firestore Rules

Copy rules dari `firestore.rules` ke Firebase Console → Firestore → Rules

### 5. Run Development Server

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

### 6. First Sync

Klik tombol **"Sync dari Google Sheet"** untuk import data pertama kali

---

## 📁 Struktur Project

```
PAB_UKMB_UH/
├── src/
│   ├── components/
│   │   ├── SyncButton.jsx      # Sync dari Google Sheet
│   │   ├── Dashboard.jsx       # Statistik & Chart
│   │   └── PesertaTable.jsx    # Tabel dengan checkbox
│   ├── utils/
│   │   └── helpers.js          # Helper functions
│   ├── App.jsx                 # Main app
│   ├── main.jsx                # Entry point
│   ├── firebase.js             # Firebase config
│   └── index.css               # Custom styles
├── index.html
├── sample-data.csv             # Contoh data
├── firestore.rules             # Security rules
└── [Dokumentasi].md            # 4 file dokumentasi
```

---

## 📚 Dokumentasi

- **[CHECKLIST.md](CHECKLIST.md)** - ✅ Checklist setup step-by-step
- **[QUICKSTART.md](QUICKSTART.md)** - 🚀 Panduan cepat memulai
- **[README_PANDUAN.md](README_PANDUAN.md)** - 📖 Dokumentasi lengkap
- **[SUMMARY.md](SUMMARY.md)** - 📋 Ringkasan fitur dan teknologi

**Mulai dari:** `CHECKLIST.md` untuk setup pertama kali

---

## 🎯 Cara Pakai

### Import Data Peserta

1. Buka dashboard
2. Klik "Sync dari Google Sheet"
3. Data peserta akan muncul di tabel

### Update Status Tahap

1. Buka tab "Data Peserta"
2. Cari peserta yang ingin diupdate
3. Klik checkbox tahap yang sudah selesai
4. Data otomatis tersimpan ke Firestore

### Monitoring Progress

1. Buka tab "Dashboard & Statistik"
2. Lihat total peserta dan persentase lulus
3. Cek grafik distribusi per fakultas

---

## 🔥 Fitur Kunci: Merge True

Saat sync dari Google Sheet, sistem menggunakan:

```javascript
setDoc(docRef, data, { merge: true });
```

**Keuntungan:**

- ✅ Peserta baru akan ditambahkan
- ✅ Data profil peserta lama diupdate (nama, fakultas, dll)
- ✅ **Status checkbox (tahap_1 - tahap_5) TIDAK akan direset**
- ✅ Aman untuk sync berulang kali

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
  tahap_1: false,  // Boolean - status tahap 1
  tahap_2: false,  // Boolean - status tahap 2
  tahap_3: false,  // Boolean - status tahap 3
  tahap_4: false,  // Boolean - status tahap 4
  tahap_5: false   // Boolean - status tahap 5
}
```

---

## 🐛 Troubleshooting

| Problem               | Solution                                          |
| --------------------- | ------------------------------------------------- |
| Firebase not defined  | Isi config di `src/firebase.js`                   |
| Sync gagal            | Pastikan Google Sheet sudah dipublish sebagai CSV |
| Checkbox tidak update | Cek Firestore rules: allow write: true            |
| Data tidak muncul     | Klik "Sync dari Google Sheet" terlebih dahulu     |

Lihat [README_PANDUAN.md](README_PANDUAN.md#troubleshooting) untuk troubleshooting lengkap.

---

## 📸 Screenshots

### Dashboard

- Statistik: Total Peserta, Total Lulus, Persentase
- Bar Chart: Distribusi peserta per fakultas
- Real-time updates

### Tabel Peserta

- Filter berdasarkan nama/NIM/fakultas
- Checkbox untuk setiap tahap (1-5)
- Auto-save ke Firestore
- Highlight peserta yang sudah lulus semua tahap

---

## 🔐 Security

**Development Mode:**

```javascript
allow read, write: if true;  // ⚠️ Development only!
```

**Production Mode:**
Implementasi Firebase Authentication dan update rules:

```javascript
allow read: if true;
allow write: if request.auth != null;
```

---

## 🚧 Roadmap (Future Features)

- [ ] Authentication dengan Firebase Auth
- [ ] Role-based access (Admin, Panitia, Read-only)
- [ ] Export data ke PDF/Excel
- [ ] Notifikasi email otomatis
- [ ] History log perubahan
- [ ] Bulk update checkbox
- [ ] Dark mode

---

## 📝 License

MIT License - Feel free to use for your UKM dashboard!

---

## 🙏 Credits

Built with ❤️ for PAB UKM Universitas Hasanuddin

**Tech Stack:**

- React + Vite
- Firebase Firestore
- Tailwind CSS
- Recharts

---

## 📞 Support

Jika ada pertanyaan atau issue:

1. Baca dokumentasi lengkap di `README_PANDUAN.md`
2. Cek `QUICKSTART.md` untuk setup cepat
3. Lihat `CHECKLIST.md` untuk checklist setup

**Happy Tracking! 🎉**
