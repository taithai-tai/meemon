import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Eye, Smartphone, ChevronRight, ArrowLeft, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';

// --- Constants ---
const LOGO_URL = "https://raw.githubusercontent.com/taithai-tai/meemon/refs/heads/main/Picture/logo.png";
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  flip: 'https://cdn.pixabay.com/audio/2022/03/10/audio_71e4fc8a6e.mp3',
  magic: 'https://cdn.pixabay.com/audio/2024/12/20/audio_d3efed8c6c.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

const FORTUNE_CARDS = [
  { name: "The Sun", icon: "☀️", meaning: "แสงสว่างแห่งปัญญาจักส่องทาง ความสำเร็จอันรุ่งโรจน์รออยู่เบื้องหน้า อุปสรรคจักมลายสิ้น", lucky: "1, 9" },
  { name: "The Lovers", icon: "❤️‍🔥", meaning: "ทางแยกแห่งโชคชะตา หัวใจจักนำทางเจ้า จงเลือกด้วยความรักมิใช่ความกลัว", lucky: "2, 6" },
  { name: "Wheel of Fortune", icon: "☸️", meaning: "กงล้อแห่งกรรมกำลังหมุน สิ่งใดที่ทำไว้จักย้อนคืน โอกาสใหม่จักปรากฏดั่งปาฏิหาริย์", lucky: "10" },
  { name: "The Magician", icon: "🔮", meaning: "อำนาจอยู่ในมือเจ้า ธาตุทั้งสี่จักเกื้อหนุน จงลงมือทำสิ่งที่คิดฝันให้เป็นจริง", lucky: "1, 5" },
  { name: "The Star", icon: "✨", meaning: "ความหวังดั่งดาราบนฟากฟ้า การเยียวยาจิตวิญญาณ ความสงบสุขจักบังเกิด", lucky: "17" },
  { name: "The Empress", icon: "👑", meaning: "ความอุดมสมบูรณ์พูนสุข เสน่ห์อันเหลือล้น ลาภยศสรรเสริญจักหลั่งไหลเข้ามา", lucky: "3" },
  { name: "Ace of Pentacles", icon: "💎", meaning: "ประตูขุมทรัพย์เปิดออก ลาภลอยหรือโอกาสทองทางการเงินจักเข้ามา จงไขว่คว้าไว้", lucky: "8" },
  { name: "The Moon", icon: "🌙", meaning: "ความลึกลับซ่อนเร้น จงเชื่อในสัญชาตญาณ ระวังภาพลวงตา แต่ความจริงจักเปิดเผยในไม่ช้า", lucky: "18" },
  { name: "Death", icon: "💀", meaning: "จุดจบคือการเริ่มต้นใหม่ การเปลี่ยนแปลงครั้งใหญ่จักนำพาชีวิตไปสู่หนทางที่ดีกว่าเดิม", lucky: "13" }
];

