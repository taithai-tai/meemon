# Firebase import

ข้อมูลจะถูกเก็บใน:

- Firestore: `shops/king_6914`
- Firestore: `shops/king_6914/products/<itemId>`
- Cloud Storage: `shopee/king_6914/products/<itemId>/images/<fileName>`

หน้าเว็บอ่านข้อมูลได้แบบ public read-only ผ่าน `firebase-products.js` ส่วนการเขียนข้อมูลทำผ่าน Firebase Admin เท่านั้น

## เตรียมสิทธิ์ Admin

สร้าง service account key จาก Firebase Console แล้วตั้งค่า:

```sh
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
```

ห้ามเก็บไฟล์ service account ไว้ใน repository

## ตรวจข้อมูลก่อนนำเข้า

```sh
pnpm run firebase:import-shopee:dry
```

ผลที่คาดหวัง:

- 45 products
- 355 images
- 212 variant options

## Deploy rules

```sh
pnpm run firebase:deploy-rules
```

## นำเข้าข้อมูลและรูป

```sh
pnpm run firebase:import-shopee
```

คำสั่งสามารถรันซ้ำได้ โดยใช้ `set(..., { merge: true })` และชื่อไฟล์ Storage เดิม

หากต้องการนำเข้าข้อมูลก่อนโดยยังไม่อัปโหลดรูป:

```sh
pnpm run firebase:import-shopee -- --skip-images
```
