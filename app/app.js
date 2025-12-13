// =====================
// LOG helper
// =====================
const logEl = document.getElementById("log");
function log(msg) {
  console.log(msg);
  logEl.textContent += "\n" + msg;
}

// =====================
// Firebase (Module CDN)
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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

// =====================
// Init Firebase
// =====================
log("Init Firebase…");
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);

// =====================
// LIFF
// =====================
const LIFF_ID = "2008685502-NdidvjVm";

async function init() {
  try {
    log("Init LIFF…");
    await liff.init({ liffId: LIFF_ID });
    log("LIFF Ready");

    document.getElementById("loginBtn").onclick = login;

    if (liff.isLoggedIn()) {
      log("Already logged in LINE");
    } else {
      log("Not logged in LINE");
    }

  } catch (e) {
    log("LIFF ERROR: " + e.message);
  }
}

async function login() {
  try {
    if (!liff.isLoggedIn()) {
      log("Redirect to LINE login…");
      liff.login();
      return;
    }

    log("Sign in Firebase anonymously…");
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      log("Firebase login OK");
    } else {
      log("Firebase already logged in");
    }

    log("✅ TEST SUCCESS");

  } catch (e) {
    log("LOGIN ERROR: " + e.message);
  }
}

init();
