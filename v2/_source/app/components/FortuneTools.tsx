"use client";

import { useMemo, useState } from "react";
import { content } from "@/lib/data";
import type { TarotCard } from "@/lib/types";
import { Icon, type IconName } from "./Icons";

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

const oracleIcons: Record<string, IconName> = {
  "The Sun": "sun",
  "The Moon": "moon",
  "The Star": "sparkle",
  "The World": "oracle",
  "The Wheel": "daily",
  Strength: "shield",
  "The Lovers": "heart",
  "The Tower": "bolt",
  "High Priest": "book",
};

export function OracleTool() {
  const [card, setCard] = useState<(typeof content.oracleCards)[number] | null>(null);
  return (
    <div className="tool-stage">
      <div className={`oracle-card ${card ? "revealed" : ""}`}>
        <span className="oracle-symbol">
          <Icon name={card ? oracleIcons[card.name] ?? "oracle" : "oracle"} />
        </span>
        <small>{card ? "YOUR ORACLE" : "MEEMON ORACLE"}</small>
        <h2>{card?.name ?? "ตั้งใจถึงคำถามหนึ่งเรื่อง"}</h2>
        <p>{card?.meaning ?? "หลับตา หายใจลึก แล้วเปิดรับข้อความที่เหมาะกับวันนี้"}</p>
        {card ? <b>เลขมงคล · {card.lucky}</b> : null}
      </div>
      <button className="button button-gold" onClick={() => setCard(pick(content.oracleCards))}>
        <Icon name={card ? "sparkle" : "oracle"} />
        {card ? "เปิดไพ่อีกครั้ง" : "เปิดไพ่หนึ่งใบ"}
      </button>
    </div>
  );
}

export function TarotTool() {
  const [count, setCount] = useState(1);
  const [cards, setCards] = useState<TarotCard[]>([]);
  function draw() {
    setCards([...content.tarotCards].sort(() => Math.random() - 0.5).slice(0, count));
  }
  return (
    <div className="tool-stage tarot-stage">
      <div className="segmented-control">
        {[1, 3, 10].map((value) => (
          <button key={value} className={count === value ? "active" : ""} onClick={() => { setCount(value); setCards([]); }}>
            {value} ใบ
          </button>
        ))}
      </div>
      <p className="tool-prompt">
        {count === 1 ? "คำตอบที่ชัดเจนสำหรับหนึ่งคำถาม" : count === 3 ? "อดีต · ปัจจุบัน · อนาคต" : "ภาพรวมเส้นทางและพลังรอบตัว"}
      </p>
      {cards.length ? (
        <div className={`tarot-grid count-${count}`}>
          {cards.map((card, index) => (
            <article className="tarot-result" key={`${card.name}-${index}`}>
              <img src={card.image} alt={card.name} />
              <div><small>ไพ่ใบที่ {index + 1}</small><h3>{card.name}</h3><p>{card.meaning}</p></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="tarot-deck"><img src="/v2/assets/tarot/back.webp" alt="" /><span>78 CARDS</span></div>
      )}
      <button className="button button-gold" onClick={draw}><Icon name="tarot" />{cards.length ? "สับแล้วเปิดใหม่" : `เปิดไพ่ ${count} ใบ`}</button>
    </div>
  );
}

export function SeimseeTool() {
  const [fortune, setFortune] = useState<(typeof content.fortunes)[number] | null>(null);
  const [shaking, setShaking] = useState(false);
  function shake() {
    setShaking(true); setFortune(null);
    window.setTimeout(() => { setFortune(pick(content.fortunes)); setShaking(false); }, 650);
  }
  return (
    <div className="tool-stage">
      <div className={`seimsee-cup ${shaking ? "shaking" : ""}`}><span>籤</span><i>•••••••</i></div>
      {fortune ? (
        <article className="fortune-paper">
          <small>ใบที่ {fortune.number} · {fortune.level}</small>
          <h2>{fortune.title}</h2><p>{fortune.main}</p><div>{fortune.advice}</div>
        </article>
      ) : <p className="tool-prompt">ตั้งจิตอธิษฐานถึงเรื่องที่อยากรู้ แล้วเขย่ากระบอกเซียมซี</p>}
      <button className="button button-gold" onClick={shake} disabled={shaking}><Icon name="seimsee" />{shaking ? "กำลังเขย่า…" : "เขย่าเซียมซี"}</button>
    </div>
  );
}

const jiaobeiOutcomes = [
  { sides: ["down", "up"], title: "เซิ่งปวย — คำตอบรับ", text: "หนึ่งคว่ำหนึ่งหงาย หมายถึงสิ่งศักดิ์สิทธิ์อนุญาตหรือเห็นชอบ" },
  { sides: ["down", "down"], title: "อิมปวย — ยังไม่ใช่เวลา", text: "คว่ำทั้งคู่ แนะนำให้ทบทวนคำถามหรือรอจังหวะที่เหมาะสมกว่า" },
  { sides: ["up", "up"], title: "เฉียวปวย — คำถามยังไม่ชัด", text: "หงายทั้งคู่ เปรียบเหมือนรอยยิ้ม ควรถามใหม่ให้กระชับและจริงใจ" },
];

export function JiaobeiTool() {
  const [result, setResult] = useState<(typeof jiaobeiOutcomes)[number] | null>(null);
  const [turn, setTurn] = useState(false);
  function throwBlocks() {
    setTurn(true); setResult(null);
    window.setTimeout(() => { setResult(pick(jiaobeiOutcomes)); setTurn(false); }, 700);
  }
  return (
    <div className="tool-stage">
      <div className={`jiaobei-blocks ${turn ? "throwing" : ""}`} aria-label="ไม้เสี่ยงทายเซ้งปวย"><span /><span /></div>
      {result ? <article className="result-card"><div className="jiaobei-result-visual">{result.sides.map((side, index) => <span className={side} key={`${side}-${index}`} />)}</div><h2>{result.title}</h2><p>{result.text}</p></article> : <p className="tool-prompt">ถามคำถามที่ตอบได้ว่า “ใช่” หรือ “ไม่ใช่” เพียงหนึ่งเรื่อง</p>}
      <button className="button button-gold" onClick={throwBlocks} disabled={turn}><Icon name="jiaobei" />{turn ? "กำลังเสี่ยงทาย…" : "โยนเซ้งปวย"}</button>
    </div>
  );
}

export function LuckyNumberTool() {
  const [digits, setDigits] = useState<string[]>(["·", "·", "·", "·"]);
  const [running, setRunning] = useState(false);
  function generate() {
    setRunning(true); setDigits(["·", "·", "·", "·"]);
    const next = Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 10)));
    next.forEach((digit, index) => window.setTimeout(() => {
      setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
      if (index === 3) setRunning(false);
    }, 350 * (index + 1)));
  }
  return (
    <div className="tool-stage">
      <div className="lucky-digits">{digits.map((digit, index) => <span key={index}>{digit}</span>)}</div>
      <p className="tool-prompt">เลขที่ปรากฏเป็นสัญลักษณ์แห่งจังหวะและแรงบันดาลใจ ไม่ใช่การรับประกันผลลัพธ์</p>
      <button className="button button-gold" onClick={generate} disabled={running}><Icon name="lucky-number" />{running ? "กำลังเปิดตัวเลข…" : "รับเลขมงคล 4 หลัก"}</button>
    </div>
  );
}

