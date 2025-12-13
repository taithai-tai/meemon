const app = {
    // เก็บข้อมูลโปรไฟล์ LINE
    lineProfile: null,
    // ข้อมูลเริ่มต้นของผู้ใช้ (จะถูกอัปเดตจาก Firebase)
    data: { 
        username: 'Guest', 
        credits: 0, 
        inventory: 0, 
        pictureUrl: '' 
    },

    // เริ่มต้นการทำงานของแอป
    async init() {
        console.log("App initializing...");
        
        // ตรวจสอบว่าโหลด Library ครบไหม
        if (typeof liff === 'undefined') {
            alert('ไม่พบ LINE SDK กรุณาตรวจสอบอินเทอร์เน็ต');
            return;
        }

        try {
            // 1. เริ่มระบบ LIFF โดยใช้ ID จากไฟล์ firebase-config.js
            await liff.init({ liffId: LIFF_ID });
            console.log("LIFF Initialized");

            // 2. ตรวจสอบสถานะการ Login
            if (liff.isLoggedIn()) {
                console.log("User is logged in");
                this.lineProfile = await liff.getProfile();
                this.updateUIProfile(); // อัปเดตหน้าจอเบื้องต้น
                await this.handleLoginSuccess(); // โหลดข้อมูลจาก Firebase
            } else {
                console.log("User is not logged in");
                this.showLoginScreen();
            }
        } catch (err) {
            console.error("LIFF Init Error:", err);
            // แสดง Error ชัดเจนถ้า LIFF ID ผิด หรือ URL ไม่ตรง
            alert(`เกิดข้อผิดพลาดในการเชื่อมต่อ LINE:\n${err.message}\n\n(ตรวจสอบ LIFF ID และ Endpoint URL)`);
        }
        
        // ซ่อน Loader เมื่อโหลดเสร็จ
        const loader = document.getElementById('global-loader');
        if (loader) loader.style.display = 'none';
    },

    // ฟังก์ชันสั่ง Login
    login() {
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    },

    // ฟังก์ชันสั่ง Logout
    logout() {
        if (confirm('ต้องการออกจากระบบใช่หรือไม่?')) {
            if (liff.isLoggedIn()) {
                liff.logout();
                window.location.reload();
            }
        }
    },

    // เมื่อ Login สำเร็จ ให้เชื่อมต่อ Firebase
    async handleLoginSuccess() {
        try {
            // ซ่อนหน้า Login แสดงหน้า Home
            this.showHomeScreen();

            // Login Firebase แบบ Anonymous (เพื่อให้ผ่าน Security Rules เบื้องต้น)
            if (auth && !auth.currentUser) {
                await auth.signInAnonymously();
            }

            // โหลดข้อมูลจาก Firestore
            await this.loadUserData();
            
        } catch (error) {
            console.error("Login Handling Error:", error);
            // alert("ไม่สามารถโหลดข้อมูลจากระบบได้");
        }
    },

    // โหลด/สร้าง ข้อมูลผู้ใช้ใน Firestore
    async loadUserData() {
        if (!this.lineProfile || !db) return;

        const userId = this.lineProfile.userId;
        const userRef = db.collection('users').doc(userId);

        try {
            const doc = await userRef.get();
            
            if (doc.exists) {
                // ถ้ามีข้อมูลเก่า ให้ดึงมาใช้
                this.data = doc.data();
                // อัปเดตข้อมูลล่าสุดจาก LINE (เช่น รูปโปรไฟล์เปลี่ยน)
                if (this.data.pictureUrl !== this.lineProfile.pictureUrl || this.data.username !== this.lineProfile.displayName) {
                    await userRef.update({
                        username: this.lineProfile.displayName,
                        pictureUrl: this.lineProfile.pictureUrl
                    });
                }
            } else {
                // ถ้าเป็นสมาชิกใหม่ ให้สร้างข้อมูลเริ่มต้น
                this.data = {
                    username: this.lineProfile.displayName,
                    pictureUrl: this.lineProfile.pictureUrl,
                    credits: 100, // แจกแต้มเริ่มต้น
                    inventory: 3, // แจกธูปเริ่มต้น
                    createdAt: new Date().toISOString()
                };
                await userRef.set(this.data);
            }
            // อัปเดตหน้าจอด้วยข้อมูลจริง
            this.updateUIData();
            
        } catch (error) {
            console.error("Database Error:", error);
        }
    },

    // --- ส่วนจัดการหน้าจอ (UI) ---

    showLoginScreen() {
        document.getElementById('view-login')?.classList.remove('hidden');
        document.getElementById('view-login')?.classList.add('flex'); // ใช้ Flex เพื่อจัดกึ่งกลาง
        document.getElementById('view-home')?.classList.add('hidden');
    },

    showHomeScreen() {
        document.getElementById('view-login')?.classList.add('hidden');
        document.getElementById('view-login')?.classList.remove('flex');
        document.getElementById('view-home')?.classList.remove('hidden');
    },

    updateUIProfile() {
        // แสดงชื่อและรูปจาก LINE ทันที (เร็วกว่ารอ Firebase)
        const nameEl = document.getElementById('display-username');
        const imgEl = document.getElementById('display-avatar');
        
        if (nameEl) nameEl.innerText = this.lineProfile.displayName;
        if (imgEl && this.lineProfile.pictureUrl) {
            imgEl.innerHTML = `<img src="${this.lineProfile.pictureUrl}" class="w-full h-full object-cover">`;
        }
    },

    updateUIData() {
        // แสดงแต้มและธูป
        const creditEl = document.getElementById('display-credits');
        const invEl = document.getElementById('display-inventory');
        
        if (creditEl) creditEl.innerText = this.data.credits.toLocaleString();
        if (invEl) invEl.innerText = this.data.inventory.toLocaleString();
    }
};

// เริ่มต้นแอปเมื่อโหลดหน้าเว็บเสร็จ
window.onload = function() {
    app.init();
};
