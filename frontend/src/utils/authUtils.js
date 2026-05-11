import { 
  updateProfile, 
  updateEmail, 
  updatePassword 
} from 'firebase/auth';
import { 
  doc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, db, storage } from '../firebase';

/**
 * Update profile user di Firestore
 */
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update email Firebase Auth dan Firestore
 */
export const updateUserEmail = async (uid, newEmail) => {
  try {
    // Update Firebase Auth
    await updateEmail(auth.currentUser, newEmail);
    
    // Update Firestore
    await updateUserProfile(uid, { email: newEmail });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update password Firebase Auth
 */
export const updateUserPassword = async (newPassword) => {
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Upload dan update profile picture
 */
export const updateProfilePicture = async (uid, file, oldPhotoUrl = null) => {
  try {
    // Hapus foto lama jika ada
    if (oldPhotoUrl) {
      try {
        const oldPhotoRef = ref(storage, oldPhotoUrl);
        await deleteObject(oldPhotoRef);
      } catch (err) {
        console.warn('Failed to delete old photo:', err);
      }
    }

    // Upload foto baru
    const storageRef = ref(storage, `profilePictures/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firestore
    await updateUserProfile(uid, { fotoUrl: downloadURL });

    return { success: true, fotoUrl: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get user data dari Firestore
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDocs(
      query(collection(db, 'users'), where('uid', '==', uid))
    );
    if (userDoc.empty) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: userDoc.docs[0].data() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all users (Admin only - pastikan ada security check)
 */
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => doc.data());
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (uid, newRole) => {
  try {
    if (!['admin', 'user'].includes(newRole)) {
      throw new Error('Invalid role');
    }
    await updateUserProfile(uid, { role: newRole });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update nilai/score user
 */
export const updateUserNilai = async (uid, nilaiData) => {
  try {
    await updateUserProfile(uid, {
      nilai: {
        fisik: nilaiData.fisik || 0,
        wawancara: nilaiData.wawancara || 0,
        pengetahuan: nilaiData.pengetahuan || 0,
        presentasi: nilaiData.presentasi || 0,
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const usersSnapshot = await getDocs(q);
    const users = usersSnapshot.docs.map(doc => doc.data());
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (uid) => {
  try {
    // Hapus dari Firestore
    await deleteDoc(doc(db, 'users', uid));
    
    // Note: Hapus dari Firebase Auth harus dilakukan dari server
    // menggunakan Firebase Admin SDK karena security reasons
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validasi email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validasi password strength
 */
export const isStrongPassword = (password) => {
  return password.length >= 6;
};

/**
 * Format error message dari Firebase
 */
export const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar';
    case 'auth/invalid-email':
      return 'Format email tidak valid';
    case 'auth/weak-password':
      return 'Password terlalu lemah';
    case 'auth/user-not-found':
      return 'User tidak ditemukan';
    case 'auth/wrong-password':
      return 'Password salah';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan, coba lagi nanti';
    case 'auth/invalid-credential':
      return 'Email atau password salah';
    default:
      return error.message || 'Terjadi kesalahan';
  }
};
