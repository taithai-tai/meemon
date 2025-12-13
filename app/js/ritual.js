const ritual = {
    isBurning: false, animationId: null, particles: [], duration: 10000, startTime: 0, cardWidth: 300, cardHeight: 533,
    cardBase: document.getElementById('card-base'),
    canvas: document.getElementById('effect-canvas'),
    pCanvas: document.getElementById('particle-canvas'),
    digits: [document.getElementById('digit-1'), document.getElementById('digit-2'), document.getElementById('digit-3')],
    get ctx() { return this.canvas.getContext('2d'); },
    get pCtx() { return this.pCanvas.getContext('2d'); },
    init() { 
        this.resizeCanvas(); 
        window.addEventListener('resize', () => this.resizeCanvas());
    },
    resizeCanvas() {
        const container = document.querySelector('.card-container');
        if(!container || container.offsetWidth === 0) return;
        this.cardWidth = container.offsetWidth;
        this.cardHeight = container.offsetHeight;
        this.canvas.width = this.cardWidth;
        this.canvas.height = this.cardHeight;
        this.pCanvas.width = this.cardWidth * 1.4;
        this.pCanvas.height = this.cardHeight * 1.4;
    },
    async start(duration) {
        if (this.isBurning) return;
        if (app.data.inventory <= 0) {
            app.showToast('ธูปหมด! กรุณาซื้อเพิ่มที่ร้านค้า');
            setTimeout(() => app.goToShop(), 1000);
            return;
        }
        this.resizeCanvas();
        app.data.inventory--;
        await app.saveData(); 
        this.isBurning = true;
        this.duration = duration;
        this.startTime = Date.now();
        const nums = [Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)];
        this.digits.forEach((el, i) => el.innerText = nums[i]);
        document.getElementById('start-buttons-group').classList.add('hidden');
        document.getElementById('result-controls').classList.add('hidden');
        this.animate(nums);
    },
    animate(finalNumbers) {
        const elapsed = Date.now() - this.startTime;
        let rawProgress = elapsed / this.duration;
        const isFireActive = rawProgress < 1.1;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pCtx.clearRect(0, 0, this.pCanvas.width, this.pCanvas.height);

        if (isFireActive) {
            const numPoints = 20;
            const step = 100 / numPoints;
            let currentY = rawProgress * (this.cardHeight + 100);
            let clipString = `100% 100%, 0% 100%, `;
            let jaggedPath = [];

            for (let i = 0; i <= numPoints; i++) {
                const xPct = i * step;
                const noise = (Math.random() - 0.5) * 30;
                let yPos = currentY + noise;
                if (yPos < 0) yPos = 0;
                clipString += `${xPct}% ${yPos}px, `;
                jaggedPath.push({ x: (xPct/100)*this.cardWidth, y: yPos });
            }

            this.cardBase.style.clipPath = `polygon(${clipString.slice(0, -2)})`;

            this.ctx.beginPath();
            this.ctx.lineWidth = 15;
            this.ctx.strokeStyle = "rgba(0,0,0,0.8)";
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            if (jaggedPath.length > 0) {
                this.ctx.moveTo(jaggedPath[0].x, jaggedPath[0].y);
                for (let p of jaggedPath) this.ctx.lineTo(p.x, p.y);
            }
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = "#ff4500";
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = "#ff0000";
            if (jaggedPath.length > 0) {
                this.ctx.moveTo(jaggedPath[0].x, jaggedPath[0].y);
                for (let p of jaggedPath) this.ctx.lineTo(p.x, p.y);
            }
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            for (let p of jaggedPath) {
                if (p.y < this.cardHeight + 50) {
                    const pX = p.x + (this.cardWidth * 0.2);
                    const pY = p.y + (this.cardHeight * 0.2);
                    if (Math.random() < 0.15) this.particles.push(new Particle('smoke', pX, pY));
                    if (Math.random() < 0.05) this.particles.push(new Particle('fire', pX, pY));
                }
            }
        } else {
            this.cardBase.style.clipPath = `polygon(0 0, 0 0, 0 0)`;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.pCtx);
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (isFireActive || this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate(finalNumbers));
        } else {
            this.finish(finalNumbers);
        }
    },
    async finish(numbers) {
        this.isBurning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pCtx.clearRect(0, 0, this.pCanvas.width, this.pCanvas.height);
        document.getElementById('result-controls').classList.remove('hidden');
        await app.addHistoryRecord(numbers);
    },
    reset() {
        document.getElementById('start-buttons-group').classList.remove('hidden');
        document.getElementById('result-controls').classList.add('hidden');
        this.cardBase.style.clipPath = 'none';
        this.digits.forEach(el => el.innerText = '?');
        const themes = ['theme-black', 'theme-gold', 'theme-orange'];
        this.cardBase.classList.remove(...themes);
        this.cardBase.classList.add(themes[Math.floor(Math.random() * themes.length)]);
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pCtx.clearRect(0, 0, this.pCanvas.width, this.pCanvas.height);
        this.isBurning = false;
    }
};

class Particle {
    constructor(type, startX, startY) {
        this.type = type;
        this.x = startX;
        this.y = startY;
        if (type === 'smoke') {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = -Math.random() * 2 - 1; 
            this.size = Math.random() * 20 + 20;
            this.life = Math.random() * 60 + 40;
            this.maxLife = this.life;
            this.alpha = 0;
            this.color = Math.floor(Math.random() * 50);
        } else if (type === 'fire') {
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = (Math.random() - 0.5) * 3 - 1;
            this.size = Math.random() * 4 + 2;
            this.life = Math.random() * 20 + 10;
            this.hue = Math.random() * 30;
        }
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.type === 'smoke') {
            this.size += 0.3;
            this.alpha = (this.life / this.maxLife) * 0.8;
        } else { this.size *= 0.9; }
    }
    draw(ctx) {
        ctx.beginPath();
        if (this.type === 'smoke') {
            ctx.fillStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${this.alpha})`;
        } else {
            ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        }
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
