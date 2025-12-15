import express from "express";
import crypto from "crypto";

const app = express();

const CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// หน้าเว็บของคุณบน GitHub Pages (ไม่เอาท้าย / ก็ได้ แต่แนะนำให้ “คงที่”)
const FRONTEND_BASE = process.env.FRONTEND_BASE; 
// callback นี้ต้อง “ตรงเป๊ะ” กับที่ไปใส่ใน LINE Developers
const CALLBACK_URL = process.env.CALLBACK_URL;

if (!CHANNEL_ID || !CHANNEL_SECRET || !FRONTEND_BASE || !CALLBACK_URL) {
  console.error("Missing env: LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, FRONTEND_BASE, CALLBACK_URL");
}

const stateStore = new Set();

app.get("/", (req, res) => res.send("OK"));

// กดปุ่มจากหน้าเว็บ → มา route นี้
app.get("/auth/line", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  stateStore.add(state);

  const authUrl =
    "https://access.line.me/oauth2/v2.1/authorize" +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(CHANNEL_ID)}` +
    `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}` +
    `&state=${encodeURIComponent(state)}` +
    `&scope=${encodeURIComponent("profile openid")}`;

  res.redirect(authUrl);
});

// LINE จะเด้งกลับมาที่นี่
app.get("/auth/line/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) return res.status(400).send(`${error}: ${error_description || ""}`);
  if (!code || !state || !stateStore.has(state)) return res.status(400).send("Invalid state/code");
  stateStore.delete(state);

  // แลก code -> token
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: String(code),
      redirect_uri: CALLBACK_URL,
      client_id: CHANNEL_ID,
      client_secret: CHANNEL_SECRET
    })
  });

  const token = await tokenRes.json();
  if (!tokenRes.ok) return res.status(400).json(token);

  // ดึงโปรไฟล์
  const profRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const profile = await profRes.json();
  if (!profRes.ok) return res.status(400).json(profile);

  // ส่งกลับหน้าเว็บ (ใส่ข้อมูลผ่าน URL hash เพื่อไม่ให้ server log query)
  const payload = encodeURIComponent(
    Buffer.from(JSON.stringify({
      userId: profile.userId,
      name: profile.displayName,
      picture: profile.pictureUrl
    })).toString("base64")
  );

  res.redirect(`${FRONTEND_BASE}/draw.html#line=${payload}`);
});

app.listen(process.env.PORT || 3000, () => console.log("Server started"));
