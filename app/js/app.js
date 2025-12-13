import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ✅ Firebase config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyBcEydl7HHzE3WdVgJc65O8-IEGYVUbZxY",
  authDomain: "meemon-app.firebaseapp.com",
  projectId: "meemon-app",
  storageBucket: "meemon-app.firebasestorage.app",
  messagingSenderId: "801234540684",
  appId: "1:801234540684:web:9238eb229688d2d15183a9"
};

// ✅ init Firebase
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

// ✅ LIFF ID ของคุณ
const LIFF_ID = "2008685502-NdidvjVm";

const $status = document.getElementById("status");
const $btn = document.getElementById("btnLogin");

function setStatus(msg) {
  $status.textContent = msg;
}

async function init() {
  try {
    setStatus("กำลังเริ่ม LIFF…");
    await liff.init({ liffId: LIFF_ID });

    if (liff.isLoggedIn()) {
      setStatus("Logged in แล้ว ✅ กำลังโหลดโปรไฟล์…");
      await afterLineLogin();
    } else {
      setStatus("ยังไม่ล็อกอิน LINE");
    }

    $btn.addEventListener("click", async () => {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }
      await afterLineLogin();
    });

  } catch (err) {
    console.error(err);
    setStatus("LIFF Error: " + (err?.message || err));
  }
}

async function afterLineLogin() {
  try {
    const profile = await liff.getProfile();

    setStatus("กำลังล็อกอิน Firebase…");
    await signInAnonymously(auth);

    setStatus("กำลังบันทึกข้อมูล…");
    await setDoc(doc(db, "users", profile.userId), {
      userId: profile.userId,
      displayName: profile.displayName || "",
      pictureUrl: profile.pictureUrl || "",
      updatedAt: serverTimestamp()
    }, { merge: true });

    setStatus("สำเร็จ 🎉 ข้อมูล sync ทุกเครื่องแล้ว");
  } catch (err) {
    console.error(err);
    setStatus("Error: " + (err?.message || err));
  }
}

init();
