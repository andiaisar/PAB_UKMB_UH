# 🔧 Cara Memperbaiki Error 404 - Spreadsheet Tidak Bisa Diakses

Error: **HTTP error! status: 404** berarti Google Sheets tidak bisa diakses secara publik.

## ✅ Solusi: Publish Spreadsheet ke Web

### Langkah 1: Buka Spreadsheet
Buka: https://docs.google.com/spreadsheets/d/1lSKNTaQ29Fd3XqII03JYmd7eS5hFMm8tAkcxflso5tw/

### Langkah 2: Publish ke Web
1. Klik menu **File** → **Share** → **Publish to web** (Publikasikan ke web)
2. Di bagian "Link", pilih:
   - **Entire Document** atau pilih sheet spesifik (Form_Responses)
   - Format: **Comma-separated values (.csv)**
3. Klik tombol **Publish** (Publikasikan)
4. Konfirmasi dengan klik **OK**

### Langkah 3: Set Sharing Permission
1. Klik tombol **Share** (hijau, pojok kanan atas)
2. Klik **"Change to anyone with the link"**
3. Pastikan role: **Viewer**
4. Klik **Done**

### Langkah 4: Test URL
Setelah publish, coba buka URL ini di browser (mode incognito):

**Tanpa GID (Sheet Pertama):**
```
https://docs.google.com/spreadsheets/d/1lSKNTaQ29Fd3XqII03JYmd7eS5hFMm8tAkcxflso5tw/export?format=csv
```

**Dengan GID (Sheet Spesifik):**
```
https://docs.google.com/spreadsheets/d/1lSKNTaQ29Fd3XqII03JYmd7eS5hFMm8tAkcxflso5tw/export?format=csv&gid=1921756972
```

### Langkah 5: Cara Mendapatkan GID yang Benar
1. Buka spreadsheet Anda
2. Lihat URL di address bar:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID_NUMBER
   ```
3. Angka setelah `gid=` adalah GID sheet yang aktif
4. Contoh: jika URL menunjukkan `gid=1921756972`, maka GID adalah `1921756972`

### Langkah 6: Cek Sheet Name
Sheet yang berisi data form biasanya bernama:
- "Form Responses 1" atau "Form_Responses"
- Pastikan sheet ini yang dipilih saat publish

## 🎯 Cara Test Apakah Sudah Berhasil:

### Test 1: Buka di Browser
Buka URL CSV di browser (mode incognito/private):
```
https://docs.google.com/spreadsheets/d/1lSKNTaQ29Fd3XqII03JYmd7eS5hFMm8tAkcxflso5tw/export?format=csv
```

**Jika berhasil:** Browser akan download file CSV atau menampilkan data CSV
**Jika gagal:** Browser akan menampilkan error 404 atau redirect ke login Google

### Test 2: Sync di Aplikasi
1. Refresh browser aplikasi (http://localhost:5173/)
2. Klik tombol **"🔄 Sync dari Google Sheet"**
3. Buka Console (F12 → Console)
4. Lihat log - Seharusnya muncul:
   - ✅ Response status: 200 OK
   - ✅ Data CSV berhasil diambil
   - ✅ Berhasil sync X peserta!

## 🔍 Troubleshooting

### Error: 403 Forbidden
- ❌ Spreadsheet belum di-share dengan "Anyone with the link"
- 🔧 Solusi: Ikuti Langkah 3 di atas

### Error: 404 Not Found
- ❌ Spreadsheet belum di-publish ke web ATAU
- ❌ GID salah ATAU
- ❌ Sheet ID salah
- 🔧 Solusi: 
  1. Pastikan sudah publish (Langkah 2)
  2. Cek GID yang benar (Langkah 5)
  3. Coba tanpa GID dulu

### Data Kosong / 0 Peserta
- ❌ Sheet yang dipilih kosong atau salah sheet
- ❌ Nama kolom tidak sesuai
- 🔧 Solusi:
  1. Pastikan pilih sheet yang benar saat publish
  2. Kolom harus: `Timestamp`, `NAMA`, `NIM`, `FAKULTAS`, `PRODI`, `NOMO HP`

## 📝 Catatan Penting

1. **Publish vs Share itu BERBEDA!**
   - Share = Kasih akses ke orang tertentu
   - Publish = Bikin bisa diakses publik via URL export

2. **Keamanan:**
   - Data yang di-publish bisa dilihat siapa saja yang punya link
   - Jangan publish spreadsheet yang berisi data sensitif
   - Setting "Viewer" sudah cukup, tidak perlu "Editor"

3. **Update Otomatis:**
   - Setelah publish, perubahan di spreadsheet akan langsung terlihat
   - Tidak perlu publish ulang setiap kali ada perubahan data
