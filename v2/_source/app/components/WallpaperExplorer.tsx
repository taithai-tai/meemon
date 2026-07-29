"use client";
import { useState } from "react";
import { content } from "@/lib/data";

export function WallpaperExplorer() {
  const [day, setDay] = useState(content.wallpapers.days[0].id);
  const selected = content.wallpapers.days.find((item) => item.id === day) ?? content.wallpapers.days[0];
  return (
    <div>
      <div className="day-picker wallpaper-days">{content.wallpapers.days.map((item) => <button className={day === item.id ? "active" : ""} key={item.id} onClick={() => setDay(item.id)}><span>{item.emoji}</span>{item.thai}</button>)}</div>
      <div className="wallpaper-heading"><div><small>เกิดวัน{selected.thai}</small><h2>เลือกพลังที่อยากเสริม</h2></div><span>{selected.emoji}</span></div>
      <div className="wallpaper-grid">
        {Object.entries(selected.files).map(([name, url]) => <article key={name}><div className="wallpaper-preview"><img src={url} alt={`วอลเปเปอร์${name} วัน${selected.thai}`} loading="lazy"/></div><div><h3>{name}</h3><a className="button button-ghost" href={url} download>ดาวน์โหลด</a></div></article>)}
      </div>
      <div className="wallpaper-heading any-day-heading"><div><small>ใช้ได้ทุกวันเกิด</small><h2>เลือกตามความปรารถนา</h2></div></div>
      <div className="wallpaper-grid any-day-grid">
        {content.wallpapers.anyDay.map((item) => <article key={item.name}><div className="wallpaper-preview"><img src={item.url} alt={item.name} loading="lazy"/></div><div><span className="wallpaper-icon">{item.icon}</span><h3>{item.name}</h3><p>{item.sub}</p><a className="button button-ghost" href={item.url} download>ดาวน์โหลด</a></div></article>)}
      </div>
    </div>
  );
}
