# PAB UKM Dashboard - Panduan Lengkap

## 📋 Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Cara Setup Google Sheet](#cara-setup-google-sheet)
3. [Struktur Data Firestore](#struktur-data-firestore)
4. [Cara Menggunakan Sync](#cara-menggunakan-sync)
5. [Penjelasan Komponen](#penjelasan-komponen)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Fitur Utama

✅ **Sync Data dari Google Sheet** dengan proteksi data checkbox
✅ **Real-time Updates** menggunakan Firebase onSnapshot
✅ **Dashboard Statistik** dengan grafik interaktif
✅ **Tabel Peserta** dengan checkbox yang langsung update ke Firestore
✅ **Filter & Search** untuk pencarian data
✅ **Responsive Design** dengan Tailwind CSS

---

## 📊 Cara Setup Google Sheet

### Langkah 1: Buat Google Sheet
Buat Google Sheet dengan kolom-kolom berikut:

| nama | nim | fakultas | prodi | hp |
|------|-----|----------|-------|-----|
| John Doe | H071234567 | MIPA | Matematika | 081234567890 |

### Langkah 2: Publish Google Sheet sebagai CSV
1. Buka Google Sheet Anda
2. Klik **File** → **Share** → **Publish to web**
3. Pilih tab yang ingin dipublish
4. Format: Pilih **Comma-separated values (.csv)**
5. Klik **Publish**
6. Copy URL yang diberikan

### Langkah 3: Masukkan URL ke SyncButton.jsx
Buka file `src/components/SyncButton.jsx` dan ganti baris:

```javascript
const sheetUrl = 'YOUR_GOOGLE_SHEET_URL_HERE';
```

Dengan URL CSV Google Sheet Anda, contoh:
```javascript
const sheetUrl = 'https://docs.google.com/spreadsheets/d/1abc123xyz/export?format=csv';
```

---

## 🗄️ Struktur Data Firestore

### Collection: `peserta`

Setiap dokumen menggunakan **NIM** sebagai Document ID.

**Field dalam setiap dokumen:**
```javascript
{
  nama: "string",        // Nama lengkap peserta
  nim: "string",         // NIM (digunakan sebagai doc ID)
  fakultas: "string",    // Nama fakultas
  prodi: "string",       // Program studi
  hp: "string",          // Nomor HP
  tahap_1: boolean,      // Status tahap 1 (default: false)
  tahap_2: boolean,      // Status tahap 2 (default: false)
  tahap_3: boolean,      // Status tahap 3 (default: false)
  tahap_4: boolean,      // Status tahap 4 (default: false)
  tahap_5: boolean       // Status tahap 5 (default: false)
}
```

**Contoh Dokumen:**
```
Document ID: H071234567
{
  nama: "John Doe",
  nim: "H071234567",
  fakultas: "MIPA",
  prodi: "Matematika",
  hp: "081234567890",
  tahap_1: true,
  tahap_2: true,
  tahap_3: false,
  tahap_4: false,
  tahap_5: false
}
```

---

## 🔄 Cara Menggunakan Sync

### Fitur Merge: True (PENTING!)

Ketika Anda menekan tombol **"Sync dari Google Sheet"**, sistem akan:

1. ✅ **Fetch data** dari Google Sheet yang sudah dipublish
2. ✅ **Parse CSV** menjadi array of objects
3. ✅ **Simpan ke Firestore** dengan `setDoc(..., { merge: true })`

**Keuntungan menggunakan `merge: true`:**

- ✅ Peserta **BARU** akan ditambahkan ke Firestore
- ✅ Data profil peserta **LAMA** (nama, fakultas, dll) akan diupdate
- ✅ **Status checkbox (tahap_1 - tahap_5)** peserta lama **TIDAK** akan tertimpa/reset
- ✅ Aman untuk sync berulang kali

### Contoh Skenario:

**Sebelum Sync Kedua:**
```javascript
// Firestore (sudah ada checkbox yang dicentang)
{
  nim: "H071234567",
  nama: "John Doe",
  tahap_1: true,   // ✅ Sudah dicentang
  tahap_2: true,   // ✅ Sudah dicentang
  tahap_3: false
}
```

**Data dari Google Sheet (Sync Kedua):**
```csv
nama, nim, fakultas
John Doe, H071234567, MIPA
Jane Smith, H071234568, FEB  ← Peserta baru
```

**Hasil Setelah Sync:**
```javascript
// Peserta lama - checkbox TETAP
{
  nim: "H071234567",
  nama: "John Doe",
  fakultas: "MIPA",
  tahap_1: true,   // ✅ TETAP (tidak direset)
  tahap_2: true,   // ✅ TETAP (tidak direset)
  tahap_3: false
}

// Peserta baru - ditambahkan
{
  nim: "H071234568",
  nama: "Jane Smith",
  fakultas: "FEB",
  tahap_1: false,  // Default
  tahap_2: false,
  tahap_3: false
}
```

---

## 🧩 Penjelasan Komponen

### 1. **SyncButton.jsx**

**Fungsi:**
- Fetch data dari Google Sheet (CSV format)
- Parse CSV menjadi array
- Simpan ke Firestore dengan `merge: true`

**Kode Penting:**
```javascript
await setDoc(docRef, dataToSave, { merge: true });
// merge: true = tidak timpa data lama, hanya update/tambah
```

**Fitur:**
- Loading state
- Success/error message
- Spinner animation

---

### 2. **Dashboard.jsx**

**Fungsi:**
- Menampilkan statistik real-time:
  - Total Peserta
  - Total Lulus (semua tahap selesai)
  - Persentase Lulus
- Bar Chart: Distribusi peserta per fakultas

**Teknologi:**
- `onSnapshot()` untuk real-time updates
- **Recharts** untuk grafik

**Logika Lulus:**
```javascript
// Peserta lulus jika semua tahap selesai
const lulus = data.filter(p => 
  p.tahap_1 && p.tahap_2 && p.tahap_3 && p.tahap_4 && p.tahap_5
).length;
```

---

### 3. **PesertaTable.jsx**

**Fungsi:**
- Tabel data peserta dengan real-time updates
- Checkbox untuk setiap tahap (1-5)
- Filter berdasarkan fakultas
- Search berdasarkan nama/NIM

**Fitur Update Checkbox:**
```javascript
const handleCheckboxChange = async (nimId, tahapField, currentValue) => {
  const pesertaDocRef = doc(db, 'peserta', nimId);
  await updateDoc(pesertaDocRef, {
    [tahapField]: !currentValue
  });
};
```

**Fitur Visual:**
- Row highlight hijau untuk peserta yang lulus semua tahap
- Loading spinner saat update checkbox
- Real-time sync indicator

---

### 4. **App.jsx**

**Fungsi:**
- Main container
- Tab navigation (Dashboard & Data Peserta)
- Header & Footer
- Integrasi semua komponen

---

## 🔧 Troubleshooting

### 1. **Error: "Firebase is not defined"**
**Solusi:** Pastikan file `firebase.js` sudah dibuat dan konfigurasi Firebase sudah diisi dengan benar.

```javascript
// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",  // ← Ganti dengan API Key asli
  // ... dst
};
```

### 2. **Sync gagal / CORS Error**
**Solusi:** Pastikan Google Sheet sudah dipublish sebagai CSV (bukan JSON) dan URL sudah benar.

Format URL yang benar:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/export?format=csv
```

### 3. **Checkbox tidak update**
**Solusi:** 
- Periksa koneksi internet
- Buka Firebase Console → Firestore → Lihat apakah rules mengizinkan write
- Rules minimal untuk development:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /peserta/{document=**} {
      allow read, write: if true;  // ⚠️ Hanya untuk development
    }
  }
}
```

### 4. **Data tidak muncul di tabel**
**Solusi:**
- Pastikan sudah ada data di Firestore collection `peserta`
- Klik tombol "Sync dari Google Sheet" untuk import data pertama kali
- Buka Console browser (F12) untuk lihat error

### 5. **Chart tidak muncul**
**Solusi:**
- Pastikan Recharts sudah terinstall: `npm install recharts`
- Pastikan ada data peserta di Firestore
- Periksa field `fakultas` terisi dengan benar

---

## 📦 Dependencies yang Dibutuhkan

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "firebase": "^10.x",
    "recharts": "^2.x"
  }
}
```

**Install semua dependencies:**
```bash
npm install
```

---

## 🚀 Cara Menjalankan

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Firebase config di `src/firebase.js`**

3. **Setup Google Sheet URL di `src/components/SyncButton.jsx`**

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```

5. **Buka browser:** `http://localhost:5173`

6. **Klik "Sync dari Google Sheet"** untuk import data pertama kali

7. **Mulai gunakan checkbox untuk tracking tahap peserta!**

---

## ✨ Tips & Best Practices

1. **Backup Data:**
   - Export data Firestore secara berkala
   - Simpan copy Google Sheet

2. **Security:**
   - Jangan expose Firebase config di public repository
   - Gunakan Environment Variables untuk production
   - Setup Firebase Security Rules yang proper

3. **Performance:**
   - Gunakan pagination jika data > 1000 peserta
   - Consider indexing di Firestore

4. **Maintenance:**
   - Sync data dari Google Sheet hanya saat ada peserta baru
   - Jangan sync terlalu sering (rate limit)

---

## 🎓 Cara Penggunaan Sehari-hari

### Skenario 1: Menambah Peserta Baru
1. Tambah peserta di Google Sheet
2. Klik tombol "Sync dari Google Sheet" di dashboard
3. Peserta baru akan muncul di tabel
4. Checkbox tahap mereka default = belum selesai (false)

### Skenario 2: Update Status Tahap
1. Buka tab "Data Peserta"
2. Cari peserta yang ingin diupdate
3. Klik checkbox tahap yang sudah selesai
4. Data langsung tersimpan ke Firestore (real-time)

### Skenario 3: Monitoring Progress
1. Buka tab "Dashboard & Statistik"
2. Lihat Total Lulus dan Persentase
3. Cek grafik distribusi per fakultas
4. Data update otomatis tanpa refresh

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat Issue di repository atau hubungi admin.

**Happy Coding! 🚀**
