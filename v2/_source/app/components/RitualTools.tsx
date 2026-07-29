"use client";

import { useMemo, useState } from "react";
import { content } from "@/lib/data";

function moonAge(date: Date) {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const cycle = 29.53058867;
  return (((date.getTime() - knownNewMoon) / 86400000) % cycle + cycle) % cycle;
}

export function IncenseTool() {
  const [lit, setLit] = useState(false);
  const [number, setNumber] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  function light() {
    setLit(true); setWaiting(true); setNumber(null);
    window.setTimeout(() => {
      setNumber(String(Math.floor(Math.random() * 1000)).padStart(3, "0"));
      setWaiting(false);
    }, 1200);
  }
  return (
    <div className="tool-stage">
      <div className={`incense-ritual ${lit ? "lit" : ""}`}>
        <div className="smoke smoke-one" /><div className="smoke smoke-two" /><div className="smoke smoke-three" />
        <div className="incense-sticks"><i/><i/><i/></div>
        <div className="incense-bowl">MEEMON</div>
      </div>
      {number ? <div className="incense-number"><small>เลขจากควันธูป</small><strong>{number}</strong><p>รับไว้เป็นสัญลักษณ์และแรงบันดาลใจตามความเชื่อส่วนบุคคล</p></div> : <p className="tool-prompt">{waiting ? "มองควันที่ลอยขึ้นอย่างสงบ…" : "ตั้งจิตถึงสิ่งที่ปรารถนา จากนั้นจุดธูป — ใช้ฟรี ไม่ใช้แต้ม และไม่ต้องสมัครสมาชิก"}</p>}
      <button className="button button-gold" onClick={light} disabled={waiting}>{waiting ? "กำลังรอควันธูป…" : number ? "จุดธูปอีกครั้ง" : "จุดธูป"}</button>
    </div>
  );
}

export function WalletOpeningTool() {
  const [value, setValue] = useState(() => new Date().toISOString().slice(0, 10));
  const result = useMemo(() => {
    const date = new Date(`${value}T12:00:00`);
    const age = moonAge(date);
    const waxing = age >= 1 && age <= 15;
    const phase = age < 1 || age >= 29 ? "🌑 เดือนดับ" : age < 15 ? `🌒 ข้างขึ้น ${Math.round(age)} ค่ำ` : Math.round(age) === 15 ? "🌕 จันทร์เพ็ญ" : `🌘 ข้างแรม ${Math.round(age) - 15} ค่ำ`;
    return { age, waxing, phase, date };
  }, [value]);
  return (
    <div className="tool-stage">
      <div className="field compact-field"><label>วันที่ต้องการเริ่มใช้กระเป๋า</label><input type="date" value={value} onChange={(event) => setValue(event.target.value)} /></div>
      <div className="moon-display"><span>{result.waxing ? "☽" : "☾"}</span><div><small>{result.date.toLocaleDateString("th-TH", { dateStyle: "full" })}</small><h2>{result.phase}</h2><p>อายุจันทร์ประมาณ {Math.round(result.age)} วัน</p></div></div>
      <article className={`auspicious-card ${result.waxing ? "good" : "rest"}`}>
        <span>{result.waxing ? "✦" : "◐"}</span>
        <div><small>ผลตามหลักในคู่มือ Meemon</small><h2>{result.waxing ? "ฤกษ์มงคล (เปิดรับทรัพย์)" : "ควรงดเว้น (เก็บทรัพย์)"}</h2><p>{result.waxing ? "ข้างขึ้น/จันทร์เพ็ญ: แสงสว่างนำทางความสำเร็จ เหมาะแก่การเปิดเผยและเริ่มต้น" : "ข้างแรม/เดือนดับ: พลังจันทราอับแสง ไม่เหมาะแก่การเริ่มงานมงคลทั่วไป"}</p></div>
      </article>
    </div>
  );
}

