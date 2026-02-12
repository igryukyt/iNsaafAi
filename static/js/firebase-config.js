// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfrcuPVjL7DjIYRIwvTm0n3nwyM5hNUn0",
    authDomain: "abhishek-584d7.firebaseapp.com",
    projectId: "abhishek-584d7",
    storageBucket: "abhishek-584d7.firebasestorage.app",
    messagingSenderId: "578279871893",
    appId: "1:578279871893:web:1ab80adbd2f9c75741529c",
    measurementId: "G-PF5NJRJTZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