const ASPECT_OPTIONS = {
  wealth: { id: 'wealth', label: 'มหาเศรษฐี', icon: '💰', sub: 'Wealth', colorClass: 'border-[#ffd700]', bgPattern: 'radial-gradient(circle at 50% 30%, #15803d 0%, #14532d 60%, #022c22 100%)' },
  love: { id: 'love', label: 'เสน่หา', icon: '💘', sub: 'Love', colorClass: 'border-[#f472b6]', bgPattern: 'radial-gradient(circle at 50% 30%, #db2777 0%, #9d174d 60%, #500724 100%)' },
  work: { id: 'work', label: 'การงาน', icon: '💼', sub: 'Work', colorClass: 'border-[#60a5fa]', bgPattern: 'radial-gradient(circle at 50% 30%, #2563eb 0%, #1e40af 60%, #172554 100%)' },
  health: { id: 'health', label: 'อายุวัฒนะ', icon: '🌿', sub: 'Health', colorClass: 'border-[#34d399]', bgPattern: 'radial-gradient(circle at 50% 30%, #10b981 0%, #047857 60%, #064e3b 100%)' },
  power: { id: 'power', label: 'อำนาจ', icon: '🦁', sub: 'Power', colorClass: 'border-[#fb923c]', bgPattern: 'radial-gradient(circle at 50% 30%, #ea580c 0%, #c2410c 60%, #7c2d12 100%)' },
  trade: { id: 'trade', label: 'ค้าขาย', icon: '⚖️', sub: 'Trade', colorClass: 'border-[#fb923c]', bgPattern: 'radial-gradient(circle at 50% 30%, #ea580c 0%, #c2410c 60%, #7c2d12 100%)' },
  education: { id: 'education', label: 'การเรียน', icon: '🎓', sub: 'Education', colorClass: 'border-[#818cf8]', bgPattern: 'radial-gradient(circle at 50% 30%, #4f46e5 0%, #4338ca 60%, #312e81 100%)' },
  mercy: { id: 'mercy', label: 'เมตตา', icon: '🤲', sub: 'Mercy', colorClass: 'border-[#e2e8f0]', bgPattern: 'radial-gradient(circle at 50% 30%, #94a3b8 0%, #64748b 60%, #475569 100%)' },
  luck: { id: 'luck', label: 'โชคลาภ', icon: '🍀', sub: 'Luck', colorClass: 'border-[#facc15]', bgPattern: 'radial-gradient(circle at 50% 30%, #ca8a04 0%, #a16207 60%, #713f12 100%)' },
  success: { id: 'success', label: 'ความสำเร็จ', icon: '🏆', sub: 'Success', colorClass: 'border-[#a855f7]', bgPattern: 'radial-gradient(circle at 50% 30%, #581c87 0%, #3b0764 60%, #1e1b4b 100%)', isNew: true },
  protection: { id: 'protection', label: 'แคล้วคลาด', icon: '🛡️', sub: 'Protection', colorClass: 'border-[#94a3b8]', bgPattern: 'radial-gradient(circle at 50% 30%, #475569 0%, #334155 60%, #0f172a 100%)', isNew: true },
  prestige: { id: 'prestige', label: 'บารมี', icon: '🎖️', sub: 'Prestige', colorClass: 'border-[#b91c1c]', bgPattern: 'radial-gradient(circle at 50% 30%, #991b1b 0%, #7f1d1d 60%, #450a0a 100%)', isNew: true },
  harmony: { id: 'harmony', label: 'ร่มเย็น', icon: '🕊️', sub: 'Harmony', colorClass: 'border-[#22c55e]', bgPattern: 'radial-gradient(circle at 50% 30%, #15803d 0%, #166534 60%, #064e3b 100%)', isNew: true },
  beginnings: { id: 'beginnings', label: 'เริ่มต้นใหม่', icon: '🌱', sub: 'Beginnings', colorClass: 'border-[#84cc16]', bgPattern: 'radial-gradient(circle at 50% 30%, #65a30d 0%, #4d7c0f 60%, #365314 100%)', isNew: true }
};

