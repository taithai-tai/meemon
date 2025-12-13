const app = {};

// 🔥 Firebase config (ใส่ของคุณเอง)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔑 LIFF INIT
liff.init({
  liffId: "2008685502-NdidvjVm" // ← ของคุณ
})
.then(() => {
  document.getElementById("status").innerText = "LIFF Ready";
})
.catch(err => {
  document.getElementById("status").innerText = err.message;
  console.error(err);
});

// 🔐 Login function
app.login = async function () {
  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  try {
    // LINE profile
    const profile = await liff.getProfile();
    const userId = profile.userId;

    // Firebase anonymous login
    await auth.signInAnonymously();

    // Save user
    await db.collection("users").doc(userId).set({
      userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    document.getElementById("status").innerText = "Login สำเร็จ 🎉";
    console.log("User:", profile);

  } catch (e) {
    document.getElementById("status").innerText = "เกิดข้อผิดพลาด";
    console.error(e);
  }
};
