/* ============================================
   Meemon Shop - Utilities
   ============================================ */

const Utils = {
  /**
   * Format price in Thai Baht
   */
  formatPrice(price) {
    return '฿' + Number(price).toLocaleString('th-TH', { minimumFractionDigits: 0 });
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return 'MM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  },

  /**
   * Generate order ID
   */
  generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MM${dateStr}-${rand}`;
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info'
    };
    
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  },

  /**
   * LocalStorage helpers
   */
  storage: {
    get(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(`meemon_${key}`);
        return data ? JSON.parse(data) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`meemon_${key}`, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage error:', e);
      }
    },
    remove(key) {
      localStorage.removeItem(`meemon_${key}`);
    }
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Format date
   */
  formatDate(date) {
    const d = new Date(date);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  },

  /**
   * Format time remaining
   */
  formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0')
    };
  },

  /**
   * Star rating HTML
   */
  renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<i class="fa-solid fa-star"></i>';
      } else if (i - 0.5 <= rating) {
        html += '<i class="fa-solid fa-star-half-stroke"></i>';
      } else {
        html += '<i class="fa-regular fa-star"></i>';
      }
    }
    return html;
  },

  /**
   * Format sold count
   */
  formatSold(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'หมื่น';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'พัน';
    return num.toString();
  }
};