const WALLPAPER_DB = {
    sunday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908233_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908234_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908235_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B2%E0%B8%97%E0%B8%B4%E0%B8%95%E0%B8%A2%E0%B9%8C/S__2908236_0.jpg?raw=true"
    },
    monday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908191_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908192_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908193_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%88%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C/S__2908194_0.jpg?raw=true"
    },
    tuesday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908197_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908198_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908199_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%B2%E0%B8%A3/S__2908200_0.jpg?raw=true"
    },
    wednesday_day: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908204_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908203_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908205_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908206_0.jpg?raw=true"
    },
    wednesday_night: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%84%E0%B8%B7%E0%B8%99/S__2908209_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908210_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908211_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%B8%B8%E0%B8%97%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A7%E0%B8%A7%E0%B8%B1%E0%B8%99/S__2908212_0.jpg?raw=true"
    },
    thursday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908215_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908216_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908217_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%9E%E0%A4%A4%E0%B8%AB%E0%B8%B1%E0%B8%AA%E0%B8%9A%E0%B8%94%E0%B8%B5/S__2908218_0.jpg?raw=true"
    },
    friday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908221_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908222_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908223_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B8%A8%E0%B8%B8%E0%B8%81%E0%B8%A3%E0%B9%8C/S__2908224_0.jpg?raw=true"
    },
    saturday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908227_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908228_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908229_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%80%E0%B8%AA%E0%B8%B2%E0%B8%A3%E0%B9%8C/S__2908230_0.jpg?raw=true"
    },
    anyday: {
        wealth: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908240_0.jpg?raw=true",
        work: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908241_0.jpg?raw=true",
        love: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908242_0.jpg?raw=true",
        health: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908243_0.jpg?raw=true",
        power: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908244_0.jpg?raw=true",
        trade: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908245_0.jpg?raw=true",
        education: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908246_0.jpg?raw=true",
        mercy: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908248.jpg?raw=true",
        luck: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__2908251.jpg?raw=true",
        success: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785987.jpg?raw=true",
        protection: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785988.jpg?raw=true",
        prestige: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785989.jpg?raw=true",
        harmony: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785990.jpg?raw=true",
        beginnings: "https://github.com/taithai-tai/meemon/blob/main/card/Picture/%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%97%E0%B8%B8%E0%B8%81%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%B4%E0%B8%94/S__15785992.jpg?raw=true"
    }
};

const DAY_BUTTONS = [
  { key: 'sunday', label: 'อาทิตย์', icon: '☀️', styleClass: 'bg-gradient-to-br from-red-800/40 to-red-950/60 text-red-300 border-red-500/30' },
  { key: 'monday', label: 'จันทร์', icon: '🌕', styleClass: 'bg-gradient-to-br from-yellow-700/40 to-yellow-950/60 text-yellow-300 border-yellow-500/30' },
  { key: 'tuesday', label: 'อังคาร', icon: '🌸', styleClass: 'bg-gradient-to-br from-pink-800/40 to-pink-950/60 text-pink-300 border-pink-500/30' },
  { key: 'wednesday_day', label: 'พุธกลางวัน', icon: '🌳', styleClass: 'bg-gradient-to-br from-emerald-800/40 to-emerald-950/60 text-emerald-300 border-emerald-500/30' },
  { key: 'wednesday_night', label: 'พุธกลางคืน', icon: '🌑', styleClass: 'bg-gradient-to-br from-slate-700/40 to-slate-900/60 text-slate-300 border-slate-500/30' },
  { key: 'thursday', label: 'พฤหัสบดี', icon: '🧘', styleClass: 'bg-gradient-to-br from-orange-800/40 to-orange-950/60 text-orange-300 border-orange-500/30' },
  { key: 'friday', label: 'ศุกร์', icon: '💎', styleClass: 'bg-gradient-to-br from-blue-800/40 to-blue-950/60 text-blue-300 border-blue-500/30' },
  { key: 'saturday', label: 'เสาร์', icon: '🔥', styleClass: 'bg-gradient-to-br from-purple-800/40 to-purple-950/60 text-purple-300 border-purple-500/30' },
  { key: 'anyday', label: 'ใช้ได้ทุกวัน', icon: '✨', styleClass: 'bg-white/5 text-white border-white/20 col-span-2 justify-center', isNew: true },
];

// --- Star Background Component ---
const StarBackground = () => {
  const [stars, setStars] = useState<any[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 30 }).map((_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: Math.random() * 3 + 1, duration: Math.random() * 3 + 2,
      delay: Math.random() * 5, opacity: Math.random() * 0.5 + 0.3,
    })));
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
      {stars.map((star) => (
        <div key={star.id} className="star" style={{ left: `${star.left}%`, top: `${star.top}%`, width: `${star.size}px`, height: `${star.size}px`, '--duration': `${star.duration}s`, '--delay': `${star.delay}s`, '--opacity': star.opacity } as any} />
      ))}
    </div>
  );
};

