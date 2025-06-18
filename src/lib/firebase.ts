
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // Added GoogleAuthProvider
import { getStorage } from 'firebase/storage';

// --- Critical Environment Variable Checks ---
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  throw new Error(
    "CRITICAL: Firebase API Key is missing. NEXT_PUBLIC_FIREBASE_API_KEY is not set. " +
    "Please ensure this variable is defined in your .env.local file " +
    "(e.g., NEXT_PUBLIC_FIREBASE_API_KEY=yourActualApiKey) and that you have " +
    "restarted your Next.js development server."
  );
}

if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  throw new Error(
    "CRITICAL: Firebase Auth Domain is missing. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is not set. " +
    "Please ensure this variable is defined (e.g., in .env.local or App Hosting config like apphosting.yaml) " +
    "and that you have restarted your Next.js development server if applicable."
  );
}


// Firebase configuration will be read from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  // Additional checks for other critical variables before initializing
  if (!firebaseConfig.projectId) {
    console.error(
      "Firebase Project ID is missing. Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set in your environment."
    );
    // You might want to throw an error here too if projectId is absolutely essential for any part of the app to load
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider(); // Export GoogleAuthProvider instance

export { app, db, auth, storage, googleProvider };