export function HorseChantTool() {
  const [selected, setSelected] = useState(content.chants[0]);
  const [round, setRound] = useState(0);
  return (
    <div className="horse-layout">
      <div className="horse-picker">
        {content.chants.map((chant) => <button key={chant.id} onClick={() => { setSelected(chant); setRound(0); }} className={selected.id === chant.id ? "active" : ""}><img src={chant.image} alt="" /><div><strong>{chant.title}</strong><small>{chant.element}</small></div></button>)}
      </div>
      <article className="chant-card" style={{ "--chant-color": selected.themeColor } as React.CSSProperties}>
        <div className="chant-heading"><img src={selected.image} alt={selected.title}/><div><small>{selected.element}</small><h2>{selected.title}</h2><p>{selected.subtitle}</p></div></div>
        <div className="chant-columns"><div><h3>เหมาะสำหรับ</h3><ul>{selected.suitableFor.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>เตรียมตัว</h3><ol>{selected.preparation.map((item) => <li key={item}>{item}</li>)}</ol></div></div>
        <div className="chant-text">{selected.chantText.map((line) => <p key={line}>{line}</p>)}</div>
        <div className="chant-counter"><div><small>จำนวนรอบ</small><strong>{round} / {selected.rounds}</strong></div><button className="button button-gold" onClick={() => setRound((current) => current >= selected.rounds ? 0 : current + 1)}>{round >= selected.rounds ? "เริ่มนับใหม่" : "นับรอบสวด"}</button></div>
        <p className="chant-instruction">{selected.audioInstruction}</p>
      </article>
    </div>
  );
}

export function MoneyChantTool() {
  return (
    <div className="tool-stage">
      <div className="money-symbol">✦</div>
      <article className="money-chant">
        <small>คาถาเรียกเงินฉบับ Meemon</small>
        <h2>“พุทธังนำมาเงิน<br/>ธัมมังนำมาทอง<br/>สังฆังนำมาของ<br/>เอหิมะมะ”</h2>
        <p>ทวนคาถาเพื่อเชื่อมพลังงาน ยิ่งท่องบ่อย ยิ่งดี</p>
        <audio controls preload="metadata" src="/v2/assets/rituals/money-chant.mp3">เบราว์เซอร์ไม่รองรับไฟล์เสียง</audio>
      </article>
      <p className="tool-prompt">ท่องได้บ่อยตามต้องการ เพื่อดึงดูดทรัพย์เข้ากระเป๋า</p>
    </div>
  );
}

export function WalletGuide() {
  const steps = [
    { icon: "▣", title: "เริ่มต้นด้วยพลัง", body: <>เมื่อได้รับกระเป๋าแล้ว ให้ใส่ <strong>ธนบัตรที่มีมูลค่าสูงที่สุดเท่าที่คุณมี</strong> (ไม่จำกัดสกุลเงิน) ลงไปในกระเป๋า เพื่อเป็นการวางรากฐานความมั่งคั่ง และสร้างแรงดึงดูดเงินก้อนใหญ่หรือทรัพย์สินที่มีมูลค่าสูงเข้ามาหาคุณ</>, note: <>อย่าลืมใส่ <strong>“ซองแดง”</strong> ที่ติดมากับกระเป๋าลงไปด้วย เพื่อความเป็นสิริมงคลสูงสุด</> },
    { icon: "☾", title: "เชื่อมต่อจิตวิญญาณ", body: <>นำกระเป๋าไปไว้ <strong>ใต้หมอน</strong> เพื่อให้กระเป๋าจดจำเจ้าของ และจดจำกลิ่นอายของเงิน</>, note: <>วางไว้กี่คืนก็ได้ตามความสบายใจ · วันแรกที่เริ่มใช้ควรเป็นวันที่อารมณ์ดี · ฤกษ์ดีคือวันข้างขึ้น 1–15 ค่ำ</> },
    { icon: "✦", title: "ปลุกเสกด้วยตนเอง", body: <>ท่องคาถาเรียกเงินเพื่อให้พลังงานไหลเวียนและเปิดทางให้โชคลาภ</>, note: <>เปิดหน้าคาถาเรียกเงินเพื่อฟังเสียงและทบทวนบทเต็มได้ทุกเมื่อ</> },
  ];
  return <div className="guide-grid">{steps.map((step, index) => <article key={step.title}><span>{step.icon}</span><small>STEP {index + 1}</small><h2>{step.title}</h2><p>{step.body}</p><div>{step.note}</div></article>)}</div>;
}
