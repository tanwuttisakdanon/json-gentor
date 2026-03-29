import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// แทนที่ข้อมูลตรงนี้ด้วย Config ที่คุณ Copy มาจาก Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDHIxMyQMe_6lBNZvx4iXhPcLyabkNlJ_k",
    authDomain: "mis-json-generator.firebaseapp.com",
    projectId: "mis-json-generator",
    storageBucket: "mis-json-generator.firebasestorage.app",
    messagingSenderId: "363737000968",
    appId: "1:363737000968:web:0214c038e7ce456f6f35bd",
    measurementId: "G-1P6SFN63P7"
};

// เริ่มต้นเปิดเครื่อง Firebase
const app = initializeApp(firebaseConfig);

// เปิดใช้งานระบบ Auth และ Database
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);