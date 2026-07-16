import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho',
  authDomain: 'garrdash.firebaseapp.com',
  projectId: 'garrdash',
  storageBucket: 'garrdash.firebasestorage.app',
  messagingSenderId: '913250323167',
  appId: '1:913250323167:web:9a04296cfb1566de51f76a',
  measurementId: 'G-5PZJZKJNYJ',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
