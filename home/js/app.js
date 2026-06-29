/* ============================================
   Meemon Shop - Main Application
   ============================================ */

const MeemonApp = {
  currentView: 'home',
  previousView: null,
  detailQty: 1,
  bannerIndex: 0,
  bannerInterval: null,
  flashCountdownInterval: null,

  /**
   * Initialize the app
   */
  init() {
    // Init modules
    Products.init();
    Auth.init();
    Cart.init();

    // Render initial content
    this.renderHome();
    
    // Setup event listeners
    this.setupNavigation();
    this.setupSearch();
    this.startFlashCountdown();

    console.log('✦ มีมนต์ Shop initialized');
  },

  /**
   * Render home page content
   */
  renderHome() {
    this.renderBanners();
    Products.renderCategories('categories-grid');
    Products.renderFlashSale('flash-sale-list');
    Products.renderProducts('products-grid');
    this.startBannerCarousel();
  },

  /**
   * Render dynamic banners
   */
  renderBanners() {
    const track = document.getElementById('banner-track');
    const dotsContainer = document.getElementById('banner-dots');
    if (!track || !dotsContainer) return;

    const banners = Products.banners || [];
    if (banners.length === 0) {
      track.innerHTML = `
        <div class="banner-slide" style="background: var(--gradient-primary);">
          <div class="banner-content">
            <div class="banner-title">ยินดีต้อนรับสู่ มีมนต์ Shop</div>
            <div class="banner-subtitle">ช้อปสินค้าคุณภาพดี ราคาประหยัด</div>
          </div>
        </div>
      `;
      dotsContainer.innerHTML = '<span class="dot active" data-index="0"></span>';
      return;
    }

    track.innerHTML = banners.map(banner => `
      <div class="banner-slide" style="background: ${banner.background}">
        <div class="banner-content">
          <div class="banner-title">${banner.title}</div>
          <div class="banner-subtitle">${banner.subtitle}</div>
          <span class="banner-badge">${banner.badge}</span>
        </div>
      </div>
    `).join('');

    dotsContainer.innerHTML = banners.map((banner, index) => `
      <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
    `).join('');
  },

  /**
   * Navigation system
   */
  setupNavigation() {
    // Bottom nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view === 'all-categories') {
          this.showAllCategories();
        } else {
          this.navigateTo(view);
        }
      });
    });
  },

  /**
   * Navigate to a view
   */
  navigateTo(viewName) {
    // Save previous view for back navigation
    this.previousView = this.currentView;
    this.currentView = viewName;

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show target view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navMap = {
      'home': 'nav-home',
      'category': 'nav-categories',
      'cart': 'nav-cart',
      'profile': 'nav-profile',
      'checkout': null,
      'payment': null,
      'orders': 'nav-profile',
      'search': null,
      'product': null,
      'admin': 'nav-profile'
    };
    
    const activeNavId = navMap[viewName];
    if (activeNavId) {
      document.getElementById(activeNavId)?.classList.add('active');
    }

    // Render view-specific content
    switch (viewName) {
      case 'cart':
        Cart.renderCart();
        break;
      case 'checkout':
        Cart.renderCheckout();
        break;
      case 'profile':
        this.renderProfile();
        break;
      case 'orders':
        Payment.renderOrders();
        break;
      case 'admin':
        Admin.init();
        break;
    }

    // Show/hide header based on view
    const header = document.getElementById('main-header');
    const noHeaderViews = ['product', 'checkout', 'payment', 'admin'];
    if (header) {
      header.style.display = noHeaderViews.includes(viewName) ? 'none' : '';
    }

    // Adjust padding based on header visibility
    const main = document.getElementById('main-content');
    if (main) {
      main.style.paddingTop = noHeaderViews.includes(viewName) ? '0' : '';
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  /**
   * Go back to previous view
   */
  goBack() {
    if (this.previousView) {
      this.navigateTo(this.previousView);
    } else {
      this.navigateTo('home');
    }
  },

  /**
   * Show product detail
   */
  showProduct(productId) {
    this.detailQty = 1;
    const content = document.getElementById('product-detail-content');
    if (content) {
      content.innerHTML = Products.renderProductDetail(productId);
    }
    this.navigateTo('product');
  },

  /**
   * Adjust quantity on product detail
   */
  adjustDetailQty(delta) {
    this.detailQty = Math.max(1, this.detailQty + delta);
    const qtyEl = document.getElementById('detail-qty');
    if (qtyEl) {
      qtyEl.textContent = this.detailQty;
    }
  },

  /**
   * Show category products
   */
  showCategory(categoryId) {
    const category = Products.getCategoryById(categoryId);
    if (!category) return;

    document.getElementById('category-page-title').textContent = category.name;
    
    const products = Products.getByCategory(categoryId);
    Products.renderProducts('category-products-grid', products);
    
    this.navigateTo('category');
  },

  /**
   * Show all categories (from bottom nav)
   */
  showAllCategories() {
    document.getElementById('category-page-title').textContent = 'ทุกหมวดหมู่';
    Products.renderProducts('category-products-grid');
    this.navigateTo('category');
  },

  /**
   * Search setup
   */
  setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    const doSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;
      this.performSearch(query);
    };

    searchBtn?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
      }
    });
  },

  /**
   * Perform search
   */
  performSearch(query) {
    const results = Products.search(query);
    
    document.getElementById('search-query-display').textContent = query;
    
    const emptyEl = document.getElementById('search-empty');
    const gridEl = document.getElementById('search-results-grid');
    
    if (results.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (gridEl) gridEl.innerHTML = '';
    } else {
      if (emptyEl) emptyEl.classList.add('hidden');
      Products.renderProducts('search-results-grid', results);
    }

    this.navigateTo('search');
  },

  /**
   * Render profile view
   */
  renderProfile() {
    const container = document.getElementById('profile-content');
    if (!container) return;

    if (!Auth.isLoggedIn()) {
      container.innerHTML = `
        <div class="profile-not-logged-in">
          <i class="fa-solid fa-user-circle"></i>
          <h3 class="mb-sm">ยังไม่ได้เข้าสู่ระบบ</h3>
          <p class="text-muted mb-lg">เข้าสู่ระบบเพื่อจัดการบัญชีและติดตามคำสั่งซื้อ</p>
          <button class="btn btn-accent" onclick="Auth.showModal('login')">
            <i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ
          </button>
          <button class="btn btn-outline mt-sm" onclick="Auth.showModal('register')">
            <i class="fa-solid fa-user-plus"></i> สมัครสมาชิก
          </button>
        </div>
      `;
      return;
    }

    const user = Auth.getUser();
    const orders = Utils.storage.get('orders', []);

    container.innerHTML = `
      <div class="profile-header-card">
        <div class="profile-avatar">${user.avatar || '👤'}</div>
        <div class="profile-name">${user.name}</div>
        <div class="profile-email">${user.email}</div>
      </div>

      <div class="profile-menu">
        <div class="profile-menu-item" onclick="MeemonApp.navigateTo('orders')">
          <div class="profile-menu-icon"><i class="fa-solid fa-box"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label">คำสั่งซื้อของฉัน</div>
            <div class="menu-sublabel">${orders.length} รายการ</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item" onclick="MeemonApp.navigateTo('cart')">
          <div class="profile-menu-icon"><i class="fa-solid fa-heart"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label">สินค้าที่ถูกใจ</div>
            <div class="menu-sublabel">รายการโปรด</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item">
          <div class="profile-menu-icon"><i class="fa-solid fa-location-dot"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label">ที่อยู่จัดส่ง</div>
            <div class="menu-sublabel">จัดการที่อยู่</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item">
          <div class="profile-menu-icon"><i class="fa-solid fa-gear"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label">ตั้งค่า</div>
            <div class="menu-sublabel">การแจ้งเตือน, ความปลอดภัย</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item">
          <div class="profile-menu-icon"><i class="fa-solid fa-circle-question"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label">ช่วยเหลือ</div>
            <div class="menu-sublabel">ศูนย์ช่วยเหลือ, ติดต่อเรา</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item" onclick="MeemonApp.navigateTo('admin')" style="border-color: rgba(139, 53, 163, 0.25); background: rgba(139, 53, 163, 0.05);">
          <div class="profile-menu-icon" style="color: var(--accent);"><i class="fa-solid fa-screwdriver-wrench"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label" style="color: var(--accent); font-weight: 700;">จัดการร้านค้า (แอดมิน)</div>
            <div class="menu-sublabel">แก้ไขสินค้า, แบนเนอร์, ออเดอร์ทั้งหมด</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>

        <div class="profile-menu-item" onclick="Auth.logout()" style="border-color: rgba(231, 76, 60, 0.2);">
          <div class="profile-menu-icon" style="color: var(--error);"><i class="fa-solid fa-right-from-bracket"></i></div>
          <div class="profile-menu-text">
            <div class="menu-label" style="color: var(--error);">ออกจากระบบ</div>
            <div class="menu-sublabel">ลงชื่อออก</div>
          </div>
          <i class="fa-solid fa-chevron-right profile-menu-arrow"></i>
        </div>
      </div>

      <div class="text-center mt-lg">
        <p class="text-xs text-muted">มีมนต์ Shop v1.0</p>
        <p class="text-xs text-muted">© 2026 Meemon. All rights reserved.</p>
      </div>
    `;
  },

  /**
   * Banner carousel auto-slide
   */
  startBannerCarousel() {
    const track = document.getElementById('banner-track');
    const dots = document.querySelectorAll('#banner-dots .dot');
    const totalSlides = dots.length;

    if (!track || totalSlides === 0) return;

    // Clear existing interval to prevent overlap
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
    this.bannerIndex = 0;
    track.style.transform = 'translateX(0)';

    const updateBanner = (index) => {
      this.bannerIndex = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    // Dot clicks
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        updateBanner(parseInt(dot.dataset.index));
      });
    });

    // Auto-slide every 4 seconds
    this.bannerInterval = setInterval(() => {
      const next = (this.bannerIndex + 1) % totalSlides;
      updateBanner(next);
    }, 4000);

    // Touch swipe support
    let touchStartX = 0;
    const container = track.parentElement;
    
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && this.bannerIndex < totalSlides - 1) {
          updateBanner(this.bannerIndex + 1);
        } else if (diff < 0 && this.bannerIndex > 0) {
          updateBanner(this.bannerIndex - 1);
        }
      }
    }, { passive: true });
  },

  /**
   * Flash sale countdown timer
   */
  startFlashCountdown() {
    // Set end time to end of today
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 0);
    
    const updateCountdown = () => {
      const now = new Date();
      let remaining = Math.max(0, Math.floor((endOfDay - now) / 1000));
      
      const time = Utils.formatCountdown(remaining);
      
      const hEl = document.getElementById('countdown-h');
      const mEl = document.getElementById('countdown-m');
      const sEl = document.getElementById('countdown-s');
      
      if (hEl) hEl.textContent = time.hours;
      if (mEl) mEl.textContent = time.minutes;
      if (sEl) sEl.textContent = time.seconds;
    };

    updateCountdown();
    this.flashCountdownInterval = setInterval(updateCountdown, 1000);
  }
};

// ============================================
// Start the app when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  MeemonApp.init();
});
