# Setup Google Sheets untuk Sync

## ⚠️ PENTING: Izin Akses Google Sheets

Agar aplikasi bisa membaca data dari Google Sheets, Anda harus:

### 1. Buat Google Sheets Dapat Diakses Publik

1. Buka Google Sheets Anda: https://docs.google.com/spreadsheets/d/1ndTjsBYZAFnpBBpcSxFF8P80L-x2F7AxT4OjATHwylg/
2. Klik tombol **"Share"** (Bagikan) di kanan atas
3. Klik **"Change to anyone with the link"** atau **"Ubah ke siapa saja yang memiliki link"**
4. Pilih **"Viewer"** (Pemirsa) - tidak perlu editor
5. Klik **"Done"**

### 2. Struktur Kolom di Google Sheets

Pastikan Google Sheets Anda memiliki kolom dengan header **PERSIS** seperti ini (huruf kecil):

```
nim | nama | fakultas | prodi | hp
```

**Contoh data:**
```
nim         | nama              | fakultas  | prodi                    | hp
C111223045  | Ahmad Rizki       | MIPA      | Sistem Informasi         | 081234567890
H011223046  | Siti Nurhaliza    | Teknik    | Teknik Informatika       | 081234567891
```

### 3. URL yang Sudah Dikonfigurasi

URL sudah dikonfigurasi dalam aplikasi:
```
https://docs.google.com/spreadsheets/d/1ndTjsBYZAFnpBBpcSxFF8P80L-x2F7AxT4OjATHwylg/export?format=csv&gid=1462565781
```

### 4. Cara Test Sync

1. Jalankan aplikasi: `npm run dev`
2. Buka http://localhost:5174/
3. Klik tombol **"🔄 Sync dari Google Sheet"**
4. Tunggu hingga muncul pesan sukses: ✅ Berhasil sync X peserta dari Google Sheets!

### 5. Troubleshooting

#### Error: "Failed to fetch" atau "Network Error"
- ✅ Pastikan Google Sheets sudah di-share sebagai "Anyone with the link"
- ✅ Pastikan koneksi internet aktif
- ✅ Coba refresh halaman dan sync ulang

#### Error: "HTTP error! status: 403"
- ❌ Google Sheets belum di-share dengan akses publik
- 🔧 Solusi: Ikuti langkah #1 di atas

#### Data tidak muncul / 0 peserta
- ✅ Pastikan kolom header menggunakan huruf kecil: `nim`, `nama`, `fakultas`, `prodi`, `hp`
- ✅ Pastikan ada data di baris kedua dan seterusnya
- ✅ Pastikan kolom `nim` tidak kosong

### 6. Catatan Penting

- ⚡ Sync akan **MEMPERTAHANKAN** status checkbox (tahap 1-5) peserta yang sudah ada
- ⚡ Sync hanya akan menambah/update data biodata (nama, fakultas, prodi, hp)
- ⚡ Gunakan NIM sebagai identifier unik - jangan ada NIM duplikat!

---

## Link Referensi

- Google Sheets Anda: https://docs.google.com/spreadsheets/d/1ndTjsBYZAFnpBBpcSxFF8P80L-x2F7AxT4OjATHwylg/edit?gid=1462565781
- CSV Export URL: https://docs.google.com/spreadsheets/d/1ndTjsBYZAFnpBBpcSxFF8P80L-x2F7AxT4OjATHwylg/export?format=csv&gid=1462565781
