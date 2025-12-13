const app = {
    lineProfile: null,
    // ใช้ LINE User ID เป็นกุญแจหลักในการเก็บข้อมูล ทำให้ข้อมูลตามไปทุกเครื่อง
    data: { username: 'User', credits: 500, inventory: 1, lastDailyClaim: null },
    
    async init() {
        this.createStars();
        // เริ่มต้นระบบ LIFF
        await this.initLIFF();
    },

    async initLIFF() {
        try {
            await liff.init({ liffId: LIFF_ID });
            
            if (liff.isLoggedIn()) {
                // ถ้า Login แล้ว ให้ดึงข้อมูลและเข้าระบบ
                this.lineProfile = await liff.getProfile();
                await this.handleLineLoginSuccess();
            } else {
                // ถ้ายังไม่ Login ให้แสดงหน้า Login
                document.getElementById('global-loader').style.display = 'none';
                this.showView('view-login');
            }
        } catch (error) {
            console.error("LIFF Init Error:", error);
            alert("ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาตรวจสอบ LIFF ID");
        }
    },

    loginWithLine() {
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    },

    async handleLineLoginSuccess() {
        const loader = document.getElementById('global-loader');
        if(loader) loader.style.display = 'flex'; // Show loading

        try {
            // 1. Login Firebase แบบ Anonymous เพื่อให้ผ่าน Security Rules (Database Access)
            // เราใช้ Anonymous เพราะเราจะจัดการ User ID ด้วยตัวเองผ่าน LINE ID
            if (!auth.currentUser) {
                await auth.signInAnonymously();
            }

            // 2. โหลดข้อมูลจาก Firestore โดยใช้ LINE User ID เป็น Document Key
            await this.loadUserData(this.lineProfile.userId);
            
            // 3. เข้าหน้าหลัก
            this.goToHome();
        } catch (error) {
            console.error("Login Success Error:", error);
            this.showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            if(loader) loader.style.display = 'none';
        }
    },

    // --- DATABASE OPS (Modified to use LINE ID) ---
    async loadUserData(lineUserId) {
        try {
            // Path: users/{lineUserId}/data/profile
            const docRef = db.collection('artifacts').doc(appId).collection('users').doc(lineUserId).collection('data').doc('profile');
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                this.data = docSnap.data();
                // อัปเดตชื่อและรูปจาก LINE เสมอ เพื่อความสดใหม่
                if (this.data.username !== this.lineProfile.displayName || this.data.pictureUrl !== this.lineProfile.pictureUrl) {
                    this.data.username = this.lineProfile.displayName;
                    this.data.pictureUrl = this.lineProfile.pictureUrl;
                    await docRef.set(this.data, { merge: true });
                }
            } else {
                // ผู้ใช้ใหม่
                this.data = {
                    username: this.lineProfile.displayName,
                    pictureUrl: this.lineProfile.pictureUrl,
                    credits: 500,
                    inventory: 1,
                    lastDailyClaim: null,
                    createdAt: new Date().toISOString()
                };
                await docRef.set(this.data);
            }
        } catch (e) {
            console.error("Error loading data:", e);
        }
        this.updateUI();
    },

    async saveData() {
        if (!this.lineProfile) return;
        try {
            await db.collection('artifacts').doc(appId).collection('users').doc(this.lineProfile.userId).collection('data').doc('profile').set(this.data, { merge: true });
            this.updateUI();
        } catch (e) {
            console.error("Save error:", e);
            this.showToast("บันทึกข้อมูลไม่สำเร็จ");
        }
    },

    async addHistoryRecord(numbers) {
        if (!this.lineProfile) return;
        try {
            await db.collection('artifacts').doc(appId).collection('users').doc(this.lineProfile.userId).collection('history').add({
                numbers: numbers.join(''),
                createdAt: new Date().toISOString()
            });
        } catch (e) { console.error(e); }
    },

    async fetchHistory() {
        if (!this.lineProfile) return [];
        try {
            const q = db.collection('artifacts').doc(appId).collection('users').doc(this.lineProfile.userId).collection('history')
                        .orderBy('createdAt', 'desc').limit(20);
            const snap = await q.get();
            return snap.docs.map(doc => {
                const d = doc.data();
                return {
                    date: new Date(d.createdAt).toLocaleString('th-TH'),
                    numbers: d.numbers
                };
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async logout() {
        if(confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            if (liff.isLoggedIn()) {
                liff.logout();
                window.location.reload(); // รีโหลดเพื่อเคลียร์ค่า
            }
        }
    },

    // --- APP FEATURES ---
    
    updateUI() {
        try {
            const name = this.data.username || 'User';
            // Update Text
            if(document.getElementById('display-username')) document.getElementById('display-username').innerText = name;
            if(document.getElementById('display-user-email')) document.getElementById('display-user-email').innerText = 'LINE Member'; // No email needed
            if(document.getElementById('display-credits')) document.getElementById('display-credits').innerText = this.data.credits.toLocaleString();
            if(document.getElementById('display-inventory')) document.getElementById('display-inventory').innerText = this.data.inventory.toLocaleString();
            if(document.getElementById('shop-credits')) document.getElementById('shop-credits').innerText = this.data.credits.toLocaleString();
            if(document.getElementById('ritual-inventory')) document.getElementById('ritual-inventory').innerText = this.data.inventory.toLocaleString();
            
            // Update Avatar
            const avatarContainer = document.getElementById('display-avatar');
            if(avatarContainer) {
                if (this.data.pictureUrl) {
                    avatarContainer.innerHTML = `<img src="${this.data.pictureUrl}" class="w-full h-full object-cover rounded-full">`;
                } else {
                    avatarContainer.innerHTML = name.charAt(0).toUpperCase();
                }
            }
        } catch(e) {}
    },
    
    async claimFreeCredits() {
        const today = new Date().toDateString();
        if (this.data.lastDailyClaim === today) return this.showToast('วันนี้คุณรับไปแล้ว พรุ่งนี้มาใหม่นะ!');
        this.data.credits += 200;
        this.data.lastDailyClaim = today;
        await this.saveData();
        this.showToast('รับฟรี 200 แต้มบุญเรียบร้อย!');
    },

    async buyItem(amount, cost) {
        if (this.data.credits < cost) return this.showToast('แต้มบุญไม่พอ! กดรับฟรีหน้าแรกได้นะ');
        this.data.credits -= cost;
        this.data.inventory += amount;
        await this.saveData();
        this.showToast(`ซื้อธูป ${amount} ดอก เรียบร้อย!`);
    },

    showView(viewId) {
        const currentActive = document.querySelector('.view-section.active');
        const target = document.getElementById(viewId);
        if (currentActive === target) { this.updateUI(); return; }
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => { if(!el.classList.contains('active')) el.style.display = 'none'; }, 500); 
        });
        target.style.display = 'flex';
        setTimeout(() => target.classList.add('active'), 50); 
        this.updateUI();
    },
    goToHome() { this.showView('view-home'); },
    goToShop() { this.showView('view-shop'); },
    goToRitual() { 
        ritual.reset(); 
        this.showView('view-ritual'); 
        setTimeout(() => ritual.resizeCanvas(), 600);
    },
    async goToHistory() { 
        this.showView('view-history');
        const container = document.getElementById('history-list');
        container.innerHTML = '<div class="text-center text-gray-500 mt-10"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
        
        const history = await this.fetchHistory();
        
        container.innerHTML = '';
        if (history.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 mt-10">ยังไม่มีประวัติการจุดธูป</div>';
            return;
        }
        history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'glass-panel p-4 flex items-center justify-between border-l-4 border-l-yellow-400';
            el.style.display = 'flex'; el.style.justifyContent = 'space-between'; el.style.alignItems = 'center';
            el.innerHTML = `<div><div class="text-xs text-gray-400">${item.date}</div><div class="text-yellow-400 font-bold mt-1">ธูปมงคล</div></div><div class="text-3xl font-bold font-['Cinzel'] tracking-widest text-white drop-shadow-md">${item.numbers.split('').join(' ')}</div>`;
            container.appendChild(el);
        });
    },
    showToast(msg) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').innerText = msg;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 3000);
    },
    createStars() {
        const container = document.getElementById('stars-container');
        if(!container) return;
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            const size = Math.random() * 3 + 1;
            star.style.width = star.style.height = `${size}px`;
            star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
            star.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(star);
        }
    }
};

// EXPOSE APP
window.app = app;
