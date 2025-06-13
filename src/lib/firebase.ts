
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace these with your actual Firebase project configuration values!
// You can find these in your Firebase project settings.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDq6WZ_mKs0CiKvNlIRco2TVHbTu6y6x-Q",
    authDomain: "kgchess-dc8ac.firebaseapp.com",
      projectId: "kgchess",
        storageBucket: "kgchess.firebasestorage.app",
          messagingSenderId: "43925445120",
            appId: "1:43925445120:web:f95b9610d09871d2ef16e5"
            // Optional
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
