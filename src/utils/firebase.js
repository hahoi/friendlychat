import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from 'firebase/functions';
// import { getMessaging } from "firebase/messaging/sw";


const firebaseConfig = {
    apiKey: "AIzaSyAjl7Iu2NaRuDUvhAQhecJDoNk4xMwv1S0",
    authDomain: "swell3.firebaseapp.com",
    projectId: "swell3",
    storageBucket: "swell3.appspot.com",
    messagingSenderId: "34217015565",
    appId: "1:34217015565:web:f419e095a1116356d6d844",
    measurementId: "G-81S8DD3TKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const firebaseApp = getApp();
// console.log(app === firebaseApp) //true

const analytics = getAnalytics();
const auth = getAuth();
const firestore = getFirestore();
const storage = getStorage();
const functions = getFunctions(app);
// const messaging = getMessaging();

export { auth, firestore, storage, functions }