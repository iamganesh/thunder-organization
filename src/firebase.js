import firebase from "firebase/app";
import 'firebase/database'; // If using Firebase database
import 'firebase/storage';  // If using Firebase storage
import "firebase/firestore";
import "firebase/auth";
const config = {
    apiKey: "AIzaSyBARiQg1uSFbX3q1PrlExXlBVBwveGmHyI",
    authDomain: "money-mania-5b576.firebaseapp.com",
    databaseURL: "https://money-mania-5b576.firebaseio.com",
    projectId: "money-mania-5b576",
    storageBucket: "money-mania-5b576.appspot.com",
    messagingSenderId: "980857145356",
    appId: "1:980857145356:web:d5540c03f43aad25c6c629",
    measurementId: "G-1QE4X322RZ"
};

// const app = firebase.initializeApp({
//     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_FIREBASE_APP_ID
//   })

// Initialize Firebase
firebase.initializeApp(config);

export default firebase;