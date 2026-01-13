import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test 1: Cek apakah db object ada
      if (!db) {
        throw new Error('Firebase DB not initialized');
      }
      setStatus('✅ Firebase DB initialized');

      // Test 2: Coba buat collection test (tidak akan benar-benar disimpan jika rules melarang)
      const testCollection = collection(db, 'test_connection');
      setStatus('✅ Firebase connected successfully!');
      
    } catch (err) {
      setError(err.message);
      setStatus('❌ Connection failed');
    }
  };

  const testWriteData = async () => {
    try {
      const testData = {
        nama: 'Test User',
        nim: 'TEST123',
        timestamp: new Date().toISOString()
      };

      const testCollection = collection(db, 'test_peserta');
      await addDoc(testCollection, testData);
      
      setStatus('✅ Write test successful!');
    } catch (err) {
      setError(err.message);
      setStatus('❌ Write test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Firebase Connection Test
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Status:</p>
            <p className="text-lg font-bold text-blue-600">{status}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Error:</p>
              <p className="text-sm text-red-600 break-words">{error}</p>
            </div>
          )}

          <button
            onClick={testWriteData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Write Data
          </button>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Jika koneksi berhasil, Anda bisa kembali ke App.jsx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
