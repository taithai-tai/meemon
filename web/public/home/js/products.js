/* ============================================
   Meemon Shop - Product Data & Display
   ============================================ */

const Products = {
  // Category data
  categories: [
    { id: 'fashion', name: 'แฟชั่น', icon: 'fa-shirt', color: '#E91E63', emoji: '👗' },
    { id: 'electronics', name: 'อิเล็กฯ', icon: 'fa-mobile-screen', color: '#2196F3', emoji: '📱' },
    { id: 'beauty', name: 'ความงาม', icon: 'fa-spa', color: '#E040FB', emoji: '💄' },
    { id: 'health', name: 'สุขภาพ', icon: 'fa-heart-pulse', color: '#4CAF50', emoji: '💊' },
    { id: 'home', name: 'บ้าน', icon: 'fa-house-chimney', color: '#FF9800', emoji: '🏠' },
    { id: 'sports', name: 'กีฬา', icon: 'fa-futbol', color: '#00BCD4', emoji: '⚽' },
    { id: 'food', name: 'อาหาร', icon: 'fa-utensils', color: '#FF5722', emoji: '🍜' },
    { id: 'accessories', name: 'เครื่องประดับ', icon: 'fa-gem', color: '#D4AF37', emoji: '💎' },
  ],

  // Product data
  items: [
    {
      id: 1,
      name: 'เสื้อยืดคอกลม Premium Cotton สีพื้น Unisex',
      category: 'fashion',
      price: 299,
      originalPrice: 590,
      discount: 49,
      rating: 4.8,
      sold: 15200,
      emoji: '👕',
      image: null,
      description: 'เสื้อยืดคอกลมเนื้อผ้า Premium Cotton 100% นุ่มสบาย ระบายอากาศได้ดี ไม่ย้วยง่าย ใส่ได้ทั้งชายและหญิง มีหลายสีให้เลือก',
      isFlashSale: true,
      flashProgress: 78
    },
    {
      id: 2,
      name: 'หูฟังไร้สาย Bluetooth 5.3 เบสหนัก กันน้ำ IPX5',
      category: 'electronics',
      price: 499,
      originalPrice: 1290,
      discount: 61,
      rating: 4.6,
      sold: 8430,
      emoji: '🎧',
      image: null,
      description: 'หูฟังไร้สายบลูทูธ 5.3 เสียงใส เบสหนัก แบตอึดใช้งานต่อเนื่อง 8 ชั่วโมง พร้อมเคสชาร์จ กันน้ำ IPX5 น้ำหนักเบา ใส่สบาย',
      isFlashSale: true,
      flashProgress: 62
    },
    {
      id: 3,
      name: 'เซรั่มวิตามินซี เข้มข้น 20% ผิวกระจ่างใส',
      category: 'beauty',
      price: 359,
      originalPrice: 890,
      discount: 60,
      rating: 4.9,
      sold: 23100,
      emoji: '✨',
      image: null,
      description: 'เซรั่มวิตามินซีเข้มข้น 20% สูตร Stable Vitamin C ช่วยลดเลือนจุดด่างดำ ผิวกระจ่างใส เนียนนุ่ม ใช้ได้ทุกสภาพผิว',
      isFlashSale: true,
      flashProgress: 91
    },
    {
      id: 4,
      name: 'กระเป๋าสะพายข้าง หนัง PU คุณภาพสูง',
      category: 'fashion',
      price: 690,
      originalPrice: 1490,
      discount: 54,
      rating: 4.7,
      sold: 5620,
      emoji: '👜',
      image: null,
      description: 'กระเป๋าสะพายข้างหนัง PU เกรดพรีเมียม ดีไซน์เรียบหรู มีช่องใส่ของหลายช่อง สายปรับได้ ใช้ได้ทุกโอกาส',
      isFlashSale: true,
      flashProgress: 45
    },
    {
      id: 5,
      name: 'สมาร์ทวอทช์ รุ่นใหม่ล่าสุด วัดชีพจร SpO2',
      category: 'electronics',
      price: 1290,
      originalPrice: 3990,
      discount: 68,
      rating: 4.5,
      sold: 3280,
      emoji: '⌚',
      image: null,
      description: 'สมาร์ทวอทช์หน้าจอ AMOLED 1.85" ความละเอียดสูง วัดชีพจร SpO2 นับก้าว ติดตามการนอน กันน้ำ IP68 แบตอึด 7 วัน',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 6,
      name: 'ครีมกันแดด SPF50+ PA++++ กันน้ำ',
      category: 'beauty',
      price: 259,
      originalPrice: 550,
      discount: 53,
      rating: 4.8,
      sold: 31200,
      emoji: '☀️',
      image: null,
      description: 'ครีมกันแดด SPF50+ PA++++ สูตรบางเบา ไม่เหนียวเหนอะหนะ กันน้ำ กันเหงื่อ ปกป้องผิวจากรังสี UVA/UVB ไม่อุดตันรูขุมขน',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 7,
      name: 'รองเท้าผ้าใบ สไตล์สตรีท ใส่สบาย',
      category: 'fashion',
      price: 890,
      originalPrice: 1990,
      discount: 55,
      rating: 4.6,
      sold: 7890,
      emoji: '👟',
      image: null,
      description: 'รองเท้าผ้าใบดีไซน์สตรีท พื้นนุ่มรองรับแรงกระแทก น้ำหนักเบา ใส่สบายตลอดวัน เหมาะทั้งออกกำลังกายและใส่เที่ยว',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 8,
      name: 'เครื่องปั่นสมูทตี้ พกพา ชาร์จ USB',
      category: 'home',
      price: 390,
      originalPrice: 790,
      discount: 51,
      rating: 4.4,
      sold: 12400,
      emoji: '🥤',
      image: null,
      description: 'เครื่องปั่นสมูทตี้พกพา ชาร์จ USB-C แบตอึด ปั่นได้ 15 แก้ว ใบมีด 6 ใบ สแตนเลส ปั่นผัก ผลไม้ น้ำแข็งได้',
      isFlashSale: true,
      flashProgress: 55
    },
    {
      id: 9,
      name: 'โปรตีนเวย์ เพิ่มกล้ามเนื้อ รสช็อกโกแลต 2lb',
      category: 'health',
      price: 890,
      originalPrice: 1590,
      discount: 44,
      rating: 4.7,
      sold: 4560,
      emoji: '💪',
      image: null,
      description: 'โปรตีนเวย์คุณภาพสูง 24g ต่อ Scoop เสริมสร้างกล้ามเนื้อ ฟื้นฟูหลังออกกำลังกาย รสช็อกโกแลตเข้มข้น ละลายง่ายไม่จับเป็นก้อน',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 10,
      name: 'แหวนเงินแท้ 925 ฝังเพชร CZ สวยหรู',
      category: 'accessories',
      price: 590,
      originalPrice: 1290,
      discount: 54,
      rating: 4.9,
      sold: 6780,
      emoji: '💍',
      image: null,
      description: 'แหวนเงินแท้ 925 ชุบทองคำขาว ฝังเพชร CZ เกรดพรีเมียม สวยหรู ดูแพง ใส่ได้ทุกวัน ไม่ดำ ไม่ลอก พร้อมกล่องของขวัญ',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 11,
      name: 'ลูกฟุตบอล มาตรฐาน FIFA เบอร์ 5',
      category: 'sports',
      price: 450,
      originalPrice: 990,
      discount: 55,
      rating: 4.5,
      sold: 2340,
      emoji: '⚽',
      image: null,
      description: 'ลูกฟุตบอลมาตรฐาน FIFA เบอร์ 5 เย็บด้วยมือ หนัง PU คุณภาพสูง ทนทาน กันน้ำ เหมาะสำหรับแข่งขันและฝึกซ้อม',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 12,
      name: 'ชาเขียวมัทฉะ ญี่ปุ่นแท้ เกรด Ceremonial',
      category: 'food',
      price: 350,
      originalPrice: 690,
      discount: 49,
      rating: 4.8,
      sold: 9870,
      emoji: '🍵',
      image: null,
      description: 'ผงมัทฉะแท้จากญี่ปุ่น เกรด Ceremonial คุณภาพสูงสุด สีเขียวสด กลิ่นหอม รสชาตินุ่มละมุน ไม่ขม ชงดื่มหรือทำขนมได้',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 13,
      name: 'พาวเวอร์แบงค์ 20000mAh ชาร์จเร็ว PD 65W',
      category: 'electronics',
      price: 790,
      originalPrice: 1590,
      discount: 50,
      rating: 4.7,
      sold: 11200,
      emoji: '🔋',
      image: null,
      description: 'พาวเวอร์แบงค์ 20000mAh รองรับชาร์จเร็ว PD 65W ชาร์จโน้ตบุ๊คได้ มี USB-C และ USB-A รวม 3 พอร์ต แสดงผลดิจิตอล',
      isFlashSale: true,
      flashProgress: 70
    },
    {
      id: 14,
      name: 'ลิปสติกกำมะหยี่ เนื้อแมท ติดทนนาน',
      category: 'beauty',
      price: 199,
      originalPrice: 450,
      discount: 56,
      rating: 4.6,
      sold: 18900,
      emoji: '💋',
      image: null,
      description: 'ลิปสติกเนื้อกำมะหยี่ สัมผัสนุ่มลื่น สีสวยชัด ติดทนนาน 12 ชม. ไม่ทำให้ปากแห้ง มีส่วนผสมบำรุงริมฝีปาก',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 15,
      name: 'เสื่อโยคะ หนา 10mm กันลื่น พร้อมสาย',
      category: 'sports',
      price: 290,
      originalPrice: 690,
      discount: 58,
      rating: 4.5,
      sold: 5430,
      emoji: '🧘',
      image: null,
      description: 'เสื่อโยคะหนา 10mm วัสดุ NBR คุณภาพสูง กันลื่นทั้ง 2 ด้าน นุ่มสบาย รองรับแรงกระแทก พร้อมสายรัดพกพาสะดวก',
      isFlashSale: false,
      flashProgress: 0
    },
    {
      id: 16,
      name: 'นาฬิกาข้อมือ สแตนเลส สไตล์มินิมอล',
      category: 'accessories',
      price: 1190,
      originalPrice: 2990,
      discount: 60,
      rating: 4.8,
      sold: 3210,
      emoji: '⏱️',
      image: null,
      description: 'นาฬิกาข้อมือสแตนเลส 316L ดีไซน์มินิมอล หน้าปัดกระจก Sapphire กันรอย กันน้ำ 30M สายปรับได้ ใส่ได้ทั้งชายหญิง',
      isFlashSale: false,
      flashProgress: 0
    },
  ],
  
  // Dynamic Banners
  banners: [],

  /**
   * Initialize products and banners from localStorage
   */
  init() {
    // Load products
    const storedProducts = Utils.storage.get('products');
    if (storedProducts && storedProducts.length > 0) {
      this.items = storedProducts;
    } else {
      Utils.storage.set('products', this.items);
    }

    // Load banners
    const defaultBanners = [
      {
        id: 1,
        title: '🎉 เปิดร้านใหม่!',
        subtitle: 'ลดสูงสุด 70% ทุกชิ้น',
        badge: 'ช้อปเลย',
        background: 'linear-gradient(135deg, #7B2D8E 0%, #3D1249 50%, #D4AF37 100%)'
      },
      {
        id: 2,
        title: '⚡ Flash Sale',
        subtitle: 'ดีลพิเศษ เวลาจำกัด',
        badge: 'ลดสูงสุด 80%',
        background: 'linear-gradient(135deg, #D4AF37 0%, #8B35A3 100%)'
      },
      {
        id: 3,
        title: '🚚 ส่งฟรี!',
        subtitle: 'ทุกออเดอร์ ไม่มีขั้นต่ำ',
        badge: 'วันนี้เท่านั้น',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #8B35A3 50%, #D4AF37 100%)'
      }
    ];

    const storedBanners = Utils.storage.get('banners');
    if (storedBanners && storedBanners.length > 0) {
      this.banners = storedBanners;
    } else {
      this.banners = defaultBanners;
      Utils.storage.set('banners', this.banners);
    }
  },

  /**
   * Save products to localStorage
   */
  saveToStorage() {
    Utils.storage.set('products', this.items);
  },

  /**
   * Save banners to localStorage
   */
  saveBannersToStorage() {
    Utils.storage.set('banners', this.banners);
  },

  /**
   * CRUD for Products
   */
  addProduct(product) {
    const newId = this.items.length > 0 ? Math.max(...this.items.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      discount: Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100) || 0,
      rating: 5.0,
      sold: 0,
      emoji: product.emoji || '📦',
      image: null,
      description: product.description || '',
      isFlashSale: !!product.isFlashSale,
      flashProgress: product.isFlashSale ? Number(product.flashProgress || 0) : 0
    };
    this.items.push(newProduct);
    this.saveToStorage();
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    const idx = this.items.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    
    // Recalculate discount if price/originalPrice changed
    const originalPrice = Number(updatedFields.originalPrice ?? this.items[idx].originalPrice);
    const price = Number(updatedFields.price ?? this.items[idx].price);
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100) || 0;

    this.items[idx] = {
      ...this.items[idx],
      ...updatedFields,
      price,
      originalPrice,
      discount,
      isFlashSale: !!updatedFields.isFlashSale,
      flashProgress: updatedFields.isFlashSale ? Number(updatedFields.flashProgress || 0) : 0
    };
    this.saveToStorage();
    return this.items[idx];
  },

  deleteProduct(id) {
    const idx = this.items.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    this.saveToStorage();
    return true;
  },

  /**
   * CRUD for Banners
   */
  addBanner(banner) {
    const newId = this.banners.length > 0 ? Math.max(...this.banners.map(b => b.id)) + 1 : 1;
    const newBanner = {
      id: newId,
      title: banner.title,
      subtitle: banner.subtitle,
      badge: banner.badge || 'ช้อปเลย',
      background: banner.background || 'linear-gradient(135deg, #7B2D8E 0%, #3D1249 50%, #D4AF37 100%)'
    };
    this.banners.push(newBanner);
    this.saveBannersToStorage();
    return newBanner;
  },

  updateBanner(id, updatedFields) {
    const idx = this.banners.findIndex(b => b.id === Number(id));
    if (idx === -1) return null;
    this.banners[idx] = {
      ...this.banners[idx],
      ...updatedFields
    };
    this.saveBannersToStorage();
    return this.banners[idx];
  },

  deleteBanner(id) {
    const idx = this.banners.findIndex(b => b.id === Number(id));
    if (idx === -1) return false;
    this.banners.splice(idx, 1);
    this.saveBannersToStorage();
    return true;
  },

  /**
   * Get all products
   */
  getAll() {
    return this.items;
  },

  /**
   * Get product by ID
   */
  getById(id) {
    return this.items.find(p => p.id === Number(id));
  },

  /**
   * Get products by category
   */
  getByCategory(categoryId) {
    return this.items.filter(p => p.category === categoryId);
  },

  /**
   * Get flash sale products
   */
  getFlashSale() {
    return this.items.filter(p => p.isFlashSale);
  },

  /**
   * Search products
   */
  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  },

  /**
   * Get category by ID
   */
  getCategoryById(id) {
    return this.categories.find(c => c.id === id);
  },

  /**
   * Render categories grid
   */
  renderCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this.categories.map(cat => `
      <div class="category-item" data-category="${cat.id}" onclick="MeemonApp.showCategory('${cat.id}')">
        <div class="category-icon" style="background: ${cat.color}20; color: ${cat.color};">
          <i class="fa-solid ${cat.icon}"></i>
        </div>
        <span class="category-name">${cat.name}</span>
      </div>
    `).join('');
  },

  /**
   * Render flash sale items
   */
  renderFlashSale(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const flashItems = this.getFlashSale();
    container.innerHTML = flashItems.map(item => `
      <div class="flash-sale-item" onclick="MeemonApp.showProduct(${item.id})">
        <div class="flash-sale-img">
          ${item.emoji}
          <span class="discount-badge">-${item.discount}%</span>
        </div>
        <div class="flash-sale-info">
          <div class="flash-sale-price">${Utils.formatPrice(item.price)}</div>
          <div class="flash-sale-original">${Utils.formatPrice(item.originalPrice)}</div>
          <div class="flash-sale-progress">
            <div class="flash-sale-progress-bar" style="width: ${item.flashProgress}%"></div>
          </div>
          <div class="flash-sale-sold">ขายแล้ว ${item.flashProgress}%</div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render product card HTML
   */
  renderProductCard(item) {
    return `
      <div class="product-card" onclick="MeemonApp.showProduct(${item.id})">
        <div class="product-img">
          ${item.emoji}
          ${item.discount > 50 ? `<span class="product-badge">-${item.discount}%</span>` : ''}
          <button class="product-fav" onclick="event.stopPropagation();">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div>
            <span class="product-price">${Utils.formatPrice(item.price)}</span>
            <span class="product-price-original">${Utils.formatPrice(item.originalPrice)}</span>
          </div>
          <div class="product-meta">
            <div class="product-rating">
              ${Utils.renderStars(item.rating)}
              <span>${item.rating}</span>
            </div>
            <span>ขายแล้ว ${Utils.formatSold(item.sold)}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render products grid
   */
  renderProducts(containerId, products = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = products || this.getAll();
    container.innerHTML = items.map(item => this.renderProductCard(item)).join('');
  },

  /**
   * Render product detail
   */
  renderProductDetail(productId) {
    const item = this.getById(productId);
    if (!item) return '<p>ไม่พบสินค้า</p>';

    const category = this.getCategoryById(item.category);

    return `
      <div class="product-detail-header">
        <button class="product-detail-back" onclick="MeemonApp.goBack()">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div class="product-detail-img">${item.emoji}</div>
      </div>
      <div class="product-detail-body">
        <div class="product-detail-price-row">
          <span class="product-detail-price">${Utils.formatPrice(item.price)}</span>
          <span class="product-detail-original-price">${Utils.formatPrice(item.originalPrice)}</span>
          <span class="product-detail-discount">-${item.discount}%</span>
        </div>
        
        <h1 class="product-detail-name">${item.name}</h1>
        
        <div class="product-detail-stats">
          <div class="product-detail-stat">
            <div class="stat-value">${item.rating}</div>
            <div class="stat-label">คะแนน</div>
          </div>
          <div class="product-detail-stat">
            <div class="stat-value">${Utils.formatSold(item.sold)}</div>
            <div class="stat-label">ขายแล้ว</div>
          </div>
          <div class="product-detail-stat">
            <div class="stat-value">${category ? category.name : ''}</div>
            <div class="stat-label">หมวดหมู่</div>
          </div>
        </div>

        <div class="qty-selector">
          <span class="text-sm text-muted" style="margin-right:8px;">จำนวน:</span>
          <button onclick="MeemonApp.adjustDetailQty(-1)"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-value" id="detail-qty">1</span>
          <button onclick="MeemonApp.adjustDetailQty(1)"><i class="fa-solid fa-plus"></i></button>
        </div>

        <h3 class="product-detail-section-title">รายละเอียดสินค้า</h3>
        <p class="product-detail-desc">${item.description}</p>

        <h3 class="product-detail-section-title">การจัดส่ง</h3>
        <p class="product-detail-desc">
          <i class="fa-solid fa-truck text-accent"></i> จัดส่งฟรีทั่วประเทศ<br>
          <i class="fa-solid fa-clock text-accent"></i> จัดส่งภายใน 1-3 วันทำการ<br>
          <i class="fa-solid fa-shield-halved text-accent"></i> รับประกันสินค้า 7 วัน
        </p>
      </div>

      <div class="product-detail-actions">
        <button class="btn-add-cart" onclick="Cart.addFromDetail(${item.id})">
          <i class="fa-solid fa-cart-plus"></i> ใส่ตะกร้า
        </button>
        <button class="btn-buy-now" onclick="Cart.buyNow(${item.id})">
          <i class="fa-solid fa-bolt"></i> ซื้อเลย
        </button>
      </div>
    `;
  }
};
