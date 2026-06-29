/* ============================================
   Meemon Shop - Authentication System
   ============================================ */

const Auth = {
  currentUser: null,

  /**
   * Initialize auth - restore session
   */
  init() {
    const savedUser = Utils.storage.get('user');
    if (savedUser) {
      this.currentUser = savedUser;
    }
    this.setupEventListeners();
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.currentUser !== null;
  },

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  },

  /**
   * Show auth modal
   */
  showModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    this.switchTab(tab);
  },

  /**
   * Hide auth modal
   */
  hideModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  },

  /**
   * Switch between login/register tabs
   */
  switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
    
    document.getElementById('auth-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('auth-register').classList.toggle('hidden', tab !== 'register');
  },

  /**
   * Login with email/password
   */
  login(email, password) {
    // Check registered users
    const users = Utils.storage.get('users', []);
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) {
      this.setUser(user);
      return true;
    }
    
    // Demo: accept any login
    if (email && password) {
      const demoUser = {
        id: Utils.generateId(),
        name: email.split('@')[0],
        email: email,
        phone: '',
        avatar: '👤',
        provider: 'email',
        createdAt: new Date().toISOString()
      };
      this.setUser(demoUser);
      return true;
    }
    
    return false;
  },

  /**
   * Register new user
   */
  register(data) {
    const { name, email, phone, password, confirmPassword } = data;

    // Validation
    if (!name || !email || !phone || !password) {
      Utils.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      Utils.showToast('รหัสผ่านไม่ตรงกัน', 'error');
      return false;
    }

    if (password.length < 6) {
      Utils.showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
      return false;
    }

    // Check existing users
    const users = Utils.storage.get('users', []);
    if (users.find(u => u.email === email)) {
      Utils.showToast('อีเมลนี้ถูกใช้งานแล้ว', 'error');
      return false;
    }

    const newUser = {
      id: Utils.generateId(),
      name,
      email,
      phone,
      password,
      avatar: '👤',
      provider: 'email',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Utils.storage.set('users', users);
    
    this.setUser(newUser);
    return true;
  },

  /**
   * Social login (LINE / Google) - Demo mode
   */
  socialLogin(provider) {
    const providerNames = { line: 'LINE', google: 'Gmail' };
    const providerEmoji = { line: '💚', google: '📧' };
    
    // Simulate social login
    const demoUser = {
      id: Utils.generateId(),
      name: `ผู้ใช้ ${providerNames[provider]}`,
      email: `user_${Date.now()}@${provider}.com`,
      phone: '',
      avatar: providerEmoji[provider] || '👤',
      provider: provider,
      createdAt: new Date().toISOString()
    };

    this.setUser(demoUser);
    Utils.showToast(`เข้าสู่ระบบด้วย ${providerNames[provider]} สำเร็จ!`, 'success');
    return true;
  },

  /**
   * Set current user
   */
  setUser(user) {
    // Don't save password to session
    const sessionUser = { ...user };
    delete sessionUser.password;
    
    this.currentUser = sessionUser;
    Utils.storage.set('user', sessionUser);
    this.hideModal();
    this.updateUI();
    
    // Trigger callback if pending
    if (this._pendingCallback) {
      this._pendingCallback();
      this._pendingCallback = null;
    }
  },

  /**
   * Logout
   */
  logout() {
    this.currentUser = null;
    Utils.storage.remove('user');
    this.updateUI();
    Utils.showToast('ออกจากระบบแล้ว', 'info');
    MeemonApp.navigateTo('home');
  },

  /**
   * Require login - show modal if not logged in
   */
  requireLogin(callback) {
    if (this.isLoggedIn()) {
      callback();
      return true;
    }
    this._pendingCallback = callback;
    this.showModal('login');
    Utils.showToast('กรุณาเข้าสู่ระบบก่อนทำรายการ', 'info');
    return false;
  },

  /**
   * Update UI based on login state
   */
  updateUI() {
    // Profile view will be re-rendered when navigated to
    if (typeof MeemonApp !== 'undefined' && MeemonApp.currentView === 'profile') {
      MeemonApp.renderProfile();
    }
    // Update cart badge
    if (typeof Cart !== 'undefined') {
      Cart.updateBadge();
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Close button
    document.getElementById('btn-close-auth')?.addEventListener('click', () => {
      this.hideModal();
      this._pendingCallback = null;
    });

    // Close on overlay click
    document.getElementById('auth-modal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideModal();
        this._pendingCallback = null;
      }
    });

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (this.login(email, password)) {
        Utils.showToast('เข้าสู่ระบบสำเร็จ! 🎉', 'success');
        document.getElementById('login-form').reset();
      } else {
        Utils.showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
      }
    });

    // Register form
    document.getElementById('register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('register-name').value,
        phone: document.getElementById('register-phone').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        confirmPassword: document.getElementById('register-confirm').value
      };
      
      if (this.register(data)) {
        Utils.showToast('สมัครสมาชิกสำเร็จ! 🎉', 'success');
        document.getElementById('register-form').reset();
      }
    });

    // Social login buttons
    document.getElementById('btn-login-line')?.addEventListener('click', () => this.socialLogin('line'));
    document.getElementById('btn-login-google')?.addEventListener('click', () => this.socialLogin('google'));
    document.getElementById('btn-register-line')?.addEventListener('click', () => this.socialLogin('line'));
    document.getElementById('btn-register-google')?.addEventListener('click', () => this.socialLogin('google'));
  }
};
