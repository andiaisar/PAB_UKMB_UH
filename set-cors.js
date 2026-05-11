const { Storage } = require('@google-cloud/storage');

// Inisialisasi Storage dengan Service Account Key
const storage = new Storage({
  keyFilename: './serviceAccountKey.json',
});

// Nama bucket
const bucketName = 'keorganisasian-36fbe.firebasestorage.app';

// Konfigurasi CORS
const corsConfiguration = [
  {
    origin: ['*'],
    method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
    responseHeader: ['*'],
    maxAgeSeconds: 3600,
  },
];

async function setCorsPolicy() {
  try {
    const bucket = storage.bucket(bucketName);

    // Set CORS policy
    await bucket.setCorsConfiguration(corsConfiguration);

    console.log(`✓ CORS policy berhasil dikonfigurasi untuk bucket: ${bucketName}`);
    console.log('\nKonfigurasi CORS yang diterapkan:');
    console.log(JSON.stringify(corsConfiguration, null, 2));

  } catch (error) {
    console.error('✗ Gagal mengatur CORS policy:', error.message);
    process.exit(1);
  }
}

// Jalankan fungsi
setCorsPolicy();
