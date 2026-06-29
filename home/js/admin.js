/* ============================================
   Meemon Shop - Admin Dashboard Logics
   ============================================ */

const Admin = {
  currentTab: 'products',
  selectedOrderId: null,

  /**
   * Initialize Admin panel
   */
  init() {
    this.setupTabs();
    this.renderActiveTab();
    this.setupModalDismissal();
  },

  /**
   * Setup tab button event listeners
   */
  setupTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      // Remove old listeners to avoid multiple binding
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);

      newTab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        newTab.classList.add('active');
        
        this.currentTab = newTab.dataset.tab;
        this.renderActiveTab();
      });
    });
  },

  /**
   * Render the active panel
   */
  renderActiveTab() {
    // Hide all panels
    document.querySelectorAll('.admin-panel-content').forEach(p => p.classList.add('hidden'));

    // Show active panel
    const activePanelMap = {
      'products': 'admin-panel-products',
      'flash': 'admin-panel-flash',
      'banners': 'admin-panel-banners',
      'orders': 'admin-panel-orders'
    };
    
    const targetPanelId = activePanelMap[this.currentTab];
    if (targetPanelId) {
      document.getElementById(targetPanelId).classList.remove('hidden');
    }

    // Render data
    switch (this.currentTab) {
      case 'products':
        this.renderProducts();
        break;
      case 'flash':
        this.renderFlash();
        break;
      case 'banners':
        this.renderBanners();
        break;
      case 'orders':
        this.renderOrders();
        break;
    }
  },

  /**
   * Close all active admin modals
   */
  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('show');
    });
    document.body.classList.remove('modal-open');
  },

  /**
   * Setup click on overlay to close modal
   */
  setupModalDismissal() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModals();
        }
      });
    });
  },

  /* ============================================
     Tab Panel 1: Product Management
     ============================================ */
  renderProducts() {
    const listContainer = document.getElementById('admin-products-list');
    const countEl = document.getElementById('admin-products-count');
    if (!listContainer) return;

    const items = Products.getAll();
    if (countEl) {
      countEl.textContent = `ทั้งหมด ${items.length} รายการ`;
    }

    if (items.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:32px; color:var(--text-muted);">
          ไม่มีรายการสินค้า กรุณาเพิ่มสินค้าใหม่
        </div>
      `;
      return;
    }

    listContainer.innerHTML = items.map(item => {
      const category = Products.getCategoryById(item.category);
      return `
        <div class="admin-item-card">
          <div class="admin-item-thumb">${item.emoji}</div>
          <div class="admin-item-info">
            <div class="admin-item-name">
              ${item.name}
              ${item.isFlashSale ? '<span class="admin-flash-badge">⚡ Flash</span>' : ''}
            </div>
            <div class="admin-item-meta">
              <span class="text-accent fw-bold">${Utils.formatPrice(item.price)}</span>
              <span style="text-decoration:line-through; margin-left:6px; font-size:0.7rem; opacity:0.6;">${Utils.formatPrice(item.originalPrice)}</span>
              <div style="margin-top:2px; font-size:0.7rem; color:var(--text-muted)">
                หมวดหมู่: ${category ? category.name : item.category} | ขายแล้ว: ${item.sold} ชิ้น
              </div>
            </div>
          </div>
          <div class="admin-item-actions">
            <button class="admin-btn-action edit" onclick="Admin.openEditProductModal(${item.id})" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="admin-btn-action delete" onclick="Admin.deleteProduct(${item.id})" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openAddProductModal() {
    const modal = document.getElementById('admin-product-modal');
    const form = document.getElementById('admin-product-form');
    document.getElementById('admin-product-modal-title').textContent = 'เพิ่มสินค้าใหม่ ✦';
    form.reset();
    
    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-flash-progress-group').style.display = 'none';

    modal.classList.add('show');
    document.body.classList.add('modal-open');
  },

  openEditProductModal(id) {
    const item = Products.getById(id);
    if (!item) return;

    const modal = document.getElementById('admin-product-modal');
    document.getElementById('admin-product-modal-title').textContent = 'แก้ไขข้อมูลสินค้า ✦';

    document.getElementById('admin-product-id').value = item.id;
    document.getElementById('admin-product-name').value = item.name;
    document.getElementById('admin-product-price').value = item.price;
    document.getElementById('admin-product-original-price').value = item.originalPrice;
    document.getElementById('admin-product-category').value = item.category;
    document.getElementById('admin-product-emoji').value = item.emoji;
    document.getElementById('admin-product-description').value = item.description;

    const flashCheck = document.getElementById('admin-product-flash');
    flashCheck.checked = !!item.isFlashSale;
    
    const progressGroup = document.getElementById('admin-flash-progress-group');
    progressGroup.style.display = item.isFlashSale ? 'block' : 'none';
    document.getElementById('admin-product-flash-progress').value = item.flashProgress || 50;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
  },

  handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('admin-product-id').value;
    const name = document.getElementById('admin-product-name').value;
    const price = Number(document.getElementById('admin-product-price').value);
    const originalPrice = Number(document.getElementById('admin-product-original-price').value);
    const category = document.getElementById('admin-product-category').value;
    const emoji = document.getElementById('admin-product-emoji').value;
    const description = document.getElementById('admin-product-description').value;
    const isFlashSale = document.getElementById('admin-product-flash').checked;
    const flashProgress = Number(document.getElementById('admin-product-flash-progress').value || 50);

    const productFields = {
      name,
      price,
      originalPrice,
      category,
      emoji,
      description,
      isFlashSale,
      flashProgress
    };

    if (id) {
      // Edit
      Products.updateProduct(id, productFields);
      Utils.showToast('แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว! ✨', 'success');
    } else {
      // Add new
      Products.addProduct(productFields);
      Utils.showToast('เพิ่มสินค้าใหม่เรียบร้อยแล้ว! 🛍️', 'success');
    }

    this.closeModals();
    this.renderProducts();
    MeemonApp.renderHome(); // Re-render first page in background
  },

  deleteProduct(id) {
    if (confirm('คุณต้องการลบสินค้าชิ้นนี้ใช่หรือไม่? ข้อมูลจะหายไปถาวร')) {
      const success = Products.deleteProduct(id);
      if (success) {
        Utils.showToast('ลบสินค้าสำเร็จแล้ว 🗑️', 'info');
        this.renderProducts();
        MeemonApp.renderHome();
      } else {
        Utils.showToast('เกิดข้อผิดพลาดในการลบสินค้า', 'error');
      }
    }
  },

  /* ============================================
     Tab Panel 2: Flash Sale Settings
     ============================================ */
  renderFlash() {
    const listContainer = document.getElementById('admin-flash-list');
    if (!listContainer) return;

    const items = Products.getAll();
    if (items.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">ไม่มีรายการสินค้า</div>`;
      return;
    }

    listContainer.innerHTML = items.map(item => `
      <div class="admin-item-card" style="padding: 10px 16px;">
        <div class="admin-item-thumb" style="width:40px; height:40px; font-size:1.2rem;">${item.emoji}</div>
        <div class="admin-item-info">
          <div class="admin-item-name" style="font-size:0.8rem;">${item.name}</div>
          <div style="display:flex; align-items:center; gap:16px; margin-top:4px;">
            <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; cursor:pointer;">
              <input type="checkbox" ${item.isFlashSale ? 'checked' : ''} onchange="Admin.toggleFlash(${item.id}, this.checked)">
              <span class="text-accent" style="font-weight:600;">⚡ เข้าร่วม Flash Sale</span>
            </label>
            
            ${item.isFlashSale ? `
              <div style="display:inline-flex; align-items:center; gap:8px;">
                <span style="font-size:0.7rem; color:var(--text-muted);">ความคืบหน้า:</span>
                <input type="number" value="${item.flashProgress}" min="0" max="100" style="width:50px; background:var(--bg-input); border:1px solid var(--glass-border); padding:2px 6px; border-radius:4px; font-size:0.75rem; color:white;" onchange="Admin.updateFlashProgress(${item.id}, this.value)">
                <span style="font-size:0.7rem; color:var(--text-muted);">%</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  toggleFlash(id, isChecked) {
    Products.updateProduct(id, { isFlashSale: isChecked });
    Utils.showToast(isChecked ? 'เปิดใช้ Flash Sale สินค้าแล้ว ⚡' : 'ยกเลิก Flash Sale สินค้าแล้ว', 'info');
    this.renderFlash();
    MeemonApp.renderHome();
  },

  updateFlashProgress(id, value) {
    const val = Math.max(0, Math.min(100, Number(value)));
    Products.updateProduct(id, { flashProgress: val });
    Utils.showToast('อัปเดตเปอร์เซ็นต์ Flash Sale สำเร็จ!', 'success');
    MeemonApp.renderHome();
  },

  updateFlashDuration() {
    const minutes = Number(document.getElementById('admin-flash-duration').value || 15);
    if (minutes <= 0) {
      Utils.showToast('กรุณากรอกเวลามากกว่า 0 นาที', 'error');
      return;
    }

    // Reset countdown timer inside MeemonApp
    if (MeemonApp.flashCountdownInterval) {
      clearInterval(MeemonApp.flashCountdownInterval);
    }

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + minutes);

    const updateCountdown = () => {
      const now = new Date();
      let remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      const time = Utils.formatCountdown(remaining);
      
      const hEl = document.getElementById('countdown-h');
      const mEl = document.getElementById('countdown-m');
      const sEl = document.getElementById('countdown-s');
      
      if (hEl) hEl.textContent = time.hours;
      if (mEl) mEl.textContent = time.minutes;
      if (sEl) sEl.textContent = time.seconds;
    };

    updateCountdown();
    MeemonApp.flashCountdownInterval = setInterval(updateCountdown, 1000);

    Utils.showToast(`ปรับเวลา Flash Sale เป็น ${minutes} นาทีเรียบร้อย! ⏰`, 'success');
  },

  /* ============================================
     Tab Panel 3: Banner Ad Settings
     ============================================ */
  renderBanners() {
    const listContainer = document.getElementById('admin-banners-list');
    if (!listContainer) return;

    const banners = Products.banners || [];
    if (banners.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:32px; color:var(--text-muted);">
          ไม่มีสไลด์โฆษณา กรุณาเพิ่มแบนเนอร์ใหม่
        </div>
      `;
      return;
    }

    listContainer.innerHTML = banners.map(banner => `
      <div class="admin-item-card" style="border-left: 6px solid; border-image: ${banner.background} 1;">
        <div class="admin-item-info">
          <div class="admin-item-name">${banner.title}</div>
          <div class="admin-item-meta">
            <span>${banner.subtitle}</span>
            <div style="font-size:0.7rem; color:var(--text-accent); margin-top:2px;">ปุ่ม: "${banner.badge}"</div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="admin-btn-action edit" onclick="Admin.openEditBannerModal(${banner.id})" title="แก้ไข">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="admin-btn-action delete" onclick="Admin.deleteBanner(${banner.id})" title="ลบ">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  openAddBannerModal() {
    const modal = document.getElementById('admin-banner-modal');
    const form = document.getElementById('admin-banner-form');
    document.getElementById('admin-banner-modal-title').textContent = 'เพิ่มแบนเนอร์ใหม่ ✦';
    form.reset();
    
    document.getElementById('admin-banner-id').value = '';

    modal.classList.add('show');
    document.body.classList.add('modal-open');
  },

  openEditBannerModal(id) {
    const banner = Products.banners.find(b => b.id === Number(id));
    if (!banner) return;

    const modal = document.getElementById('admin-banner-modal');
    document.getElementById('admin-banner-modal-title').textContent = 'แก้ไขแบนเนอร์โฆษณา ✦';

    document.getElementById('admin-banner-id').value = banner.id;
    document.getElementById('admin-banner-title').value = banner.title;
    document.getElementById('admin-banner-subtitle').value = banner.subtitle;
    document.getElementById('admin-banner-badge').value = banner.badge;
    document.getElementById('admin-banner-bg').value = banner.background;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
  },

  handleBannerSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('admin-banner-id').value;
    const title = document.getElementById('admin-banner-title').value;
    const subtitle = document.getElementById('admin-banner-subtitle').value;
    const badge = document.getElementById('admin-banner-badge').value;
    const background = document.getElementById('admin-banner-bg').value;

    const bannerFields = { title, subtitle, badge, background };

    if (id) {
      Products.updateBanner(id, bannerFields);
      Utils.showToast('แก้ไขข้อมูลแบนเนอร์สำเร็จ! 📸', 'success');
    } else {
      Products.addBanner(bannerFields);
      Utils.showToast('เพิ่มแบนเนอร์ใหม่สำเร็จ! 🎞️', 'success');
    }

    this.closeModals();
    this.renderBanners();
    MeemonApp.renderHome(); // Updates carousel instantly
  },

  deleteBanner(id) {
    if (confirm('ยืนยันลบแบนเนอร์นี้?')) {
      const success = Products.deleteBanner(id);
      if (success) {
        Utils.showToast('ลบแบนเนอร์สำเร็จแล้ว 🗑️', 'info');
        this.renderBanners();
        MeemonApp.renderHome();
      } else {
        Utils.showToast('ไม่สามารถลบแบนเนอร์ได้', 'error');
      }
    }
  },

  /* ============================================
     Tab Panel 4: Client Orders Monitor
     ============================================ */
  renderOrders(filterList = null) {
    const listContainer = document.getElementById('admin-orders-list');
    if (!listContainer) return;

    const orders = filterList || Utils.storage.get('orders', []);

    if (orders.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:32px; color:var(--text-muted);">
          ไม่มีคำสั่งซื้อของลูกค้าในระบบ
        </div>
      `;
      return;
    }

    listContainer.innerHTML = orders.map(order => {
      const statusMap = {
        'completed': { label: 'ชำระแล้ว ✓', color: 'var(--success)' },
        'pending': { label: 'รอชำระเงิน ⏳', color: 'var(--warning)' },
        'shipping': { label: 'กำลังจัดส่ง 🚚', color: 'var(--info)' }
      };
      const status = statusMap[order.status] || statusMap.pending;
      const clientName = order.address ? order.address.name : (order.user ? order.user.name : 'ลูกค้ามีมนต์');

      return `
        <div class="admin-item-card" onclick="Admin.openOrderDetailModal('${order.id}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:stretch;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
            <span class="text-accent fw-bold" style="font-size:0.85rem;">#${order.id}</span>
            <span style="font-size:0.75rem; font-weight:600; color:${status.color}">${status.label}</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:8px;">
            <div>ลูกค้า: <strong>${clientName}</strong> (${order.address?.phone || '-'})</div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
              วันที่: ${Utils.formatDate(order.createdAt)} | สั่งซื้อ ${order.items?.length || 0} รายการ
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--glass-border); padding-top:8px;">
            <span style="font-size:0.75rem; color:var(--text-muted)">ยอดรวมทั้งหมด:</span>
            <span class="fw-bold text-accent" style="font-size:0.9rem;">${Utils.formatPrice(order.total)}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  filterOrders() {
    const query = document.getElementById('admin-order-search').value.toLowerCase().trim();
    const orders = Utils.storage.get('orders', []);
    
    if (!query) {
      this.renderOrders(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const clientName = order.address?.name?.toLowerCase() || '';
      const orderId = order.id.toLowerCase();
      const phone = order.address?.phone || '';
      return orderId.includes(query) || clientName.includes(query) || phone.includes(query);
    });

    this.renderOrders(filtered);
  },

  openOrderDetailModal(orderId) {
    const orders = Utils.storage.get('orders', []);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    this.selectedOrderId = orderId;

    document.getElementById('admin-order-detail-id').textContent = `#${order.id}`;
    document.getElementById('admin-order-status-select').value = order.status;

    const contentContainer = document.getElementById('admin-order-detail-content');
    if (!contentContainer) return;

    const itemsHTML = order.items.map(item => `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
        <div style="font-size:1.5rem; background:var(--bg-elevated); width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px;">${item.emoji}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.8rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            ${Utils.formatPrice(item.price)} x ${item.quantity}
          </div>
        </div>
        <div class="fw-bold text-accent" style="font-size:0.85rem;">
          ${Utils.formatPrice(item.price * item.quantity)}
        </div>
      </div>
    `).join('');

    contentContainer.innerHTML = `
      <div style="max-height:220px; overflow-y:auto; margin-bottom:16px; padding-right:4px;">
        <div class="form-label" style="border-bottom:1px solid var(--glass-border); padding-bottom:6px; margin-bottom:10px;">รายการสินค้าสั่งซื้อ</div>
        ${itemsHTML}
      </div>

      <div class="checkout-section" style="padding:12px; margin-bottom:16px; font-size:0.8rem;">
        <div class="form-label" style="border-bottom:1px solid var(--glass-border); padding-bottom:6px; margin-bottom:8px;">ข้อมูลที่อยู่จัดส่ง</div>
        <div>ชื่อลูกค้า: <strong>${order.address?.name || '-'}</strong></div>
        <div style="margin-top:4px;">เบอร์โทร: <strong>${order.address?.phone || '-'}</strong></div>
        <div style="margin-top:4px; line-height:1.4;">ที่อยู่: ${order.address?.address || '-'} ${order.address?.district || ''}</div>
      </div>

      <div style="background:var(--bg-card); padding:12px; border-radius:8px; font-size:0.8rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span class="text-muted">ราคารวมสินค้า:</span>
          <span>${Utils.formatPrice(order.subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span class="text-muted">ค่าจัดส่ง:</span>
          <span>${order.shipping === 0 ? 'ส่งฟรี' : Utils.formatPrice(order.shipping)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px solid var(--glass-border); padding-top:6px; font-size:0.85rem;">
          <span class="text-accent">ยอดรวมทั้งหมด:</span>
          <span class="text-accent">${Utils.formatPrice(order.total)}</span>
        </div>
      </div>
    `;

    const modal = document.getElementById('admin-order-modal');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
  },

  updateOrderStatus() {
    if (!this.selectedOrderId) return;
    
    const select = document.getElementById('admin-order-status-select');
    const newStatus = select.value;

    const orders = Utils.storage.get('orders', []);
    const idx = orders.findIndex(o => o.id === this.selectedOrderId);
    if (idx === -1) return;

    orders[idx].status = newStatus;
    
    // Save updated orders
    Utils.storage.set('orders', orders);

    Utils.showToast('อัปเดตสถานะคำสั่งซื้อเรียบร้อย! 📦', 'success');
    this.closeModals();
    this.renderOrders();
  }
};
