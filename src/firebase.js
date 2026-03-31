// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4YpZts2fzVA0XamuNGXwmu1A0ZSp6pNU",
  authDomain: "novaai-6376a.firebaseapp.com",
  projectId: "novaai-6376a",
  storageBucket: "novaai-6376a.firebasestorage.app",
  messagingSenderId: "1096928338572",
  appId: "1:1096928338572:web:2084f52cf4158dac2251a9",
  measurementId: "G-FVVLWM1XNX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);