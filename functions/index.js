const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.authLine = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
      const { idToken } = req.body || {};
      if (!idToken) return res.status(400).json({ error: "missing_idToken" });

      const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_token: idToken }).toString(),
      });

      if (!verifyRes.ok) {
        const t = await verifyRes.text();
        return res.status(401).json({ error: "line_verify_failed", detail: t });
      }

      const v = await verifyRes.json();
      const lineUserId = v.sub;
      const displayName = v.name || "User";
      const pictureUrl = v.picture || "";

      const db = admin.firestore();
      const userRef = db.collection("users").doc(lineUserId);
      const walletRef = db.collection("wallets").doc(lineUserId);

      await db.runTransaction(async (tx) => {
        const uSnap = await tx.get(userRef);
        if (!uSnap.exists) {
          tx.set(userRef, {
            line_user_id: lineUserId,
            display_name: displayName,
            picture_url: pictureUrl,
            role: "user",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            last_login_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(userRef, {
            display_name: displayName,
            picture_url: pictureUrl,
            last_login_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        const wSnap = await tx.get(walletRef);
        if (!wSnap.exists) {
          tx.set(walletRef, {
            balance_points: 0,
            inventory: 0,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(walletRef, { updated_at: admin.firestore.FieldValue.serverTimestamp() });
        }
      });

      const customToken = await admin.auth().createCustomToken(lineUserId, {
        line_user_id: lineUserId,
        role: "user",
      });

      return res.json({ customToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server_error" });
    }
  });
});