const dayKeys = ["sunday", "monday", "tuesday", "wednesdayDay", "thursday", "friday", "saturday"];

export function DailyTool() {
  const [birthday, setBirthday] = useState(new Date().getDay());
  const today = new Date();
  const lunar = useMemo(() => {
    const base = new Date(2000, 0, 6).getTime();
    const age = ((today.getTime() - base) / 86400000) % 29.53059;
    return age < 14.77 ? `ข้างขึ้น ${Math.max(1, Math.round(age))} ค่ำ` : `ข้างแรม ${Math.max(1, Math.round(age - 14.77))} ค่ำ`;
  }, []);
  const keys = Object.keys(content.thaksa);
  const lead = content.thaksa[keys[(today.getDay() + birthday) % keys.length]];
  const watch = content.thaksa.kalakini;
  return (
    <div className="tool-stage">
      <div className="field compact-field"><label>คุณเกิดวันอะไร</label><select value={birthday} onChange={(event) => setBirthday(Number(event.target.value))}>{content.luckyDays.slice(0, 7).map((day, index) => <option key={day.name} value={index}>{day.name}</option>)}</select></div>
      <div className="moon-display"><span><Icon name="moon" /></span><div><small>พลังจันทราวันนี้</small><h2>{lunar}</h2><p>{today.toLocaleDateString("th-TH", { dateStyle: "full" })}</p></div></div>
      <div className="daily-grid">
        <article><small>พลังที่ส่งเสริม</small><h3>{lead.label}</h3><p>{lead.meaning}</p></article>
        <article><small>สิ่งที่ควรระวัง</small><h3>{watch.label}</h3><p>{watch.meaning}</p></article>
      </div>
    </div>
  );
}

export function ColorsTool() {
  const [day, setDay] = useState(dayKeys[new Date().getDay()]);
  const info = content.colors[day] ?? content.colors.sunday;
  return (
    <div className="tool-stage">
      <div className="day-picker">
        {Object.entries(content.colors).map(([key, value]) => (
          <button key={key} onClick={() => setDay(key)} className={day === key ? "active" : ""}>{value.name.replace("วัน", "")}</button>
        ))}
      </div>
      <article className="color-intro"><span><Icon name={day === "sunday" ? "sun" : day === "monday" ? "moon" : "colors"} /></span><div><small>{info.enName}</small><h2>{info.name}</h2><p>{info.deityName} · {info.worship}</p></div></article>
      <div className="color-grid">
        {info.luckyColors.map((color) => (
          <article key={`${color.label}-${color.color}`}>
            <i style={{ background: color.color }} /><div><small>{color.label}</small><h3>{color.desc}</h3><code>{color.color}</code></div>
          </article>
        ))}
      </div>
    </div>
  );
}
