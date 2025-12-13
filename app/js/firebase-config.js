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

const LIFF_ID = "2008685502-NdidvjVm"; 

// ******************************************************

// ประกาศตัวแปร Global ไว้ก่อน เพื่อป้องกัน ReferenceError
let db;
let auth;

// เริ่มต้นการทำงาน (เพิ่มการตรวจสอบเพื่อป้องกัน Error จอขาว)
if (typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase
        // ตรวจสอบว่ายังไม่เคย Init มาก่อน
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Setup Services
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log("✅ Firebase Connected");
    } catch (e) {
        console.error("❌ Firebase Init Error (ตรวจสอบ Config):", e);
        // แจ้งเตือนเมื่อ Config ผิดพลาด
        if (typeof window !== 'undefined') alert("การตั้งค่า Firebase ไม่ถูกต้อง: " + e.message);
    }
} else {
    // กรณีที่โหลด script ไม่สำเร็จ (เช่น เน็ตหลุด หรือ CDN 404)
    const errorMsg = "⚠️ CRITICAL: ไม่พบ Firebase SDK\n\nสาเหตุที่เป็นไปได้:\n1. ไม่ได้เชื่อมต่ออินเทอร์เน็ต (สำคัญ!)\n2. เว็บไซต์ถูกบล็อกการเชื่อมต่อ (Firewall)\n3. ไฟล์ index.html ขาด script tag ที่จำเป็น";
    console.error(errorMsg);
    
    // แจ้งเตือนผู้ใช้เมื่อหน้าเว็บโหลดเสร็จ
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            alert("ไม่สามารถเชื่อมต่อระบบได้ (Network Error)\n\nเบราว์เซอร์ไม่สามารถโหลดไฟล์ระบบจากอินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ WiFi/Internet ของคุณ");
        });
    }
}

// ตรวจสอบ LIFF SDK ด้วย
if (typeof liff === 'undefined') {
    console.error("❌ LINE LIFF SDK not loaded (404) - ตรวจสอบอินเทอร์เน็ต");
}
