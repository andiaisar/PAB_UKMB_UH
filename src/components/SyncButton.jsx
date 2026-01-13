import { useState } from 'react';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import Papa from 'papaparse';

const SyncButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setMessage('');

    try {
      // URL Google Sheet yang sudah di-publish ke web
      // Published URL (HTML): https://docs.google.com/spreadsheets/d/e/2PACX-1vRa643VjZQBJcqFd--Jr2ihV5U0rp34fEsxlE-3E6g-HRWYf9UGzEaNEsCH-kopqYZjsp8ZwL52LyoQ/pubhtml?gid=1921756972&single=true
      // CSV URL: Ganti 'pubhtml' jadi 'pub' dan tambahkan '&output=csv'
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRa643VjZQBJcqFd--Jr2ihV5U0rp34fEsxlE-3E6g-HRWYf9UGzEaNEsCH-kopqYZjsp8ZwL52LyoQ/pub?gid=1921756972&single=true&output=csv';
      
      // Fetch data dari Google Sheet (format CSV)
      const response = await fetch(sheetUrl, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const csvData = await response.text();
      
      // Parse CSV menggunakan PapaParse
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      
      if (parseResult.errors.length > 0) {
        console.warn('Parse warnings:', parseResult.errors);
      }
      
      const pesertaData = parseResult.data;
      
      console.log('📊 Jumlah data:', pesertaData.length);
      
      if (pesertaData.length === 0) {
        setMessage('⚠️ Tidak ada data di spreadsheet!');
        return;
      }

      // Simpan ke Firestore dengan batch (lebih cepat)
      const pesertaRef = collection(db, 'peserta');
      let successCount = 0;
      let skippedCount = 0;
      
      // Gunakan Promise.all untuk parallel processing (lebih cepat)
      const savePromises = pesertaData.map(async (peserta) => {
        // Mapping sesuai nama kolom di spreadsheet
        const actualNama = peserta.NAMA?.trim(); 
        const actualNim = peserta.NIM?.trim();
        const fakultas = peserta.FAKULTAS?.trim();
        const prodi = peserta.PRODI?.trim();
        const nomoHp = peserta['NOMO HP']?.trim();
        
        // Skip jika tidak ada NIM yang valid
        if (!actualNim || actualNim === '') {
          skippedCount++;
          return null;
        }

        // Data yang akan disimpan
        const dataToSave = {
          nama: actualNama || '',
          nim: actualNim || '',
          fakultas: fakultas || '',
          prodi: prodi || '',
          hp: nomoHp || '',
          tahap_1: false,
          tahap_2: false,
          tahap_3: false,
          tahap_4: false,
          tahap_5: false,
        };

        // Simpan dengan merge: true (parallel)
        const docRef = doc(pesertaRef, actualNim);
        await setDoc(docRef, dataToSave, { merge: true });
        return actualNim;
      });

      // Tunggu semua proses selesai (parallel processing)
      const results = await Promise.all(savePromises);
      successCount = results.filter(r => r !== null).length;

      setMessage(`✅ Berhasil sync ${successCount} peserta!${skippedCount > 0 ? ` (${skippedCount} dilewati)` : ''}`);
      
    } catch (error) {
      console.error('❌ Error saat sync:', error);
      
      let errorMsg = error.message;
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMsg = 'Tidak dapat mengakses Google Sheets. Pastikan sudah di-share dengan "Anyone with the link"!';
      }
      
      setMessage(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleSync}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Syncing...
          </span>
        ) : (
          '🔄 Sync dari Google Sheet'
        )}
      </button>
      
      {message && (
        <p className={`mt-3 text-sm font-medium ${
          message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        * Sync akan mempertahankan status checkbox (tahap 1-5) peserta yang sudah ada
      </p>
    </div>
  );
};

export default SyncButton;