// --- View Components ---
const HomeView = ({ onNavigate, playSound }: any) => (
  <div className="w-full flex flex-col gap-6 animate-fade-in">
    <div className="mystic-panel p-8 text-center relative overflow-hidden group border border-yellow-500/20 rounded-2xl bg-black/40 backdrop-blur-md">
      <div className="w-56 h-56 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
        <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
      </div>
      <h2 className="text-2xl font-bold text-yellow-100 mb-2 font-cinzel tracking-wider">ยินดีต้อนรับสู่ MEEMON</h2>
      <p className="text-sm text-gray-400 font-light leading-relaxed">ดวงชะตาฟ้าลิขิต หรือจิตท่านกำหนด</p>
    </div>
    <div className="space-y-4">
      <button onClick={() => { playSound('click'); onNavigate('fortune'); }} className="btn-mystic w-full p-5 rounded-xl flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 border border-purple-500/30 p-3 rounded-lg"><Eye className="text-purple-300 w-6 h-6" /></div>
          <div className="text-left"><h3 className="font-bold text-lg text-yellow-50">ทำนายดวงชะตา</h3><p className="text-[10px] text-purple-200/60 uppercase">Pick a Card</p></div>
        </div>
        <ChevronRight className="text-purple-500/50 group-hover:text-yellow-400" />
      </button>
      <button onClick={() => { playSound('click'); onNavigate('wallpaper'); }} className="btn-mystic w-full p-5 rounded-xl flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 border border-teal-500/30 p-3 rounded-lg"><Smartphone className="text-teal-300 w-6 h-6" /></div>
          <div className="text-left"><h3 className="font-bold text-lg text-yellow-50">ยันต์วอลเปเปอร์</h3><p className="text-[10px] text-teal-200/60 uppercase">Sacred Wallpaper</p></div>
        </div>
        <ChevronRight className="text-teal-500/50 group-hover:text-yellow-400" />
      </button>
    </div>
  </div>
);

