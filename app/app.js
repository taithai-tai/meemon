import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

const LIFF_ID = "2008685502-NdidvjVm";

function getEl(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element id="${id}" in HTML`);
  return el;
}

window.addEventListener("DOMContentLoaded", async () => {
  const logEl = getEl("log");
  const btnInit = getEl("btnInit");
  const btnLogin = getEl("btnLogin");
  const btnProfile = getEl("btnProfile");
  const btnLogout = getEl("btnLogout");

  const log = (msg, obj) => {
    const text = obj ? `${msg}\n${JSON.stringify(obj, null, 2)}` : msg;
    console.log(text);
    logEl.textContent += "\n\n" + text;
  };

  async function initLiff() {
    log("Init LIFF…");
    await liff.init({ liffId: LIFF_ID });
    log("LIFF Ready ✅");
    log("isLoggedIn:", liff.isLoggedIn());
    log("Current URL:", location.href);
  }

  async function loginLine() {
    if (!liff.isLoggedIn()) {
      log("Redirect to LINE login…");
      liff.login();
      return;
    }
    log("Already logged in LINE ✅");
  }

  async function getProfileAndSave() {
    if (!liff.isLoggedIn()) {
      log("Not logged in LINE ❌ (กด Login ก่อน)");
      return;
    }

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
  }

  async function logoutLine() {
    if (liff.isLoggedIn()) {
      liff.logout();
      log("Logged out LINE ✅ (refresh หน้า)");
    } else {
      log("Already logged out");
    }
  }

  // ผูกปุ่ม (ไม่มีทาง null แล้วเพราะเช็กไว้)
  btnInit.onclick = () => initLiff().catch(e => log("LIFF ERROR: " + e.message));
  btnLogin.onclick = () => loginLine().catch(e => log("LOGIN ERROR: " + e.message));
  btnProfile.onclick = () => getProfileAndSave().catch(e => log("PROFILE ERROR: " + e.message));
  btnLogout.onclick = () => logoutLine().catch(e => log("LOGOUT ERROR: " + e.message));

  // auto init
  initLiff().catch(e => log("LIFF ERROR: " + e.message));
});
