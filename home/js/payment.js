/* ============================================
   Meemon Shop - Payment System (QR Code)
   ============================================ */

const Payment = {
  currentOrder: null,
  paymentTimer: null,
  countdownInterval: null,

  /**
   * Place order and show QR payment
   */
  placeOrder() {
    if (!Auth.isLoggedIn()) {
      Auth.requireLogin(() => this.placeOrder());
      return;
    }

    if (Cart.getItems().length === 0) {
      Utils.showToast('ตะกร้าว่าง', 'error');
      return;
    }

    // Validate checkout form
    const name = document.getElementById('checkout-name')?.value;
    const phone = document.getElementById('checkout-phone')?.value;
    const address = document.getElementById('checkout-address')?.value;

    if (!name || !phone || !address) {
      Utils.showToast('กรุณากรอกข้อมูลที่อยู่จัดส่ง', 'error');
      return;
    }

    // Create order
    const order = {
      id: Utils.generateOrderId(),
      items: [...Cart.getItems()],
      subtotal: Cart.getSubtotal(),
      shipping: Cart.getShipping(),
      total: Cart.getTotal(),
      address: {
        name,
        phone,
        address,
        district: document.getElementById('checkout-district')?.value || ''
      },
      status: 'pending',
      paymentMethod: 'promptpay',
      createdAt: new Date().toISOString(),
      user: Auth.getUser()
    };

    this.currentOrder = order;

    // Navigate to payment view
    MeemonApp.navigateTo('payment');
    this.showQRPayment(order);
  },

  /**
   * Show QR Code payment screen
   */
  showQRPayment(order) {
    const container = document.getElementById('payment-content');
    if (!container) return;

    container.innerHTML = `
      <div class="payment-status">
        <div class="page-back-header" style="justify-content:center; padding:0; margin-bottom:16px;">
          <h2><i class="fa-solid fa-qrcode text-accent"></i> สแกนเพื่อชำระเงิน</h2>
        </div>
        
        <div class="payment-amount-label">ยอดชำระ</div>
        <div class="payment-amount">${Utils.formatPrice(order.total)}</div>
        
        <div class="payment-qr-container" id="payment-qr-code">
          <!-- QR Code will be rendered here -->
        </div>
        
        <div class="payment-timer" id="payment-timer">
          <i class="fa-solid fa-clock"></i> เหลือเวลา <span id="payment-countdown">15:00</span>
        </div>
        
        <div style="margin: 16px 0;">
          <span style="font-size:0.8rem; color:var(--text-muted);">หมายเลขคำสั่งซื้อ</span>
          <div class="payment-order-id">${order.id}</div>
        </div>

        <div class="payment-instructions">
          <p><strong>วิธีชำระเงิน:</strong></p>
          <p>1. เปิดแอปธนาคารบนมือถือ</p>
          <p>2. เลือก "สแกน QR Code"</p>
          <p>3. สแกน QR Code ด้านบน</p>
          <p>4. ยืนยันการชำระเงิน</p>
          <p style="color: var(--accent); margin-top:12px;">
            <i class="fa-solid fa-shield-halved"></i> 
            ระบบจะยืนยันอัตโนมัติ ไม่ต้องส่งสลิป
          </p>
        </div>

        <button class="btn btn-accent btn-lg mt-lg" id="btn-simulate-payment" onclick="Payment.simulatePayment()">
          <i class="fa-solid fa-check-circle"></i> จำลองการชำระเงินสำเร็จ (Demo)
        </button>
        
        <button class="btn btn-outline btn-sm mt-md" onclick="Payment.cancelPayment()">
          ยกเลิก
        </button>
      </div>
    `;

    // Generate QR Code
    this.generateQRCode(order);
    
    // Start countdown (15 minutes)
    this.startCountdown(15 * 60);
  },

  /**
   * Generate PromptPay QR Code
   */
  generateQRCode(order) {
    const qrContainer = document.getElementById('payment-qr-code');
    if (!qrContainer) return;

    // PromptPay payload (simplified demo format)
    // Real implementation would use EMVCo format
    const promptPayId = '0891234567'; // Demo phone number
    const amount = order.total.toFixed(2);
    
    // Generate PromptPay-like data string
    const qrData = this.generatePromptPayPayload(promptPayId, amount);

    // Clear existing QR
    qrContainer.innerHTML = '';

    try {
      new QRCode(qrContainer, {
        text: qrData,
        width: 220,
        height: 220,
        colorDark: '#1A1A2E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      // Fallback if QRCode library not loaded
      qrContainer.innerHTML = `
        <div style="width:220px; height:220px; display:flex; align-items:center; justify-content:center; background:white; color:#333; font-size:0.8rem; text-align:center; padding:20px;">
          <div>
            <i class="fa-solid fa-qrcode" style="font-size:4rem; color:#8B35A3; margin-bottom:12px;"></i>
            <br>QR Code<br>
            <strong>${Utils.formatPrice(order.total)}</strong>
          </div>
        </div>
      `;
    }
  },

  /**
   * Generate PromptPay EMVCo payload (simplified)
   */
  generatePromptPayPayload(phoneNumber, amount) {
    // This is a simplified version
    // Real PromptPay QR uses EMVCo standard
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const thaiPhone = '0066' + cleanPhone.substring(1); // Convert to international format
    
    // Simplified EMVCo-like payload for demo
    const payload = [
      '000201',                              // Payload Format Indicator
      '010212',                              // Point of Initiation (Dynamic)
      `2937`,                                // Merchant Account - PromptPay
      `0016A000000677010111`,                // App ID
      `0213${thaiPhone}`,                    // Phone number
      '5303764',                             // Transaction Currency (THB = 764)
      `5406${amount}`,                       // Transaction Amount
      '5802TH',                              // Country Code
      `6304`,                                // CRC placeholder
    ].join('');
    
    // Simple CRC16 placeholder
    return payload + 'ABCD';
  },

  /**
   * Start payment countdown
   */
  startCountdown(seconds) {
    this.clearTimers();
    
    let remaining = seconds;
    const countdownEl = document.getElementById('payment-countdown');
    const timerEl = document.getElementById('payment-timer');

    this.countdownInterval = setInterval(() => {
      remaining--;
      
      if (remaining <= 0) {
        this.clearTimers();
        this.handlePaymentTimeout();
        return;
      }

      const time = Utils.formatCountdown(remaining);
      if (countdownEl) {
        countdownEl.textContent = `${time.minutes}:${time.seconds}`;
      }
      
      // Warning when less than 2 minutes
      if (remaining <= 120 && timerEl) {
        timerEl.classList.add('warning');
      }
    }, 1000);
  },

  /**
   * Simulate successful payment (Demo)
   */
  simulatePayment() {
    if (!this.currentOrder) return;
    
    const btn = document.getElementById('btn-simulate-payment');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบ...';
    }

    // Simulate processing delay
    setTimeout(() => {
      this.handlePaymentSuccess();
    }, 2000);
  },

  /**
   * Handle successful payment
   */
  handlePaymentSuccess() {
    this.clearTimers();

    if (!this.currentOrder) return;

    // Update order status
    this.currentOrder.status = 'completed';
    this.currentOrder.paidAt = new Date().toISOString();

    // Save to order history
    const orders = Utils.storage.get('orders', []);
    orders.unshift(this.currentOrder);
    Utils.storage.set('orders', orders);

    // Clear cart
    Cart.clear();

    // Show success screen
    const container = document.getElementById('payment-content');
    if (container) {
      container.innerHTML = `
        <div class="payment-success">
          <div class="payment-success-icon">✓</div>
          <h2>ชำระเงินสำเร็จ! 🎉</h2>
          <p>ขอบคุณที่สั่งซื้อกับ มีมนต์</p>
          
          <div class="payment-order-id" style="margin:24px auto;">
            หมายเลขคำสั่งซื้อ: ${this.currentOrder.id}
          </div>
          
          <div style="background:var(--bg-card); border-radius:12px; padding:16px; margin:16px 0; text-align:left;">
            <div class="cart-summary-row">
              <span class="text-muted">ยอดชำระ</span>
              <span class="fw-bold text-accent">${Utils.formatPrice(this.currentOrder.total)}</span>
            </div>
            <div class="cart-summary-row">
              <span class="text-muted">วิธีชำระ</span>
              <span>PromptPay QR</span>
            </div>
            <div class="cart-summary-row">
              <span class="text-muted">สถานะ</span>
              <span style="color:var(--success);">ชำระแล้ว ✓</span>
            </div>
            <div class="cart-summary-row">
              <span class="text-muted">จัดส่งภายใน</span>
              <span>1-3 วันทำการ</span>
            </div>
          </div>

          <button class="btn btn-accent btn-lg mt-lg" onclick="MeemonApp.navigateTo('orders')">
            <i class="fa-solid fa-box"></i> ดูคำสั่งซื้อ
          </button>
          <button class="btn btn-outline btn-sm mt-md" onclick="MeemonApp.navigateTo('home')">
            <i class="fa-solid fa-shopping-bag"></i> ช้อปต่อ
          </button>
        </div>
      `;
    }

    Utils.showToast('ชำระเงินสำเร็จ! ✨', 'success');
    this.currentOrder = null;
  },

  /**
   * Handle payment timeout
   */
  handlePaymentTimeout() {
    Utils.showToast('หมดเวลาชำระเงิน กรุณาลองใหม่', 'error');
    MeemonApp.navigateTo('checkout');
  },

  /**
   * Cancel payment
   */
  cancelPayment() {
    this.clearTimers();
    this.currentOrder = null;
    MeemonApp.navigateTo('cart');
    Utils.showToast('ยกเลิกการชำระเงิน', 'info');
  },

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.paymentTimer) {
      clearTimeout(this.paymentTimer);
      this.paymentTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },

  /**
   * Render order history
   */
  renderOrders() {
    const container = document.getElementById('orders-content');
    if (!container) return;

    const orders = Utils.storage.get('orders', []);

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-box-open"></i>
          <p>ยังไม่มีคำสั่งซื้อ</p>
          <button class="btn btn-primary btn-sm" onclick="MeemonApp.navigateTo('home')">
            <i class="fa-solid fa-shopping-bag"></i> เลือกซื้อสินค้า
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const statusMap = {
        'completed': { label: 'ชำระแล้ว', class: 'completed' },
        'pending': { label: 'รอชำระ', class: 'pending' },
        'shipping': { label: 'กำลังจัดส่ง', class: 'shipping' }
      };
      const status = statusMap[order.status] || statusMap.pending;

      const thumbs = order.items.slice(0, 4).map(item =>
        `<div class="order-item-thumb">${item.emoji}</div>`
      ).join('');

      return `
        <div class="order-card">
          <div class="order-header">
            <span class="order-id">#${order.id}</span>
            <span class="order-status ${status.class}">${status.label}</span>
          </div>
          <div class="order-items-preview">${thumbs}</div>
          <div class="order-footer">
            <span class="order-date">${Utils.formatDate(order.createdAt)}</span>
            <span class="order-total">${Utils.formatPrice(order.total)}</span>
          </div>
        </div>
      `;
    }).join('');
  }
};
