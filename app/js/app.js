// ==============================
// 🔥 DEBUG (เช็กว่าไฟล์โหลดจริง)
// ==============================
console.log("✅ app.js loaded");

// ==============================
// Firebase (Module CDN)
// ==============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ==============================
// Firebase config (ของคุณ)
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyBcEydl7HHzE3WdVgJc65O8-IEGYVUbZxY",
  authDomain: "meemon-app.firebaseapp.com",
  projectId: "meemon-app",
  storageBucket: "meemon-app.firebasestorage.app",
  messagingSenderId: "801234540684",
  appId: "1:801234540684:web:9238eb229688d2d15183a9"
};

// Init Firebase
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

// ==============================
// LIFF
// ==============================
const LIFF_ID = "2008685502-NdidvjVm";

// ==============================
// DOM
// ==============================
const statusEl = document.getElementById("status");
const loginBtn = document.getElementById("btnLogin");

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ==============================
// Init App
// ==============================
async function init() {
  try {
    setStatus("กำลังเริ่ม LIFF…");

    await liff.init({ liffId: LIFF_ID });

    // ผูกปุ่ม (ทำให้กดได้แน่นอน)
    loginBtn.onclick = async () => {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }
      await afterLogin();
    };

    if (liff.isLoggedIn()) {
      await afterLogin();
    } else {
      setStatus("ยังไม่ล็อกอิน LINE");
    }

  } catch (e) {
    console.error(e);
    setStatus("LIFF Error: " + e.message);
  }
}

// ==============================
// หลังล็อกอิน LINE
// ==============================
async function afterLogin() {
  try {
    setStatus("กำลังโหลดโปรไฟล์ LINE…");
    const profile = await liff.getProfile();

    setStatus("กำลังล็อกอิน Firebase…");
    await signInAnonymously(auth);

    setStatus("กำลังบันทึกข้อมูล…");
    await setDoc(
      doc(db, "users", profile.userId),
      {
        userId: profile.userId,
        displayName: profile.displayName || "",
        pictureUrl: profile.pictureUrl || "",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    setStatus(`สำเร็จ 🎉 สวัสดี ${profile.displayName}`);

  } catch (e) {
    console.error(e);
    setStatus("Error: " + e.message);
  }
}

// ==============================
// Start
// ==============================
init();
