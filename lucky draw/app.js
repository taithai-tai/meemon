const $ = (id) => document.getElementById(id);

const identifierEl = $("identifier");
const drawBtn = $("drawBtn");
const msgEl = $("msg");
const envelopeEl = $("envelope");

const paperTitleEl = $("paperTitle");
const paperBodyEl = $("paperBody");
const paperFootEl = $("paperFoot");

const rightsUsedEl = $("rightsUsed");
const winsUsedEl = $("winsUsed");

// ====== ตั้งค่า (แก้ได้) ======
const TOTAL_RIGHTS = 2000;
const TOTAL_WINS = 100;

const BLESSINGS = [
  "โชคดีจะมาหาคุณในเวลาที่ใช่ ✨",
  "วันนี้พลังงานดีมาก ขอให้ทุกอย่างราบรื่น 🧿",
  "ขอให้เงินไหลมาเทมา งานราบรื่น ความรักสดใส 💫",
  "เรื่องดี ๆ กำลังจะเกิดขึ้นกับคุณเร็ว ๆ นี้ 🌙",
  "ดวงเปิด! ขอให้ก้าวต่อไปเป็นก้าวที่ปังที่สุด 🔮"
];

// ====== Storage Keys ======
const KEY_USER_DONE = "meemon_done_v1";          // ล็อก 1 ครั้งต่อเครื่อง
const KEY_USER_RESULT = "meemon_result_v1";      // เก็บผลเดิม
const KEY_SIM_USED = "meemon_sim_used_v1";       // นับสิทธิ (จำลองบนเครื่อง)
const KEY_SIM_WINS = "meemon_sim_wins_v1";       // นับผู้โชคดี (จำลองบนเครื่อง)

// โหลดตัวเลขจำลอง
function loadNum(key) {
  const n = Number(localStorage.getItem(key) || "0");
  return Number.isFinite(n) ? n : 0;
}
function saveNum(key, n) {
  localStorage.setItem(key, String(n));
}
function setMsg(text, type) {
  msgEl.className = "msg " + (type || "");
  msgEl.textContent = text || "";
}
function openAnim() {
  envelopeEl.classList.remove("open");
  setTimeout(() => envelopeEl.classList.add("open"), 180);
}

function renderCounters() {
  rightsUsedEl.textContent = loadNum(KEY_SIM_USED);
  winsUsedEl.textContent = loadNum(KEY_SIM_WINS);
}

function pickBlessing() {
  return BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
}

function makeRewardCode() {
  return "MEEMON-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

// “สุ่ม” แบบจำลอง: ให้โอกาสชนะตามสัดส่วนที่เหลือ (บนเครื่อง)
function localDraw() {
  let used = loadNum(KEY_SIM_USED);
  let wins = loadNum(KEY_SIM_WINS);

  if (used >= TOTAL_RIGHTS || wins >= TOTAL_WINS) {
    return { ended: true };
  }

  const rightsLeft = TOTAL_RIGHTS - used;
  const winsLeft = TOTAL_WINS - wins;

  // โอกาสชนะ = winsLeft / rightsLeft (ช่วยให้จบที่ 100/2000 บนเครื่อง)
  const win = Math.random() < (winsLeft / rightsLeft);

  used += 1;
  saveNum(KEY_SIM_USED, used);

  if (win) {
    wins += 1;
    saveNum(KEY_SIM_WINS, wins);
    return { result_type: "WIN", reward_code: makeRewardCode() };
  }
  return { result_type: "BLESSING", blessing_text: pickBlessing() };
}

function showResult(r, already=false) {
  openAnim();

  if (r.ended) {
    paperTitleEl.textContent = "ประกาศ";
    paperBodyEl.textContent = "กิจกรรมสิ้นสุดแล้ว 🧧✨";
    paperFootEl.textContent = "";
    setMsg("กิจกรรมสิ้นสุดแล้ว", "warn");
    drawBtn.disabled = true;
    return;
  }

  if (r.result_type === "WIN") {
    paperTitleEl.textContent = "คุณถูกรางวัล!";
    paperBodyEl.innerHTML = `คุณคือ 1 ใน 100 ผู้โชคดี 🎉<br><b>${r.reward_code}</b>`;
    paperFootEl.textContent = "โปรดเก็บรหัสนี้ไว้";
    setMsg(already ? "คุณใช้สิทธิไปแล้ว (แสดงผลเดิม)" : "สุ่มสำเร็จ! 🎉", "ok");
  } else {
    paperTitleEl.textContent = "คำอวยพร";
    paperBodyEl.textContent = r.blessing_text || "ขอให้โชคดี ✨";
    paperFootEl.textContent = "แล้วกลับมาใหม่ในกิจกรรมครั้งหน้า";
    setMsg(already ? "คุณใช้สิทธิไปแล้ว (แสดงผลเดิม)" : "สุ่มสำเร็จ! ✨", "ok");
  }
}

function onDraw() {
  const id = identifierEl.value.trim();
  if (!id) {
    setMsg("กรุณากรอก ID / Email / เบอร์ ก่อนเปิดซอง", "err");
    return;
  }

  // ล็อก 1 ครั้งต่อเครื่อง/เบราว์เซอร์
  const done = localStorage.getItem(KEY_USER_DONE) === "1";
  if (done) {
    const saved = localStorage.getItem(KEY_USER_RESULT);
    if (saved) showResult(JSON.parse(saved), true);
    else setMsg("คุณใช้สิทธิไปแล้ว", "warn");
    return;
  }

  const r = localDraw();
  localStorage.setItem(KEY_USER_DONE, "1");
  localStorage.setItem(KEY_USER_RESULT, JSON.stringify(r));

  renderCounters();
  showResult(r, false);
}

drawBtn.addEventListener("click", onDraw);
identifierEl.addEventListener("keydown", (e) => e.key === "Enter" && onDraw());

renderCounters();