const FortuneView = ({ onBack, playSound }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardData, setCardData] = useState(FORTUNE_CARDS[0]);
  const [animating, setAnimating] = useState(false);
  const flipCard = () => { if (isFlipped || animating) return; setAnimating(true); playSound('flip'); setCardData(FORTUNE_CARDS[Math.floor(Math.random() * FORTUNE_CARDS.length)]); setIsFlipped(true); setTimeout(() => setAnimating(false), 800); };
  const resetCard = () => { if (animating) return; setAnimating(true); playSound('flip'); setIsFlipped(false); setTimeout(() => setAnimating(false), 800); };
  return (
    <div className="w-full flex flex-col items-center">
      <button onClick={() => { playSound('click'); onBack(); }} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
      <div className="perspective-1000 w-64 h-96 cursor-pointer group mb-4" onClick={flipCard}>
        <div className={`card-inner w-full h-full relative text-center transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="card-front absolute w-full h-full backface-hidden bg-[#1a1a1a] border-2 border-[#d4af37] rounded-xl flex items-center justify-center shadow-2xl">
            <div className="w-[85%] h-[85%] border border-yellow-500/30 flex items-center justify-center relative">
              <div className="absolute w-[70%] h-[70%] border border-yellow-500/20 rotate-45"></div>
              <div className="text-center z-10"><img src={LOGO_URL} className="w-24 h-24 mx-auto mb-4 object-contain opacity-90" alt="Card Back" /><span className="font-cinzel text-yellow-600/80 font-bold tracking-[0.3em] text-2xl block">FATE</span></div>
            </div>
          </div>
          <div className="card-back absolute w-full h-full backface-hidden bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] text-[#1e1b4b] rounded-xl flex flex-col items-center justify-between p-6 border-4 border-double border-[#d4af37] shadow-2xl rotate-y-180">
            <div className="w-full text-center border-b border-yellow-200 pb-2"><h3 className="text-xl font-bold font-cinzel text-slate-800">{cardData.name}</h3></div>
            <div className="text-5xl my-2">{cardData.icon}</div>
            <div className="flex-grow flex items-center"><p className="text-sm text-center leading-7 font-light text-slate-600">{cardData.meaning}</p></div>
            <div className="w-full border-t border-yellow-200 pt-2 flex justify-between items-center px-4"><span className="text-[10px] text-gray-400 uppercase">Lucky No.</span><span className="text-lg font-bold text-yellow-700">{cardData.lucky}</span></div>
          </div>
        </div>
      </div>
      <p className={`text-xs text-purple-300/50 mb-6 italic transition-opacity ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>แตะที่ไพ่เพื่อเปิดคำทำนาย</p>
      <button onClick={resetCard} disabled={!isFlipped} className={`btn-mystic px-8 py-3 rounded-full text-sm font-bold text-yellow-100 border border-yellow-500/30 transition-all ${!isFlipped ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>สุ่มชะตาใหม่</button>
    </div>
  );
};

const WallpaperView = ({ onBack, playSound }: any) => {
  const [step, setStep] = useState('day');
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isConsecrating, setIsConsecrating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const aspects = useMemo(() => (!selectedDay ? [] : selectedDay === 'anyday' ? Object.values(ASPECT_OPTIONS) : [ASPECT_OPTIONS.wealth, ASPECT_OPTIONS.love, ASPECT_OPTIONS.work, ASPECT_OPTIONS.health]), [selectedDay]);
  
  if (step === 'day') return (
    <div className="w-full flex flex-col items-center animate-fade-in px-2">
      <button onClick={() => { playSound('click'); onBack(); }} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase tracking-widest"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
      <div className="mystic-panel w-full p-6 border border-yellow-500/20 bg-black/40 rounded-2xl">
        <label className="block text-center text-sm text-yellow-100 uppercase mb-4 font-bold">เลือกวันเกิดของท่าน</label>
        <div className="day-grid grid grid-cols-2 gap-3">
          {DAY_BUTTONS.map((btn) => (
            <button key={btn.key} onClick={() => { playSound('click'); setSelectedDay(btn.key); setActiveCardIndex(0); setStep('aspect'); }} className={`relative h-16 rounded-xl border flex items-center px-4 gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${btn.styleClass}`}>
              <span className="text-2xl">{btn.icon}</span>
              <span className="text-sm font-bold uppercase">{btn.label}</span>
              {btn.isNew && <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold shadow-lg badge-pulse z-10">ใหม่</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  if (step === 'aspect') return (
    <div className="w-full flex flex-col items-center animate-fade-in px-2 relative">
      <button onClick={() => setStep('day')} className="self-start mb-6 flex items-center text-xs text-yellow-500/70 hover:text-yellow-400 uppercase transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> เลือกวันใหม่</button>
      <div className="flex items-center justify-between w-full max-w-xs mb-2 z-20">
          <button onClick={() => { playSound('flip'); setActiveCardIndex(p => (p - 1 + aspects.length) % aspects.length); }} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 active:scale-90 transition-all"><ChevronLeft className="w-6 h-6" /></button>
          <h3 className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 font-bold text-lg tracking-widest text-center">เลือกความปรารถนา</h3>
          <button onClick={() => { playSound('flip'); setActiveCardIndex(p => (p + 1) % aspects.length); }} className="p-3 bg-black/40 border border-white/20 rounded-full text-white/80 active:scale-90 transition-all"><ChevronRight className="w-6 h-6" /></button>
      </div>
      <div className="stack-container relative w-[260px] h-[380px] my-6 z-10">
        {aspects.map((aspect: any, index: number) => {
           const offset = (index - activeCardIndex + aspects.length) % aspects.length;
           let transform = offset === 0 ? 'translateY(0) scale(1)' : offset === 1 ? 'translateY(30px) scale(0.92)' : 'translateY(50px) scale(0.85)';
           let opacity = offset === 0 ? 1 : offset === 1 || offset === aspects.length-1 ? 0.6 : 0;
           return (
             <div key={aspect.id} className={`stack-card absolute w-full h-full rounded-2xl border-2 overflow-hidden shadow-2xl flex flex-col items-center justify-center ${aspect.colorClass} ${offset === 0 && isConsecrating ? 'animate-consecrate' : ''}`} style={{ zIndex: offset === 0 ? 20 : 10-offset, transform, opacity, background: aspect.bgPattern }}>
                <div className="absolute inset-2 border-2 border-white/20 rounded-xl pointer-events-none"></div>
                <div className="text-6xl mb-4 drop-shadow-md">{aspect.icon}</div>
                <h3 className="font-bold text-2xl text-white tracking-wider font-cinzel text-center px-4">{aspect.label}</h3>
                <p className="text-xs text-white/50 uppercase tracking-[0.3em] mt-2">{aspect.sub}</p>
                {aspect.isNew && <div className="new-ribbon badge-pulse">NEW</div>}
             </div>
           );
        })}
      </div>
      <button onClick={() => { playSound('magic'); setIsConsecrating(true); setTimeout(() => { setGeneratedImageUrl((WALLPAPER_DB as any)[selectedDay!]?.[aspects[activeCardIndex].id] || (WALLPAPER_DB as any).anyday[aspects[activeCardIndex].id]); playSound('success'); setShowToast(true); setStep('result'); setIsConsecrating(false); setTimeout(() => setShowToast(false), 3000); }, 1600); }} disabled={isConsecrating} className="mt-2 w-full max-w-xs bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 z-20 group"><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> <span>{isConsecrating ? 'กำลังปลุกเสก...' : 'ปลุกเสกวอลเปเปอร์'}</span></button>
    </div>
  );
  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-10 px-2">
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#333] text-white px-6 py-4 rounded-xl border border-yellow-500 shadow-2xl flex items-center gap-3 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}><CheckCircle className="text-green-400 w-6 h-6" /> ปลุกเสกสำเร็จ!</div>
      <button onClick={() => setStep('aspect')} className="self-start mb-4 text-xs text-yellow-500/70 uppercase transition-colors"><ArrowLeft className="w-3 h-3 mr-1" /> เปลี่ยนคำขอ</button>
      <div className="relative w-full max-w-[280px] group mb-4 cursor-pointer" onClick={() => window.open(generatedImageUrl, '_blank')}>
          <img src={generatedImageUrl} className="relative w-full rounded-xl shadow-2xl border border-white/10" alt="Sacred Wallpaper" />
      </div>
      <p className="text-xs text-yellow-200/80 text-center">แตะที่รูปเพื่อดูภาพขนาดเต็มและดาวน์โหลด</p>
    </div>
  );
};

// --- App Component ---
function App() {
  const [currentView, setCurrentView] = useState('home');
  const soundsRef = useRef<any>({});
  
  useEffect(() => { 
    Object.entries(SOUNDS).forEach(([k, u]) => soundsRef.current[k] = new Audio(u));
  }, []);

  const playSound = (t: string) => { 
    const a = soundsRef.current[t]; 
    if (a) { a.currentTime = 0; a.play().catch(() => {}); } 
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 min-h-screen relative z-0">
      <StarBackground />
      <header className="w-full text-center py-6 z-10">
        <div className="inline-flex items-center gap-3 mb-2">
            <img src={LOGO_URL} className="w-16 h-16 object-contain" alt="Logo" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] font-cinzel tracking-widest mt-2">MEEMON</h1>
            <img src={LOGO_URL} className="w-16 h-16 object-contain" alt="Logo" />
        </div>
        <p className="text-[10px] tracking-[0.2em] text-yellow-100 uppercase opacity-60 font-light">Destiny & Faith</p>
      </header>
      <main className="w-full max-w-md flex-grow flex flex-col items-center justify-center z-10">
        {currentView === 'home' && <HomeView onNavigate={setCurrentView} playSound={playSound} />}
        {currentView === 'fortune' && <FortuneView onBack={() => setCurrentView('home')} playSound={playSound} />}
        {currentView === 'wallpaper' && <WallpaperView onBack={() => setCurrentView('home')} playSound={playSound} />}
      </main>
      <footer className="mt-8 text-center pb-4 opacity-20 text-[10px] tracking-[0.3em] uppercase z-10">MEEMON Card</footer>
    </div>
  );
}

// Initial Render
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
