import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase config (ของคุณ)
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

// LIFF ID (ของคุณ)
const LIFF_ID = "2008685502-NdidvjVm";

window.addEventListener("DOMContentLoaded", () => {
  const logEl = document.getElementById("log");

  function log(msg, obj) {
    const text = obj ? `${msg}\n${JSON.stringify(obj, null, 2)}` : msg;
    console.log(text);
    logEl.textContent += "\n\n" + text;
  }

  // ✅ เช็ก element ให้ชัด ถ้าหายจะบอกทันที (แทนที่จะพังเงียบ)
  const btnInit = document.getElementById("btnInit");
  const btnLogin = document.getElementById("btnLogin");
  const btnProfile = document.getElementById("btnProfile");
  const btnLogout = document.getElementById("btnLogout");

  if (!btnInit || !btnLogin || !btnProfile || !btnLogout || !logEl) {
    console.error("Missing elements", { btnInit, btnLogin, btnProfile, btnLogout, logEl });
    return;
  }

  let ready = false;

  async function initLiff() {
    try {
      log("Init LIFF…");
      await liff.init({ liffId: LIFF_ID });
      ready = true;

      log("LIFF Ready ✅");
      log("isLoggedIn:", liff.isLoggedIn());
      log("Current URL:", location.href);

      // ถ้า login แล้ว สามารถกด Get Profile ได้เลย
    } catch (e) {
      log("LIFF ERROR: " + e.message);
    }
  }

  async function loginWithLine() {
    if (!ready) await initLiff();

    if (!liff.isLoggedIn()) {
      log("Redirect to LINE login…");
      liff.login();
      return;
    }
    log("Already logged in LINE ✅");
  }

  async function getProfileAndSave() {
    if (!ready) await initLiff();

    if (!liff.isLoggedIn()) {
      log("Not logged in LINE ❌ (กด Login ก่อน)");
      return;
    }

    try {
      const profile = await liff.getProfile();
      log("LINE Profile ✅", profile);

      const idToken = liff.getIDToken();
      log("ID Token exists?", { hasIdToken: !!idToken });

      if (!auth.currentUser) {
        log("Sign in Firebase anonymously…");
        await signInAnonymously(auth);
        log("Firebase login ✅");
      }

      log("Save to Firestore…");
      await setDoc(doc(db, "liff_test_users", profile.userId), {
        userId: profile.userId,
        displayName: profile.displayName || "",
        pictureUrl: profile.pictureUrl || "",
        currentUrl: location.href,
        updatedAt: serverTimestamp()
      }, { merge: true });

      log("✅ SAVE SUCCESS");
    } catch (e) {
      log("ERROR: " + e.message);
    }
  }

  async function logout() {
    if (!ready) await initLiff();
    if (liff.isLoggedIn()) {
      liff.logout();
      log("Logged out LINE ✅ (refresh หน้า)");
    } else {
      log("Already logged out");
    }
  }

  // ✅ ผูก event (ไม่มี null แล้ว)
  btnInit.onclick = initLiff;
  btnLogin.onclick = loginWithLine;
  btnProfile.onclick = getProfileAndSave;
  btnLogout.onclick = logout;

  // auto init
  initLiff();
});
