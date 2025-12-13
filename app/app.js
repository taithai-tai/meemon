// =====================
// LOG helper
// =====================
const logEl = document.getElementById("log");
function log(msg, obj) {
  const line = obj ? `${msg}\n${JSON.stringify(obj, null, 2)}` : msg;
  console.log(line);
  logEl.textContent += "\n\n" + line;
}

// =====================
// Firebase (Module CDN)
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// =====================
// Firebase config (ของคุณ)
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyBcEydl7HHzE3WdVgJc65O8-IEGYVUbZxY",
  authDomain: "meemon-app.firebaseapp.com",
  projectId: "meemon-app",
  messagingSenderId: "801234540684",
  appId: "1:801234540684:web:9238eb229688d2d15183a9"
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

// =====================
// LIFF
// =====================
const LIFF_ID = "2008685502-NdidvjVm";

let liffReady = false;

async function initLiff() {
  try {
    log("Init LIFF…");
    await liff.init({ liffId: LIFF_ID });
    liffReady = true;

    log("LIFF Ready ✅");
    log("isLoggedIn:", liff.isLoggedIn());
    log("OS:", liff.getOS());
    log("Language:", liff.getLanguage());
    log("Context:", liff.getContext());

  } catch (e) {
    log("LIFF ERROR:", { message: e.message });
  }
}

async function loginLine() {
  if (!liffReady) await initLiff();

  if (!liff.isLoggedIn()) {
    log("Redirect to LINE login…");
    liff.login();
    return;
  }
  log("Already logged in LINE ✅");
}

async function getProfileAndSave() {
  if (!liffReady) await initLiff();

  if (!liff.isLoggedIn()) {
    log("Not logged in LINE ❌ (กด Login ก่อน)");
    return;
  }

  try {
    log("Get LINE Profile…");
    const profile = await liff.getProfile();
    log("LINE Profile ✅", profile);

    // ทดสอบว่าได้ token จริง
    const idToken = liff.getIDToken();
    log("ID Token (exists?)", { hasIdToken: !!idToken });

    // Firebase sign-in (anonymous)
    if (!auth.currentUser) {
      log("Sign in Firebase anonymously…");
      await signInAnonymously(auth);
      log("Firebase login ✅");
    } else {
      log("Firebase already logged in ✅");
    }

    // Save to Firestore
    log("Save to Firestore…");
    await setDoc(doc(db, "liff_test_users", profile.userId), {
      userId: profile.userId,
      displayName: profile.displayName || "",
      pictureUrl: profile.pictureUrl || "",
      // เก็บค่าเพื่อดูว่ามาจากโดเมนไหน
      currentUrl: location.href,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    log("✅ SAVE SUCCESS: Firestore (liff_test_users/" + profile.userId + ")");

  } catch (e) {
    log("ERROR:", { message: e.message });
  }
}

async function logoutLine() {
  if (!liffReady) await initLiff();

  if (liff.isLoggedIn()) {
    liff.logout();
    log("Logged out LINE ✅ (refresh หน้าเพื่อทดสอบใหม่)");
  } else {
    log("Already logged out");
  }
}

// =====================
// Wire UI
// =====================
document.getElementById("btnInit").onclick = initLiff;
document.getElementById("btnLogin").onclick = loginLine;
document.getElementById("btnProfile").onclick = getProfileAndSave;
document.getElementById("btnLogout").onclick = logoutLine;

// Auto init
initLiff();
