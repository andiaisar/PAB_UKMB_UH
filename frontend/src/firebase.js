import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-HbXvenGEwqLf6Y_Bbi2AzB6-FmWxgrA",
  authDomain: "keorganisasian-36fbe.firebaseapp.com",
  projectId: "keorganisasian-36fbe",
  storageBucket: "keorganisasian-36fbe.firebasestorage.app",
  messagingSenderId: "860583924954",
  appId: "1:860583924954:web:a0d4edd4548fa8732941e3",
  measurementId: "G-EH5E8GKK64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
