import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    
    // Jika berhasil extract file ID, gunakan format googleusercontent (paling reliable)
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    
    // Jika bukan Google Drive URL atau format tidak dikenali, return as is
    return url;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Log data untuk debugging
      console.log('📊 Data from Excel:', jsonData);
      console.log('📸 Sample Foto URLs:', jsonData.slice(0, 3).map(row => row.Foto));
      
      setData(jsonData);
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
      // Filter duplikasi berdasarkan NIM dan Nama yang sama
      const uniqueData = [];
      const seenEntries = new Map();
      
      for (const item of data) {
        const nim = item.NIM || '';
        const nama = item.Nama || '';
        const key = `${nim}_${nama}`;
        
        if (!nim) {
          console.warn('Skipping row with empty NIM:', item);
          continue;
        }
        
        // Hanya ambil yang pertama jika NIM dan nama sama
        if (!seenEntries.has(key)) {
          seenEntries.set(key, true);
          uniqueData.push(item);
        } else {
          console.log('Skipping duplicate entry:', { nim, nama });
        }
      }
      
      // Simpan data yang sudah unik
      for (const item of uniqueData) {
        const nim = item.NIM || '';
        
        const userDocRef = doc(db, 'users', nim);
        await setDoc(userDocRef, {
          nim: nim,
          nama: item.Nama || '',
          fakultas: item.Fakultas || '',
          prodi: item.Prodi || '',
          whatsapp: item.WhatsApp || '',
          foto: convertGoogleDriveUrl(item.Foto) || '',
          jumlah_kepanitiaan: parseInt(item.Kepanitiaan) || 0,
          jumlah_rapat: parseInt(item.Rapat) || 0,
          poin_aktif: 0,
          pab_progress: {
            wawancara: false,
            fisik: false,
            diklat: false
          }
        });
      }

      const duplicateCount = data.length - uniqueData.length;
      const message = duplicateCount > 0 
        ? `Berhasil menyimpan ${uniqueData.length} data ke Firestore! (${duplicateCount} data duplikat dilewati)`
        : `Berhasil menyimpan ${uniqueData.length} data ke Firestore!`;
      
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
              Format kolom: <span className="font-semibold text-gray-700">NIM, Nama, Fakultas, Prodi, WhatsApp, Foto</span>
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
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Fakultas</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Prodi</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">WhatsApp</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Foto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{row.NIM}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.Nama}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{row.Fakultas}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{row.Prodi || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.WhatsApp}</td>
                        <td className="px-6 py-4 text-sm">
                          {row.Foto ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={convertGoogleDriveUrl(row.Foto)}
                                alt={row.Nama}
                                crossOrigin="anonymous"
                                className="w-12 h-12 rounded-lg object-cover border-2 border-blue-300 shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  // Coba format backup jika gagal
                                  const fileId = row.Foto.match(/\/d\/([a-zA-Z0-9_-]+)/) || row.Foto.match(/id=([a-zA-Z0-9_-]+)/);
                                  if (fileId && fileId[1] && !e.target.src.includes('thumbnail')) {
                                    e.target.src = `https://drive.google.com/thumbnail?id=${fileId[1]}&sz=w200`;
                                  } else {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%239ca3af"%3ENo Img%3C/text%3E%3C/svg%3E';
                                  }
                                }}
                              />
                              <a href={row.Foto} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs">
                                Buka
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak ada</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
