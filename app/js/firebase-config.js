// การตั้งค่า Firebase (อัปเดตค่าจริงแล้ว)
const firebaseConfig = {
  apiKey: "AIzaSyBcEydl7HHzE3WdVgJc65O8-IEGYVUbZxY",
  authDomain: "meemon-app.firebaseapp.com",
  projectId: "meemon-app",
  storageBucket: "meemon-app.firebasestorage.app",
  messagingSenderId: "801234540684",
  appId: "1:801234540684:web:9238eb229688d2d15183a9"
};

// ******************************************************
// [อัปเดตแล้ว] รหัส LIFF ID ที่ถูกต้องพร้อมใช้งานครับ
// ******************************************************

const LIFF_ID = "2008685502-WBAWzCrl"; 

// ******************************************************

// เริ่มต้นการทำงาน (ห้ามแก้ไขส่วนนี้)
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase Init Error (ตรวจสอบ Config ด้านบน):", e);
}
const db = firebase.firestore();
const auth = firebase.auth();
