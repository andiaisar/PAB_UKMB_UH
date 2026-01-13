// Utility functions untuk PAB UKM Dashboard

/**
 * Format nomor HP Indonesia
 * @param {string} phone - Nomor HP
 * @returns {string} - Nomor HP terformat
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 0812-3456-7890
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

/**
 * Hitung progress tahap peserta
 * @param {Object} peserta - Data peserta
 * @returns {number} - Persentase progress (0-100)
 */
export const calculateProgress = (peserta) => {
  const tahapFields = ['tahap_1', 'tahap_2', 'tahap_3', 'tahap_4', 'tahap_5'];
  const completedStages = tahapFields.filter(field => peserta[field]).length;
  return (completedStages / tahapFields.length) * 100;
};

/**
 * Cek apakah peserta sudah lulus semua tahap
 * @param {Object} peserta - Data peserta
 * @returns {boolean} - True jika lulus
 */
export const isComplete = (peserta) => {
  return peserta.tahap_1 && 
         peserta.tahap_2 && 
         peserta.tahap_3 && 
         peserta.tahap_4 && 
         peserta.tahap_5;
};

/**
 * Export data ke CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Nama file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle boolean
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      // Handle string with commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get warna badge berdasarkan fakultas
 * @param {string} fakultas - Nama fakultas
 * @returns {string} - Tailwind class
 */
export const getFakultasColor = (fakultas) => {
  const colors = {
    'MIPA': 'bg-blue-100 text-blue-800',
    'Teknik': 'bg-red-100 text-red-800',
    'FEB': 'bg-green-100 text-green-800',
    'Kedokteran': 'bg-purple-100 text-purple-800',
    'Hukum': 'bg-yellow-100 text-yellow-800',
    'FISIP': 'bg-pink-100 text-pink-800',
    'Pertanian': 'bg-teal-100 text-teal-800',
    'Peternakan': 'bg-orange-100 text-orange-800',
    'Kehutanan': 'bg-emerald-100 text-emerald-800',
    'Ilmu Kelautan': 'bg-cyan-100 text-cyan-800',
  };
  
  return colors[fakultas] || 'bg-gray-100 text-gray-800';
};

/**
 * Format tanggal Indonesia
 * @param {Date} date - Objek Date
 * @returns {string} - Tanggal terformat
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('id-ID', options);
};

/**
 * Debounce function untuk search
 * @param {Function} func - Function yang akan di-debounce
 * @param {number} wait - Waktu tunggu dalam ms
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
