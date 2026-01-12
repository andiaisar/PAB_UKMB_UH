import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SyncButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setMessage('');

    try {
      // URL Google Sheet yang sudah dipublish sebagai CSV atau JSON
      // Ganti dengan URL Google Sheet Anda
      // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:json
      // atau export sebagai CSV: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv
      
      const sheetUrl = 'YOUR_GOOGLE_SHEET_URL_HERE';
      
      // Contoh fetch data dari Google Sheet (format CSV)
      const response = await fetch(sheetUrl);
      const csvData = await response.text();
      
      // Parse CSV ke array of objects
      const rows = csvData.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      const pesertaData = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        const values = rows[i].split(',').map(v => v.trim());
        const peserta = {};
        
        headers.forEach((header, index) => {
          peserta[header] = values[index] || '';
        });
        
        pesertaData.push(peserta);
      }

      // Simpan ke Firestore dengan merge: true
      const pesertaRef = collection(db, 'peserta');
      let successCount = 0;

      for (const peserta of pesertaData) {
        if (!peserta.nim || peserta.nim === '') continue;

        // Gunakan NIM sebagai document ID
        const docRef = doc(pesertaRef, peserta.nim);
        
        // Data yang akan disimpan (hanya data dari sheet, tidak termasuk status tahap)
        // Status tahap akan dipertahankan jika sudah ada (merge: true)
        const dataToSave = {
          nama: peserta.nama || '',
          nim: peserta.nim || '',
          fakultas: peserta.fakultas || '',
          prodi: peserta.prodi || '',
          hp: peserta.hp || '',
          // Inisialisasi status tahap hanya untuk peserta BARU
          // Jika peserta sudah ada, merge: true akan mempertahankan nilai lama
          tahap_1: peserta.tahap_1 === 'true' || false,
          tahap_2: peserta.tahap_2 === 'true' || false,
          tahap_3: peserta.tahap_3 === 'true' || false,
          tahap_4: peserta.tahap_4 === 'true' || false,
          tahap_5: peserta.tahap_5 === 'true' || false,
        };

        // PENTING: merge: true memastikan data lama tidak tertimpa
        await setDoc(docRef, dataToSave, { merge: true });
        successCount++;
      }

      setMessage(`✅ Berhasil sync ${successCount} peserta!`);
      
    } catch (error) {
      console.error('Error saat sync:', error);
      setMessage(`❌ Error: ${error.message}`);
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
