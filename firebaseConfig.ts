import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSAPCEhRixRTwJTafrXKoiwHITSqVJvqA",
  authDomain: "fxbros---school-of-skills.firebaseapp.com",
  projectId: "fxbros---school-of-skills",
  storageBucket: "fxbros---school-of-skills.firebasestorage.app",
  messagingSenderId: "137923317345",
  appId: "1:137923317345:web:c89d407ec5e41d8d206420",
  measurementId: "G-3BF8KMRZ4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;