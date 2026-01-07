import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAMmz9F-2gLoBuSdZp-JabiMfjiuah0T9o",
    authDomain: "nusavite-official.firebaseapp.com",
    projectId: "nusavite-official",
    storageBucket: "nusavite-official.firebasestorage.app",
    messagingSenderId: "232447680096",
    appId: "1:232447680096:web:20c55b7f7f5f1f48692d05",
    measurementId: "G-N8MSF03XQ3"
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { ref, uploadBytes, getDownloadURL, deleteObject };
export const googleProvider = new GoogleAuthProvider();
