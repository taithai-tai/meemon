/* ============================================
   Meemon Shop - Shopping Cart
   ============================================ */

const Cart = {
  items: [],

  /**
   * Initialize cart from storage
   */
  init() {
    this.items = Utils.storage.get('cart', []);
    this.updateBadge();
  },

  /**
   * Get all cart items
   */
  getItems() {
    return this.items;
  },

  /**
   * Get total number of items
   */
  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  /**
   * Get subtotal price
   */
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  /**
   * Get shipping cost
   */
  getShipping() {
    return this.getSubtotal() > 0 ? 0 : 0; // Free shipping
  },

  /**
   * Get total price
   */
  getTotal() {
    return this.getSubtotal() + this.getShipping();
  },

  /**
   * Add item to cart
   */
  addItem(productId, qty = 1) {
    const product = Products.getById(productId);
    if (!product) return;

    const existing = this.items.find(item => item.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        qty: qty
      });
    }

    this.save();
    this.updateBadge();
    Utils.showToast('เพิ่มลงตะกร้าแล้ว! 🛒', 'success');
  },

  /**
   * Add from product detail page
   */
  addFromDetail(productId) {
    Auth.requireLogin(() => {
      const qty = parseInt(document.getElementById('detail-qty')?.textContent || '1');
      this.addItem(productId, qty);
    });
  },

  /**
   * Buy now - add to cart and go to checkout
   */
  buyNow(productId) {
    Auth.requireLogin(() => {
      const qty = parseInt(document.getElementById('detail-qty')?.textContent || '1');
      const product = Products.getById(productId);
      if (!product) return;
      
      const existing = this.items.find(item => item.productId === productId);
      if (existing) {
        existing.qty = qty;
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          emoji: product.emoji,
          qty: qty
        });
      }
      this.save();
      this.updateBadge();
      MeemonApp.navigateTo('checkout');
    });
  },

  /**
   * Update item quantity
   */
  updateQty(productId, delta) {
    const item = this.items.find(i => i.productId === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(productId);
      return;
    }

    this.save();
    this.renderCart();
  },

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.save();
    this.updateBadge();
    this.renderCart();
    Utils.showToast('ลบสินค้าแล้ว', 'info');
  },

  /**
   * Clear cart
   */
  clear() {
    this.items = [];
    this.save();
    this.updateBadge();
  },

  /**
   * Save to storage
   */
  save() {
    Utils.storage.set('cart', this.items);
  },

  /**
   * Update cart badge on bottom nav
   */
  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = this.getCount();
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  },

  /**
   * Render cart view
   */
  renderCart() {
    const container = document.getElementById('cart-content');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>ตะกร้าของคุณยังว่าง</p>
          <button class="btn btn-primary btn-sm" onclick="MeemonApp.navigateTo('home')">
            <i class="fa-solid fa-shopping-bag"></i> เลือกซื้อสินค้า
          </button>
        </div>
      `;
      return;
    }

    const itemsHtml = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
          <div class="cart-item-qty">
            <button onclick="Cart.updateQty(${item.productId}, -1)">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span>${item.qty}</span>
            <button onclick="Cart.updateQty(${item.productId}, 1)">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="Cart.removeItem(${item.productId})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');

    container.innerHTML = `
      ${itemsHtml}
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>ราคาสินค้า (${this.getCount()} ชิ้น)</span>
          <span>${Utils.formatPrice(this.getSubtotal())}</span>
        </div>
        <div class="cart-summary-row">
          <span>ค่าจัดส่ง</span>
          <span style="color: var(--success);">ฟรี</span>
        </div>
        <div class="cart-summary-row total">
          <span>ยอดรวมทั้งสิ้น</span>
          <span class="cart-total-amount">${Utils.formatPrice(this.getTotal())}</span>
        </div>
      </div>
      <div class="cart-checkout-btn">
        <button class="btn btn-accent btn-lg" onclick="Cart.goCheckout()">
          <i class="fa-solid fa-lock"></i> ดำเนินการชำระเงิน
        </button>
      </div>
    `;
  },

  /**
   * Go to checkout
   */
  goCheckout() {
    Auth.requireLogin(() => {
      if (this.items.length === 0) {
        Utils.showToast('ตะกร้าว่าง กรุณาเลือกสินค้า', 'error');
        return;
      }
      MeemonApp.navigateTo('checkout');
    });
  },

  /**
   * Render checkout view
   */
  renderCheckout() {
    const container = document.getElementById('checkout-content');
    if (!container) return;

    const user = Auth.getUser();

    const itemsHtml = this.items.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-img">${item.emoji}</div>
        <div class="checkout-item-info">
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-qty">x${item.qty}</div>
        </div>
        <div class="checkout-item-price">${Utils.formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');

    container.innerHTML = `
      <!-- Address -->
      <div class="checkout-section">
        <div class="checkout-section-title">
          <i class="fa-solid fa-location-dot"></i> ที่อยู่จัดส่ง
        </div>
        <div id="checkout-address-form">
          <div class="form-group">
            <label class="form-label">ชื่อผู้รับ</label>
            <input type="text" class="form-input" id="checkout-name" value="${user?.name || ''}" placeholder="ชื่อ-นามสกุล">
          </div>
          <div class="form-group">
            <label class="form-label">เบอร์โทรศัพท์</label>
            <input type="tel" class="form-input" id="checkout-phone" value="${user?.phone || ''}" placeholder="08X-XXX-XXXX">
          </div>
          <div class="form-group">
            <label class="form-label">ที่อยู่</label>
            <input type="text" class="form-input" id="checkout-address" placeholder="บ้านเลขที่ ซอย ถนน">
          </div>
          <div class="form-group">
            <label class="form-label">แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์</label>
            <input type="text" class="form-input" id="checkout-district" placeholder="แขวง, เขต, จังหวัด, รหัสไปรษณีย์">
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="checkout-section">
        <div class="checkout-section-title">
          <i class="fa-solid fa-box"></i> สินค้าที่สั่ง (${this.getCount()} ชิ้น)
        </div>
        ${itemsHtml}
      </div>

      <!-- Payment Method -->
      <div class="checkout-section">
        <div class="checkout-section-title">
          <i class="fa-solid fa-qrcode"></i> วิธีชำระเงิน
        </div>
        <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
          <div style="width:40px; height:40px; background:var(--accent); border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--bg-primary); font-size:0.7rem;">QR</div>
          <div>
            <div style="font-weight:600; font-size:0.9rem;">PromptPay QR Code</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">สแกนจ่าย ยืนยันอัตโนมัติ ไม่ต้องส่งสลิป</div>
          </div>
          <i class="fa-solid fa-circle-check text-accent" style="margin-left:auto;"></i>
        </div>
      </div>

      <!-- Summary -->
      <div class="checkout-section">
        <div class="checkout-section-title">
          <i class="fa-solid fa-receipt"></i> สรุปคำสั่งซื้อ
        </div>
        <div class="cart-summary-row">
          <span>ราคาสินค้า</span>
          <span>${Utils.formatPrice(this.getSubtotal())}</span>
        </div>
        <div class="cart-summary-row">
          <span>ค่าจัดส่ง</span>
          <span style="color: var(--success);">ฟรี</span>
        </div>
        <div class="cart-summary-row total">
          <span>ยอดรวมทั้งสิ้น</span>
          <span class="cart-total-amount">${Utils.formatPrice(this.getTotal())}</span>
        </div>
      </div>

      <!-- Place Order -->
      <button class="btn btn-accent btn-lg mt-md" onclick="Payment.placeOrder()">
        <i class="fa-solid fa-qrcode"></i> สั่งซื้อ & ชำระเงิน
      </button>
    `;
  }
};
