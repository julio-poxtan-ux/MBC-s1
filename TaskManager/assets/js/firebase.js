// firebase.js — Inicialización y exportación de servicios Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqxzLS224pLq4wOOoN1wfFIO02Ag_cZ2A",
  authDomain: "taskmanager-dc3b4.firebaseapp.com",
  projectId: "taskmanager-dc3b4",
  storageBucket: "taskmanager-dc3b4.firebasestorage.app",
  messagingSenderId: "857252268371",
  appId: "1:857252268371:web:0e000e30c805a78fe7f9a6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
