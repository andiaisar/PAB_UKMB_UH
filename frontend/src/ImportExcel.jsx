import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function ImportExcel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengkonversi Google Drive URL menjadi direct link
  const convertGoogleDriveUrl = (url) => {
    if (!url || url.trim() === '') return '';
    
    url = url.trim();
    
    // Jika sudah format googleusercontent, return as is
    if (url.includes('googleusercontent.com') || url.includes('lh3.google')) {
      return url;
    }
    
    // Extract file ID dari berbagai format Google Drive URL
    let fileId = '';
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match1) {
      fileId = match1[1];
    }
    
    // Format 2: https://drive.google.com/open?id=FILE_ID
    if (!fileId) {
      const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match2) {
        fileId = match2[1];
      }
    }
    
    // Format 3: https://drive.google.com/uc?export=view&id=FILE_ID
    if (!fileId) {
      const match3 = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
      if (match3) {
        fileId = match3[1];
      }
    }
    
    // Jika berhasil extract file ID, gunakan format uc view yang lebih stabil untuk <img>
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Jika bukan Google Drive URL atau format tidak dikenali, return as is
    return url;
  };

  const getCellValue = (row, keys) => {
    const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

    const normalizeColumnKey = (value) => {
      return String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[×✕✖]/g, 'x')
        .replace(/[^a-z0-9]/g, '');
    };

    const hyperlinkMap = row?.__hyperlinks || {};

    // Coba ambil dengan nama kolom exact terlebih dahulu
    for (const key of keys) {
      const value = row[key];
      if (hasValue(value)) {
        return String(value).trim();
      }

      const hyperlinkValue = hyperlinkMap[key];
      if (hasValue(hyperlinkValue)) {
        return String(hyperlinkValue).trim();
      }
    }

    // Fallback: cocokkan berdasarkan nama kolom yang sudah dinormalisasi
    const normalizedRowEntries = new Map();
    for (const [columnName, value] of Object.entries(row || {})) {
      if (columnName.startsWith('__')) {
        continue;
      }

      const normalizedKey = normalizeColumnKey(columnName);
      if (!normalizedRowEntries.has(normalizedKey)) {
        normalizedRowEntries.set(normalizedKey, value);
      }
    }

    for (const [columnName, value] of Object.entries(hyperlinkMap)) {
      const normalizedKey = normalizeColumnKey(columnName);
      if (!normalizedRowEntries.has(normalizedKey)) {
        normalizedRowEntries.set(normalizedKey, value);
      }
    }

    for (const key of keys) {
      const fallbackValue = normalizedRowEntries.get(normalizeColumnKey(key));
      if (hasValue(fallbackValue)) {
        return String(fallbackValue).trim();
      }
    }

    return '';
  };

  const extractRowHyperlinks = (worksheet, rowCount) => {
    if (!worksheet || !worksheet['!ref']) {
      return [];
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headerRowIndex = range.s.r;
    const headersByColumn = new Map();

    for (let column = range.s.c; column <= range.e.c; column++) {
      const headerAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: column });
      const headerCell = worksheet[headerAddress];
      const headerText = headerCell?.v !== undefined && headerCell?.v !== null ? String(headerCell.v).trim() : '';

      if (headerText) {
        headersByColumn.set(column, headerText);
      }
    }

    const hyperlinksByRow = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const worksheetRowIndex = headerRowIndex + 1 + rowIndex;
      const rowHyperlinks = {};

      for (const [column, header] of headersByColumn.entries()) {
        const cellAddress = XLSX.utils.encode_cell({ r: worksheetRowIndex, c: column });
        const cell = worksheet[cellAddress];
        const targetLink = cell?.l?.Target;

        if (targetLink) {
          rowHyperlinks[header] = targetLink;
        }
      }

      hyperlinksByRow.push(rowHyperlinks);
    }

    return hyperlinksByRow;
  };

  const getNumericValue = (row, keys) => {
    const value = getCellValue(row, keys);

    if (!value) {
      return 0;
    }

    const parsedValue = parseInt(value, 10);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  const normalizeImportedUser = (row) => {
    const photoUrl = getCellValue(row, ['Pas Foto 3 x 4', 'Pas Foto 3x4', 'Pas Foto 3 × 4', 'Foto']);

    return {
      nim: getCellValue(row, ['NIM']),
      nama: getCellValue(row, ['Nama Lengkap', 'Nama']),
      nama_panggilan: getCellValue(row, ['Nama Panggilan']),
      tempat_tanggal_lahir: getCellValue(row, ['Tempat dan Tanggal Lahir']),
      jenis_kelamin: getCellValue(row, ['Jenis Kelamin']),
      agama: getCellValue(row, ['Agama']),
      whatsapp: getCellValue(row, ['Nomor Whatsapp', 'Nomor WhatsApp', 'WhatsApp']),
      alamat_domisili: getCellValue(row, ['Alamat Domisili']),
      fakultas: getCellValue(row, ['Fakultas']),
      prodi: getCellValue(row, ['Prodi']),
      angkatan: getCellValue(row, ['Angkatan']),
      kemampuan_teknis: getCellValue(row, ['Kemampuan Teknis yang Dimiliki']),
      alasan_berminat: getCellValue(row, ['Alasan berminat masuk UKMB']),
      foto: convertGoogleDriveUrl(photoUrl) || '',
      pas_foto_3x4: convertGoogleDriveUrl(photoUrl) || '',
      screenshot_krs_berjalan: getCellValue(row, ['Screenshot KRS Berjalan']),
      bukti_transfer: getCellValue(row, ['Bukti Transfer']),
      bukti_follow_ig_tiktok: getCellValue(row, ['Bukti Follow Ig dan Tiktok @ukmb_unhas', 'Bukti Follow Ig dan Tiktok']),
      timestamp_form: getCellValue(row, ['Timestamp']),
      jumlah_kepanitiaan: getNumericValue(row, ['Kepanitiaan']),
      jumlah_rapat: getNumericValue(row, ['Rapat']),
      jumlah_latihan: getNumericValue(row, ['Latihan'])
    };
  };

  const removeEmptyValues = (object) => {
    return Object.fromEntries(
      Object.entries(object).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const rowHyperlinks = extractRowHyperlinks(worksheet, jsonData.length);
      const enrichedData = jsonData.map((row, index) => ({
        ...row,
        __hyperlinks: rowHyperlinks[index] || {}
      }));
      
      // Log data untuk debugging
      console.log('📊 Data from Excel:', enrichedData);
      console.log('✅ Sample normalized users:', enrichedData.slice(0, 3).map(normalizeImportedUser));
      
      setData(enrichedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveToFirestore = async () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk disimpan!');
      return;
    }

    setLoading(true);
    try {
      // Gunakan NIM sebagai identitas utama dan biarkan baris terakhir menang jika ada duplikasi
      const uniqueData = new Map();
      
      for (const item of data) {
        const normalizedUser = normalizeImportedUser(item);
        const nim = normalizedUser.nim;
        
        if (!nim) {
          console.warn('Skipping row with empty NIM:', item);
          continue;
        }
        
        uniqueData.set(nim, normalizedUser);
      }
      
      // Simpan data yang sudah dinormalisasi tanpa mereset progress lama
      for (const normalizedUser of uniqueData.values()) {
        const nim = normalizedUser.nim;
        
        const userDocRef = doc(db, 'users', nim);
        const existingUserSnapshot = await getDoc(userDocRef);
        const existingUserData = existingUserSnapshot.exists() ? existingUserSnapshot.data() : null;

        const baseUserData = existingUserData
          ? {
              ...existingUserData,
              pab_progress: {
                wawancara: false,
                fisik: false,
                kemampuan: false,
                diklat: false,
                ...(existingUserData.pab_progress || {})
              }
            }
          : {
              poin_aktif: 0,
              poin_kinerja: 0,
              jumlah_kepanitiaan: normalizedUser.jumlah_kepanitiaan || 0,
              jumlah_rapat: normalizedUser.jumlah_rapat || 0,
              jumlah_latihan: normalizedUser.jumlah_latihan || 0,
              nilai_wawancara: 0,
              nilai_fisik: 0,
              nilai_kemampuan: 0,
              pab_progress: {
                wawancara: false,
                fisik: false,
                kemampuan: false,
                diklat: false
              }
            };

        const importedFields = removeEmptyValues(normalizedUser);

        await setDoc(userDocRef, {
          ...baseUserData,
          ...importedFields,
          nama: importedFields.nama || baseUserData.nama || '',
          nama_panggilan: importedFields.nama_panggilan || baseUserData.nama_panggilan || importedFields.nama || baseUserData.nama || '',
          foto: importedFields.foto || baseUserData.foto || importedFields.pas_foto_3x4 || baseUserData.pas_foto_3x4 || '',
          pas_foto_3x4: importedFields.pas_foto_3x4 || baseUserData.pas_foto_3x4 || importedFields.foto || baseUserData.foto || '',
          jumlah_kepanitiaan: baseUserData.jumlah_kepanitiaan ?? normalizedUser.jumlah_kepanitiaan ?? 0,
          jumlah_rapat: baseUserData.jumlah_rapat ?? normalizedUser.jumlah_rapat ?? 0,
          jumlah_latihan: baseUserData.jumlah_latihan ?? normalizedUser.jumlah_latihan ?? 0
        });
      }

      const duplicateCount = data.length - uniqueData.size;
      const message = duplicateCount > 0 
        ? `Berhasil menyimpan ${uniqueData.size} data ke Firestore! (${duplicateCount} baris duplikat berdasarkan NIM diperbarui)`
        : `Berhasil menyimpan ${uniqueData.size} data ke Firestore!`;
      
      alert(message);
      setData([]);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      alert('Gagal menyimpan data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 md:px-0">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 border border-gray-100 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Import Data Camaba dari Excel</h1>
        </div>
        
        <div className="mb-6 md:mb-8">
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-3">
            📁 Pilih File Excel (.xlsx)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-blue-50">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 cursor-pointer file:shadow-md file:transition-all"
            />
            <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              Format kolom didukung: <span className="font-semibold text-gray-700">NIM, Nama Lengkap/Nama, Nama Panggilan, Jenis Kelamin, Fakultas, Prodi, Nomor Whatsapp/WhatsApp, Pas Foto 3 x 4/Foto</span>
            </p>
          </div>
        </div>

        {data.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl md:text-2xl">📊</span>
                  Preview Data
                </h2>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  {data.length} baris
                </span>
              </div>
              <div className="overflow-x-auto -mx-4 md:mx-0 md:rounded-xl border-t md:border border-gray-200 shadow-lg">
                <table className="min-w-full bg-white">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">No</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">NIM</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama Lengkap</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama Panggilan</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Jenis Kelamin</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Fakultas</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Prodi</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nomor WhatsApp</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Pas Foto 3x4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((row, index) => {
                      const previewUser = normalizeImportedUser(row);

                      return (
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{previewUser.nim || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{previewUser.nama || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{previewUser.nama_panggilan || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{previewUser.jenis_kelamin || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{previewUser.fakultas || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{previewUser.prodi || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{previewUser.whatsapp || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          {previewUser.pas_foto_3x4 ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={previewUser.pas_foto_3x4}
                                alt={previewUser.nama || previewUser.nama_panggilan || 'Pas Foto'}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-blue-300 shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  // Coba format backup jika gagal
                                  const fileId = previewUser.pas_foto_3x4.match(/\/d\/([a-zA-Z0-9_-]+)/) || previewUser.pas_foto_3x4.match(/id=([a-zA-Z0-9_-]+)/);
                                  if (fileId && fileId[1] && !e.target.src.includes('thumbnail')) {
                                    e.target.src = `https://drive.google.com/thumbnail?id=${fileId[1]}&sz=w200`;
                                  } else {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%239ca3af"%3ENo Img%3C/text%3E%3C/svg%3E';
                                  }
                                }}
                              />
                              <a href={previewUser.pas_foto_3x4} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs">
                                Buka
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak ada</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={handleSaveToFirestore}
              disabled={loading}
              className={`w-full py-4 px-8 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg transform ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-105 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  💾 Simpan ke Firestore
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ImportExcel;
