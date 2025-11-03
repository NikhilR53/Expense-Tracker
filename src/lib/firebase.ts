// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7TVAsZtBe4DvlUZfyEJGNcOjyQu-6bZU",
  authDomain: "expense-tracker-a938f.firebaseapp.com",
  projectId: "expense-tracker-a938f",
  storageBucket: "expense-tracker-a938f.appspot.com",
  messagingSenderId: "815908877711",
  appId: "1:815908877711:web:340ddc987a8439e91b07fa",
  measurementId: "G-HP3CZETWDV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
