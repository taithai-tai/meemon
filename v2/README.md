# Meemon V2

โฟลเดอร์นี้คือเว็บไซต์ Meemon รุ่นใหม่สำหรับ GitHub Pages

- `index.html` คือหน้าแรกของ V2
- `_source` คือโค้ด React และ TypeScript ต้นฉบับสำหรับแก้ไข V2
- โฟลเดอร์ `shop`, `fortune`, `rituals`, `wallpapers`, `cart` และ `checkout`
  คือหน้าที่เปิดใช้งานได้โดยตรงจาก URL
- `assets` เก็บรูปภาพของ V2 เท่านั้น
- `_next` เก็บ JavaScript และ CSS ที่เว็บไซต์ V2 ใช้
- `sw.js` ควบคุมเฉพาะ URL ใต้ `/v2/`

ไฟล์และโฟลเดอร์แอปรุ่นเดิมที่อยู่นอก `v2/` ไม่ถูกโหลดหรือแก้ไขโดย V2
