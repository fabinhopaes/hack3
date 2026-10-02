import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBWg1VEilkAu0Ay6iDqnvOfKNrivS-6DDs",
  authDomain: "hackathon-000.firebaseapp.com",
  projectId: "hackathon-000",
  storageBucket: "hackathon-000.firebasestorage.app",
  messagingSenderId: "99477965459",
  appId: "1:99477965459:web:7c52a2bd96c5c797881b66"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
