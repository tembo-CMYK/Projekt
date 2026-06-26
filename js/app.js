// js/app.js

import { AppDB } from './db.js';
import { ProjectsView } from './projects.js';
import { ClientsView } from './clients.js';
import { FinanceView } from './finance.js';
import { AssetsView } from './assets.js';

// Global Currency Configuration
window.CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  CHF: 'CHF',
  GBP: '£',
  ZMW: 'ZK'
};
window.getCurrencySymbol = (currency) => {
  return window.CURRENCY_SYMBOLS[currency] || '$';
};
window.getWorkspaceCurrencySymbol = () => {
  const projects = AppDB.getProjects();
  for (let i = projects.length - 1; i >= 0; i--) {
    const p = projects[i];
    if (p.invoices && p.invoices.length > 0) {
      return window.getCurrencySymbol(p.invoices[p.invoices.length - 1].currency);
    }
  }
  return '$';
};
window.getProjectCurrencySymbol = (project) => {
  if (project.invoices && project.invoices.length > 0) {
    return window.getCurrencySymbol(project.invoices[0].currency);
  }
  return '$';
};

// Global Theme Setup
window.applyTheme = (themeName) => {
  const themes = {
    blue: { primary: '#3B82F6', hover: '#2563EB' },
    purple: { primary: '#8B5CF6', hover: '#7C3AED' },
    lime: { primary: '#84CC16', hover: '#65A30D' },
    orange: { primary: '#F97316', hover: '#EA580C' },
    teal: { primary: '#14B8A6', hover: '#0D9488' }
  };
  const theme = themes[themeName] || themes.blue;
  document.documentElement.style.setProperty('--color-primary', theme.primary);
  document.documentElement.style.setProperty('--color-primary-hover', theme.hover);
  localStorage.setItem('projekt_theme', themeName);
};

// Global Confetti Celebration
window.triggerConfetti = (originX, originY) => {
  const x = originX !== undefined ? originX : window.innerWidth / 2;
  const y = originY !== undefined ? originY : window.innerHeight * 0.4;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#D69CFC', '#52E2B2', '#60C5FA', '#F97316', '#F43F5E'];
  const particles = [];
  const count = 60;

  class Confetti {
    constructor() {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 6 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 8 + 4;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - 3;
      this.rotation = Math.random() * Math.PI;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.gravity = 0.2;
      this.drag = 0.96;
      this.opacity = 1.0;
    }
    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.015;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Confetti());
  }

  const animateConfetti = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.opacity > 0) {
        p.update();
        active = true;
      }
    });
    if (active) {
      requestAnimationFrame(animateConfetti);
    } else {
      canvas.remove();
    }
  };
  animateConfetti();
};

// Setup Toast Notification Utility globally

window.showToast = (message) => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ─── Global Stat Counter Animation ────────────────────────────────────────────
window.animateCounter = (el, end, duration = 900) => {
  const start = 0;
  const startTime = performance.now();
  const isFloat = String(end).includes('.');
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    el.textContent = prefix + current.toLocaleString() + suffix;
    el.classList.add('animate-pop');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const App = {
  init() {
    // Seed DB if empty
    AppDB.get();

    // Load persisted theme
    window.applyTheme(localStorage.getItem('projekt_theme') || 'blue');

    // Cosmic Background Parallax Particles
    this.initCosmicBackground();

    this.updateProfileUI();
    this.bindProfileCard();
    this.initClock();
    this.initSearch();
    this.bindNavigation();
    this.bindModalClose();
    this.renderDashboard();
    
    // Default to Dashboard tab
    this.switchView('dashboard');

    // Set up modal observer to auto-modernize selects inside modals
    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isModalActive = mutation.target.classList.contains('active');
          if (isModalActive) {
            setTimeout(() => window.modernizeSelects(), 100);
          }
        }
      });
    });
    const targetModal = document.getElementById('universal-modal');
    if (targetModal) {
      modalObserver.observe(targetModal, { attributes: true });
    }
  },

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
  },

  switchView(view) {
    // Hide all view panels
    document.querySelectorAll('.panel-view').forEach(panel => {
      panel.style.display = 'none';
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${view}`);

    // Brief shimmer skeleton before render
    activePanel.style.display = 'block';
    activePanel.innerHTML = `
      <div class="skeleton-loader" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        <div class="skeleton-block" style="width: 40%; height: 20px; margin-bottom: 8px;"></div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          ${[1,2,3,4].map(() => `<div class="skeleton-block" style="height: 80px; border-radius: 8px;"></div>`).join('')}
        </div>
        <div class="skeleton-block" style="height: 130px; border-radius: 8px;"></div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <div class="skeleton-block" style="height: 200px; border-radius: 8px;"></div>
          <div class="skeleton-block" style="height: 200px; border-radius: 8px;"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      // Call render functions for specific tabs
      if (view === 'dashboard') {
        this.renderDashboard();
      } else if (view === 'projects') {
        ProjectsView.renderPanel(activePanel);
      } else if (view === 'clients') {
        ClientsView.renderPanel(activePanel);
      } else if (view === 'finance') {
        FinanceView.renderPanel(activePanel);
      } else if (view === 'assets') {
        AssetsView.renderPanel(activePanel);
      }
      setTimeout(() => activePanel.classList.add('active'), 10);
      // Modernize selects in current view
      setTimeout(() => window.modernizeSelects(), 120);
    }, 180);
  },

  bindModalClose() {
    const modal = document.getElementById('universal-modal');
    
    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    // Close button click
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  },

  initCosmicBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cosmic-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.background = 'transparent';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const particleCount = 100;
    
    const colors = [
      'rgba(96, 197, 250, ',
      'rgba(214, 156, 252, ',
      'rgba(82, 226, 178, ',
      'rgba(244, 244, 245, '
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.25 + 0.05;
        this.alpha = this.baseAlpha;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.parallaxFactor = Math.random() * 15 + 5;
        this.fadeDir = Math.random() > 0.5 ? 0.005 : -0.005;
      }
      update(mouseX, mouseY) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.alpha += this.fadeDir;
        if (this.alpha > this.baseAlpha * 1.5 || this.alpha < this.baseAlpha * 0.5) {
          this.fadeDir = -this.fadeDir;
        }

        ctx.beginPath();
        const offsetX = (mouseX - width / 2) / this.parallaxFactor;
        const offsetY = (mouseY - height / 2) / this.parallaxFactor;

        ctx.arc(this.x + offsetX, this.y + offsetY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.alpha + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      particles.forEach(p => p.update(mouseX, mouseY));
      requestAnimationFrame(animate);
    };
    animate();
  },

  initClock() {
    const clockEl = document.getElementById('header-clock');
    const tzSelect = document.getElementById('timezone-select');
    if (!clockEl || !tzSelect) return;

    const savedTz = localStorage.getItem('projekt_timezone') || 'Africa/Lusaka';
    tzSelect.value = savedTz;

    const updateTime = () => {
      const selectedTz = tzSelect.value;
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: selectedTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        let tzAbbr = '';
        if (selectedTz === 'Africa/Lusaka') tzAbbr = 'CAT';
        else if (selectedTz === 'Europe/Zurich') tzAbbr = 'CET';
        else if (selectedTz === 'Europe/London') tzAbbr = 'GMT';
        else if (selectedTz === 'America/New_York') tzAbbr = 'EST';
        else if (selectedTz === 'America/Los_Angeles') tzAbbr = 'PST';
        else tzAbbr = selectedTz.split('/').pop().toUpperCase();

        clockEl.innerText = `${timeStr} ${tzAbbr}`;
      } catch (err) {
        console.error(err);
        clockEl.innerText = new Date().toLocaleTimeString();
      }
    };

    tzSelect.addEventListener('change', () => {
      localStorage.setItem('projekt_timezone', tzSelect.value);
      updateTime();

      // Refresh dashboard if active to align welcome message
      const currentActiveItem = document.querySelector('.nav-item.active');
      if (currentActiveItem && currentActiveItem.dataset.view === 'dashboard') {
        this.renderDashboard();
      }
    });

    updateTime();
    setInterval(updateTime, 1000);
  },

  initSearch() {
    const searchInput = document.getElementById('workspace-search-input');
    const resultsTray = document.getElementById('search-results-dropdown');
    if (!searchInput || !resultsTray) return;

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsTray.contains(e.target)) {
        resultsTray.style.display = 'none';
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        resultsTray.style.display = 'block';
      }
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query.length === 0) {
        resultsTray.style.display = 'none';
        resultsTray.innerHTML = '';
        return;
      }

      const projects = AppDB.getProjects();
      const clients = AppDB.getClients();
      const libraryAssets = AppDB.getLibraryAssets();

      const matchingProjects = projects.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );

      const matchingClients = clients.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.contactPerson.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query)
      );

      const matchingAssets = libraryAssets.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.value.toLowerCase().includes(query)
      );

      const totalMatches = matchingProjects.length + matchingClients.length + matchingAssets.length;

      if (totalMatches === 0) {
        resultsTray.innerHTML = `<div style="padding: 12px 16px; font-size: 13px; color: var(--text-muted); text-align: center;">No matches found.</div>`;
        resultsTray.style.display = 'block';
        return;
      }

      let html = '';

      if (matchingProjects.length > 0) {
        html += `<div style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; color: var(--tech-text); border-bottom: 1px solid var(--border-color); font-weight: 600;">Projects</div>`;
        matchingProjects.forEach(p => {
          html += `
            <div class="search-result-item" data-type="project" data-id="${p.id}" style="padding: 10px 16px; font-size: 13px; cursor: pointer; transition: background 0.15s; display: flex; flex-direction: column; gap: 2px;">
              <strong style="color: #FFF;">${p.title}</strong>
              <span style="font-size: 11px; color: var(--text-muted);">${p.category} — ${p.status}</span>
            </div>
          `;
        });
      }

      if (matchingClients.length > 0) {
        html += `<div style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; color: var(--swiss-text); border-bottom: 1px solid var(--border-color); font-weight: 600; margin-top: 8px;">Clients</div>`;
        matchingClients.forEach(c => {
          html += `
            <div class="search-result-item" data-type="client" data-id="${c.id}" style="padding: 10px 16px; font-size: 13px; cursor: pointer; transition: background 0.15s; display: flex; flex-direction: column; gap: 2px;">
              <strong style="color: #FFF;">${c.name}</strong>
              <span style="font-size: 11px; color: var(--text-muted);">${c.contactPerson} (${c.email})</span>
            </div>
          `;
        });
      }

      if (matchingAssets.length > 0) {
        html += `<div style="padding: 6px 12px; font-size: 11px; text-transform: uppercase; color: var(--unicorn-text); border-bottom: 1px solid var(--border-color); font-weight: 600; margin-top: 8px;">Asset Library</div>`;
        matchingAssets.forEach(a => {
          html += `
            <div class="search-result-item" data-type="asset" data-id="${a.id}" style="padding: 10px 16px; font-size: 13px; cursor: pointer; transition: background 0.15s; display: flex; flex-direction: column; gap: 2px;">
              <strong style="color: #FFF;">${a.title}</strong>
              <span style="font-size: 11px; color: var(--text-muted); text-transform: capitalize;">${a.type} asset</span>
            </div>
          `;
        });
      }

      resultsTray.innerHTML = html;
      resultsTray.style.display = 'block';

      resultsTray.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          const id = item.dataset.id;
          
          resultsTray.style.display = 'none';
          searchInput.value = '';

          if (type === 'project') {
            document.querySelector('.nav-item[data-view="projects"]').click();
            setTimeout(() => {
              ProjectsView.viewProjectDetail(id);
            }, 100);
          } else if (type === 'client') {
            document.querySelector('.nav-item[data-view="clients"]').click();
            setTimeout(() => {
              ClientsView.viewClientDetail(id);
            }, 100);
          } else if (type === 'asset') {
            document.querySelector('.nav-item[data-view="assets"]').click();
            setTimeout(() => {
              const assetSearchInput = document.getElementById('asset-search-input');
              if (assetSearchInput) {
                assetSearchInput.value = item.querySelector('strong').innerText;
                assetSearchInput.dispatchEvent(new Event('input'));
              }
            }, 100);
          }
        });
      });
    });
  },

  updateProfileUI() {
    const profile = AppDB.getProfile();
    
    const avatars = document.querySelectorAll('.profile-avatar');
    const nameSpan = document.querySelector('.profile-name');
    const roleSpan = document.querySelector('.profile-role');
    
    avatars.forEach(av => {
      av.src = profile.avatar;
    });
    if (nameSpan) nameSpan.innerText = profile.name;
    if (roleSpan) roleSpan.innerText = profile.role;
  },

  bindProfileCard() {
    const profileTriggers = document.querySelectorAll('.profile-card, .mobile-profile-trigger');
    profileTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        this.showProfileModal();
      });
    });
  },

  showProfileModal() {
    const modal = document.getElementById('universal-modal');
    const mTitle = document.getElementById('modal-title');
    const mBody = document.getElementById('modal-body');
    const mFooter = document.getElementById('modal-footer');

    const profile = AppDB.getProfile();

    mTitle.innerText = 'Profile Settings';

    mBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 8px;">
          <img id="profile-edit-preview" src="${profile.avatar}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid var(--swiss-border);" />
          <div style="flex: 1;">
            <label class="form-label" style="display: block; margin-bottom: 6px; font-size: 12px; color: var(--text-muted);">Choose Avatar</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <img class="avatar-option" data-url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" style="width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 1px solid var(--border-color); object-fit: cover; transition: border-color 0.15s ease;" />
              <img class="avatar-option" data-url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" style="width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 1px solid var(--border-color); object-fit: cover; transition: border-color 0.15s ease;" />
              <img class="avatar-option" data-url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" style="width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 1px solid var(--border-color); object-fit: cover; transition: border-color 0.15s ease;" />
              <img class="avatar-option" data-url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" style="width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 1px solid var(--border-color); object-fit: cover; transition: border-color 0.15s ease;" />
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label for="profile-avatar-upload" class="btn btn-secondary" style="font-size: 11px; padding: 4px 10px; border-color: var(--tech-border); color: var(--tech-text); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 12px; height: 12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Upload Custom Image
              </label>
              <input type="file" id="profile-avatar-upload" accept="image/*" style="display: none;" />
              <span id="profile-upload-filename" style="font-size: 11px; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
            </div>
          </div>
        </div>

        <div>
          <label class="form-label" style="display: block; margin-bottom: 6px;">Profile Name</label>
          <input type="text" id="profile-edit-name" class="form-input" value="${profile.name}" style="width: 100%;" />
        </div>

        <div>
          <label class="form-label" style="display: block; margin-bottom: 6px;">Email Address</label>
          <input type="email" id="profile-edit-email" class="form-input" value="${profile.email}" style="width: 100%;" />
        </div>

        <div>
          <label class="form-label" style="display: block; margin-bottom: 6px;">Studio / Business Name</label>
          <input type="text" id="profile-edit-studio" class="form-input" value="${profile.studio || ''}" style="width: 100%;" />
        </div>

        <div>
          <label class="form-label" style="display: block; margin-bottom: 6px;">Account Tier</label>
          <input type="text" id="profile-edit-role" class="form-input" value="${profile.role}" style="width: 100%;" />
        </div>

        <div>
          <label class="form-label" style="display: block; margin-bottom: 6px;">Workspace Accent Theme</label>
          <div style="display: flex; gap: 8px;">
            <button class="theme-picker-btn" data-theme="blue" style="width: 28px; height: 28px; border-radius: 50%; background-color: #3B82F6; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;"></button>
            <button class="theme-picker-btn" data-theme="purple" style="width: 28px; height: 28px; border-radius: 50%; background-color: #8B5CF6; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;"></button>
            <button class="theme-picker-btn" data-theme="lime" style="width: 28px; height: 28px; border-radius: 50%; background-color: #84CC16; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;"></button>
            <button class="theme-picker-btn" data-theme="orange" style="width: 28px; height: 28px; border-radius: 50%; background-color: #F97316; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;"></button>
            <button class="theme-picker-btn" data-theme="teal" style="width: 28px; height: 28px; border-radius: 50%; background-color: #14B8A6; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease;"></button>
          </div>
        </div>

        <input type="hidden" id="profile-edit-avatar" value="${profile.avatar}" />
      </div>
    `;

    mFooter.innerHTML = `
      <button class="btn btn-secondary" id="profile-cancel-btn">Cancel</button>
      <button class="btn btn-primary" id="profile-save-btn">Save Profile</button>
    `;

    modal.classList.add('active');

    const editPreview = document.getElementById('profile-edit-preview');
    const avatarInput = document.getElementById('profile-edit-avatar');

    // Bind Accent Theme picker interactions
    const themeVal = localStorage.getItem('projekt_theme') || 'blue';
    mBody.querySelectorAll('.theme-picker-btn').forEach(btn => {
      if (btn.dataset.theme === themeVal) {
        btn.style.borderColor = '#FFF';
        btn.style.boxShadow = '0 0 8px var(--color-primary)';
      } else {
        btn.style.borderColor = 'rgba(255,255,255,0.1)';
      }
      btn.addEventListener('click', () => {
        const chosenTheme = btn.dataset.theme;
        window.applyTheme(chosenTheme);
        mBody.querySelectorAll('.theme-picker-btn').forEach(b => {
          if (b.dataset.theme === chosenTheme) {
            b.style.borderColor = '#FFF';
            b.style.boxShadow = '0 0 8px var(--color-primary)';
          } else {
            b.style.borderColor = 'rgba(255,255,255,0.1)';
            b.style.boxShadow = 'none';
          }
        });
      });
    });

    // Custom upload binding
    const uploadInput = document.getElementById('profile-avatar-upload');
    const uploadFilename = document.getElementById('profile-upload-filename');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          window.showToast("Please select an image file.");
          return;
        }

        if (file.size > 1024 * 1024) { // 1MB size limit
          window.showToast("Image must be smaller than 1MB.");
          return;
        }

        uploadFilename.innerText = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          editPreview.src = base64Url;
          avatarInput.value = base64Url;
          
          mBody.querySelectorAll('.avatar-option').forEach(o => o.style.borderColor = 'var(--border-color)');
        };
        reader.readAsDataURL(file);
      });
    }

    // Avatar selection interaction
    mBody.querySelectorAll('.avatar-option').forEach(opt => {
      if (opt.dataset.url === profile.avatar) {
        opt.style.borderColor = 'var(--swiss-text)';
      }
      opt.addEventListener('click', () => {
        const url = opt.dataset.url;
        editPreview.src = url;
        avatarInput.value = url;
        if (uploadFilename) uploadFilename.innerText = '';
        if (uploadInput) uploadInput.value = '';
        
        mBody.querySelectorAll('.avatar-option').forEach(o => o.style.borderColor = 'var(--border-color)');
        opt.style.borderColor = 'var(--swiss-text)';
      });
    });

    // Save and Cancel buttons
    document.getElementById('profile-cancel-btn').addEventListener('click', () => modal.classList.remove('active'));
    
    document.getElementById('profile-save-btn').addEventListener('click', () => {
      const name = document.getElementById('profile-edit-name').value.trim();
      const email = document.getElementById('profile-edit-email').value.trim();
      const studio = document.getElementById('profile-edit-studio').value.trim();
      const role = document.getElementById('profile-edit-role').value.trim();
      const avatar = avatarInput.value;

      if (!name) {
        window.showToast("Profile name cannot be empty.");
        return;
      }

      AppDB.updateProfile({ name, email, studio, role, avatar });
      this.updateProfileUI();
      
      const currentActiveItem = document.querySelector('.nav-item.active');
      if (currentActiveItem && currentActiveItem.dataset.view === 'dashboard') {
        this.renderDashboard();
      }

      window.showToast("Profile settings saved successfully!");
      modal.classList.remove('active');
    });
  },

  renderDashboard() {
    const container = document.getElementById('view-dashboard');
    const projects = AppDB.getProjects();
    const clients = AppDB.getClients();

    // Financial calculations
    const allInvoices = [];
    projects.forEach(p => {
      if (p.invoices) {
        p.invoices.forEach(inv => allInvoices.push(inv));
      }
    });

    const totalRevenue = allInvoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const activeProjects = projects.filter(p => p.status === 'Active');
    const negotiatingProjects = projects.filter(p => p.status === 'Negotiating');

    // Aggregate revenue by month
    const paidInvoices = allInvoices.filter(inv => inv.status === 'Paid');
    const monthlyRevenue = {};
    paidInvoices.forEach(inv => {
      if (!inv.date) return;
      const dateParts = inv.date.split('-');
      if (dateParts.length < 2) return;
      const monthKey = `${dateParts[0]}-${dateParts[1]}`; // e.g. "2026-03"
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + inv.total;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNum}`;
      const label = `${monthNames[d.getMonth()]} '${String(year).substring(2)}`;
      const val = monthlyRevenue[monthKey] || 0;
      chartData.push({ label, val });
    }

    const width = 600;
    const height = 130;
    const padding = 25;
    const maxVal = Math.max(...chartData.map(d => d.val), 1000);
    const points = chartData.map((d, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartData.length - 1));
      const y = height - padding - (d.val * (height - 2 * padding) / maxVal);
      return { x, y, label: d.label, val: d.val };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const svgChartHtml = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
          </linearGradient>
          <style>
            @keyframes drawLine {
              to { stroke-dashoffset: 0; }
            }
          </style>
        </defs>
        
        <!-- Grid lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.02)" stroke-width="1" stroke-dasharray="2,2" />
        <line x1="${padding}" y1="${(height) / 2}" x2="${width - padding}" y2="${(height) / 2}" stroke="rgba(255,255,255,0.02)" stroke-width="1" stroke-dasharray="2,2" />

        <!-- Area Gradient fill -->
        <path d="${areaD}" fill="url(#chart-glow)" />

        <!-- Line path -->
        <path d="${pathD}" fill="none" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1000" stroke-dashoffset="1000" style="animation: drawLine 1.5s ease-out forwards;" />

        <!-- Data points -->
        ${points.map((p, idx) => `
          <circle cx="${p.x}" cy="${p.y}" r="3" fill="#10B981" stroke="#FFF" stroke-width="1" style="cursor: pointer; transition: all 0.2s;" class="chart-point">
            <title>${p.label}: ${window.getWorkspaceCurrencySymbol()}${p.val.toLocaleString()}</title>
          </circle>
          <text x="${p.x}" y="${height - 4}" fill="var(--text-muted)" font-size="8" text-anchor="middle" font-weight="400">${p.label}</text>
          ${p.val > 0 ? `<text x="${p.x}" y="${p.y - 8}" fill="#FFF" font-size="8" font-weight="500" text-anchor="middle">${window.getWorkspaceCurrencySymbol()}${p.val.toLocaleString()}</text>` : ''}
        `).join('')}
      </svg>
    `;

    // Compile recent assets
    const recentAssets = [];
    projects.forEach(p => {
      const client = clients.find(c => c.id === p.clientId) || { name: 'Client' };
      if (p.assets) {
        p.assets.prompts.forEach(pr => {
          recentAssets.push({ type: 'AI Prompt', title: pr.title, value: pr.text || pr.value || '', project: p.title, client: client.name });
        });
        p.assets.links.forEach(ln => {
          recentAssets.push({ type: 'Bookmark Link', title: ln.title, value: ln.url || ln.value || '', project: p.title, client: client.name });
        });
      }
    });

    // Sort recent assets (just show up to 4)
    const displayAssets = recentAssets.slice(-4).reverse();

    // Compile upcoming deadlines
    const upcomingDeadlines = projects
      .filter(p => p.status === 'Active')
      .map(p => {
        const client = clients.find(c => c.id === p.clientId) || { name: 'Client' };
        return {
          title: p.title,
          client: client.name,
          dueDate: p.dueDate,
          category: p.category
        };
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);

    const profile = AppDB.getProfile();
    const savedTz = localStorage.getItem('projekt_timezone') || 'Africa/Lusaka';
    const timeOfDayGreeting = () => {
      let hr = new Date().getHours();
      try {
        const timeString = new Date().toLocaleTimeString('en-US', {
          timeZone: savedTz,
          hour12: false,
          hour: '2-digit'
        });
        hr = parseInt(timeString, 10);
      } catch (e) {
        console.error("Timezone greeting error:", e);
      }

      if (hr < 12) return 'morning';
      if (hr < 18) return 'afternoon';
      return 'evening';
    };

    container.innerHTML = `
      <!-- Personal Welcome Header with Constellation -->
      <div class="workspace-greeting-container" style="margin-bottom: 32px; padding: 24px 32px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); background-color: rgba(255,255,255,0.01); display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden;">
        <!-- Constellation SVG background -->
        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; opacity: 0.35;" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <!-- Constellation lines -->
          <line x1="120" y1="18" x2="190" y2="45" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
          <line x1="190" y1="45" x2="280" y2="28" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
          <line x1="280" y1="28" x2="360" y2="60" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          <line x1="420" y1="15" x2="360" y2="60" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
          <line x1="520" y1="35" x2="420" y2="15" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          <line x1="580" y1="55" x2="520" y2="35" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          <line x1="190" y1="45" x2="220" y2="80" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
          <!-- Constellation stars -->
          <circle cx="120" cy="18" r="1.5" fill="rgba(96,197,250,0.7)"/>
          <circle cx="190" cy="45" r="2" fill="rgba(255,255,255,0.6)"/>
          <circle cx="280" cy="28" r="1.5" fill="rgba(214,156,252,0.7)"/>
          <circle cx="360" cy="60" r="1" fill="rgba(255,255,255,0.5)"/>
          <circle cx="420" cy="15" r="2" fill="rgba(82,226,178,0.7)"/>
          <circle cx="520" cy="35" r="1.5" fill="rgba(255,255,255,0.5)"/>
          <circle cx="580" cy="55" r="1" fill="rgba(96,197,250,0.6)"/>
          <circle cx="220" cy="80" r="1" fill="rgba(249,115,22,0.5)"/>
          <circle cx="65" cy="60" r="1" fill="rgba(255,255,255,0.3)"/>
          <circle cx="640" cy="25" r="1" fill="rgba(214,156,252,0.4)"/>
          <circle cx="700" cy="70" r="1.5" fill="rgba(255,255,255,0.3)"/>
        </svg>
        <div style="position: absolute; top: -50%; left: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%); pointer-events: none; z-index: 1;"></div>
        <div style="position: absolute; bottom: -50%; right: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%); pointer-events: none; z-index: 1;"></div>
        
        <div style="position: relative; z-index: 2;">
          <h1 style="font-size: 32px; font-weight: 200; margin-bottom: 8px; color: #FFF; letter-spacing: -0.8px;">
            Good ${timeOfDayGreeting()}, <span style="font-weight: 400; text-shadow: 0 0 10px rgba(255,255,255,0.2);">${profile.name}</span>.
          </h1>
          <p style="color: var(--text-muted); font-size: 15px;">Here is what is happening across your design spaces today.</p>
        </div>
        
        <div class="greeting-date" style="position: relative; z-index: 2; text-align: right; border-left: 1px solid var(--border-color); padding-left: 24px;">
          <div style="font-family: var(--font-heading); font-size: 22px; color: #FFF; font-weight: 200;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Studio Status: Active</div>
        </div>
      </div>

      <!-- Gamified Streaks Block -->
      <div class="gamified-stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <div class="gamified-card streak" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.02); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;">
          <div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(249,115,22,0.3));">⚡</div>
          <div>
            <div style="font-size: 10px; color: #F97316; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Creative Streak</div>
            <div style="font-size: 15px; font-weight: 700; color: #FFF; margin-top: 2px;">5 Days of Progress</div>
          </div>
        </div>
        
        <div class="gamified-card speed" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.02); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;">
          <div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(59,130,246,0.3));">🚀</div>
          <div>
            <div style="font-size: 10px; color: #60A5FA; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Invoicing Speed</div>
            <div style="font-size: 15px; font-weight: 700; color: #FFF; margin-top: 2px;">Lightning Fast ⚡</div>
          </div>
        </div>

        <div class="gamified-card harmony" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.02); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;">
          <div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(16,185,129,0.3));">🤝</div>
          <div>
            <div style="font-size: 10px; color: #34D399; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Client Harmony</div>
            <div style="font-size: 15px; font-weight: 700; color: #FFF; margin-top: 2px;">Outstanding 💎</div>
          </div>
        </div>
      </div>

      <!-- Overview Stats Grid -->
      <div class="dashboard-stats">
        <div class="stat-card">
          <span class="stat-label">Active Projects</span>
          <span class="stat-value" id="dash-stat-active" data-count="${activeProjects.length}">0</span>
          <div class="stat-change positive"><span class="stat-change-icon">✓</span> Delivering in progress</div>
          <div class="stat-card-badge" style="background-color: var(--unicorn-bg);">🚀</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Negotiations</span>
          <span class="stat-value" id="dash-stat-nego" data-count="${negotiatingProjects.length}">0</span>
          <div class="stat-change" style="color: var(--text-muted);"><span class="stat-change-icon">⌛</span> Awaiting proposal signatures</div>
          <div class="stat-card-badge" style="background-color: var(--swiss-bg);">🤝</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Revenue</span>
          <span class="stat-value" id="dash-stat-revenue" data-count="${totalRevenue}" style="color: var(--color-success);">0</span>
          <div class="stat-change positive"><span class="stat-change-icon">💸</span> Received payment funds</div>
          <div class="stat-card-badge" style="background-color: var(--unicorn-bg);">💰</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Clients Listed</span>
          <span class="stat-value" id="dash-stat-clients" data-count="${clients.length}">0</span>
          <div class="stat-change" style="color: var(--text-muted);"><span class="stat-change-icon">👥</span> Active partnerships</div>
          <div class="stat-card-badge" style="background-color: var(--tech-bg);">👥</div>
        </div>
      </div>

      <!-- Revenue Analytics Chart Card -->
      <div class="detail-card" style="margin-bottom: 32px; padding: 24px;">
        <div class="detail-card-title" style="margin-bottom: 20px; border-bottom: none; padding-bottom: 0;">
          <span>Monthly Revenue Analytics (Paid Invoices)</span>
          <div style="font-size: 11px; color: var(--text-muted); font-weight: normal; text-transform: none; letter-spacing: 0;">Month-over-Month Growth</div>
        </div>
        
        <div style="width: 100%; height: 130px; position: relative;">
          ${svgChartHtml}
        </div>
      </div>

      <!-- Dashboard Sections layout -->
      <div class="dashboard-main-layout">
        
        <!-- Active Projects List -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="detail-card">
            <div class="detail-card-title">
              <span>Active Design Spaces</span>
              <button class="btn btn-secondary" id="dash-view-all-projects-btn" style="font-size: 11px; padding: 6px 12px;">Manage Board</button>
            </div>
            
            ${activeProjects.length === 0 ? '<p style="color: var(--text-muted); text-align: center; padding: 24px;">No active projects. Open Projects Board to create one!</p>' : ''}
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${activeProjects.map(p => {
                const client = clients.find(c => c.id === p.clientId) || { name: 'Client' };
                let totalItems = 0;
                let doneItems = 0;
                p.timeline.phases.forEach(ph => {
                  ph.checklist.forEach(it => {
                    totalItems++;
                    if (it.done) doneItems++;
                  });
                });
                const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
                return `
                  <div class="doc-item dash-proj-item" data-id="${p.id}" style="padding: 16px; display: flex; gap: 14px; cursor: pointer; flex-direction: row; align-items: center;">
                    <img src="${p.coverUrl}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color); flex-shrink: 0;" />
                    <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0; gap: 4px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                        <strong style="font-size: 13px; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
                        <span class="status-badge ${p.category === 'Web Design' ? 'unicorn' : (p.category === 'Branding' ? 'swiss' : 'tech')}" style="font-size: 8px; padding: 1px 6px; white-space: nowrap;">${p.timeline.currentPhase} Phase</span>
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">Client: ${client.name} | Category: ${p.category}</div>
                      <div>
                        <div class="progress-container">
                          <div class="progress-bar" style="width: ${percent}%;"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Recent Saved Assets -->
          <div class="detail-card">
            <div class="detail-card-title">Recent Workspace Assets</div>
            
            ${displayAssets.length === 0 ? '<p style="color: var(--text-muted); text-align: center; padding: 12px;">No assets logged yet.</p>' : ''}
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${displayAssets.map(asset => {
                const themeClass = asset.type === 'AI Prompt' ? 'unicorn' : (asset.type === 'Bookmark Link' ? 'swiss' : 'tech');
                const escapedValue = (asset.value || '').replace(/"/g, '&quot;');
                return `
                  <div class="doc-item dash-asset-item" data-type="${asset.type}" data-value="${escapedValue}" style="padding: 10px 12px;">
                    <div style="overflow: hidden; padding-right: 12px; pointer-events: none;">
                      <strong style="font-size: 13px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.title}</strong>
                      <span style="font-size: 11px; color: var(--text-muted);">${asset.client} — ${asset.project}</span>
                    </div>
                    <span class="status-badge ${themeClass}" style="flex-shrink: 0; font-size: 9px; padding: 2px 8px; pointer-events: none;">
                      ${asset.type === 'AI Prompt' ? 'AI PROMPT' : (asset.type === 'Bookmark Link' ? 'BOOKMARK LINK' : asset.type)}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines & Schedule -->
        <div class="detail-sidebar">
          <div class="detail-card">
            <div class="detail-card-title">Upcoming Target Milestones</div>
            
            ${upcomingDeadlines.length === 0 ? '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No deadlines pending.</p>' : ''}
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${upcomingDeadlines.map(dl => {
                const dateObj = new Date(dl.dueDate);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('default', { month: 'short' });
                return `
                  <div style="display: flex; gap: 16px; align-items: center;">
                    <div style="width: 50px; height: 50px; background-color: var(--swiss-bg); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--swiss-text); flex-shrink: 0; border: 1px solid var(--swiss-border);">
                      <span style="font-size: 11px; font-weight: 600; text-transform: uppercase;">${month}</span>
                      <span style="font-size: 18px; font-weight: 700; line-height: 1.1;">${day}</span>
                    </div>
                    <div style="overflow: hidden;">
                      <strong style="font-size: 13px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dl.title}</strong>
                      <span style="font-size: 11px; color: var(--text-muted); display: block;">Client: ${dl.client}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </div>
    `;

    // Bind event handlers
    const manageBtn = document.getElementById('dash-view-all-projects-btn');
    if (manageBtn) {
      manageBtn.addEventListener('click', () => {
        document.querySelector('.nav-item[data-view="projects"]').click();
      });
    }

    const dashProjItems = container.querySelectorAll('.dash-proj-item');
    dashProjItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        document.querySelector('.nav-item[data-view="projects"]').click();
        ProjectsView.viewProjectDetail(id);
      });
    });

    const dashAssetItems = container.querySelectorAll('.dash-asset-item');
    dashAssetItems.forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type;
        const val = item.dataset.value;
        if (type === 'Bookmark Link') {
          let url = val;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          window.open(url, '_blank');
          window.showToast("Opening link in new tab...");
        } else if (type === 'AI Prompt') {
          navigator.clipboard.writeText(val).then(() => {
            window.showToast("AI Prompt copied to clipboard!");
          }).catch(err => {
            console.error("Failed to copy text: ", err);
            window.showToast("Failed to copy, check console");
          });
        }
      });
    });

    // Trigger stat counter animations with stagger
    const statAnimations = [
      { id: 'dash-stat-active',  val: activeProjects.length,          delay: 0,   prefix: '',                                       suffix: '' },
      { id: 'dash-stat-nego',    val: negotiatingProjects.length,      delay: 80,  prefix: '',                                       suffix: '' },
      { id: 'dash-stat-revenue', val: totalRevenue,                    delay: 160, prefix: window.getWorkspaceCurrencySymbol(),       suffix: '' },
      { id: 'dash-stat-clients', val: clients.length,                  delay: 240, prefix: '',                                       suffix: '' },
    ];
    statAnimations.forEach(({ id, val, delay, prefix, suffix }) => {
      const el = document.getElementById(id);
      if (el) {
        el.dataset.prefix = prefix;
        el.dataset.suffix = suffix;
        setTimeout(() => window.animateCounter(el, val, 900), delay);
      }
    });
  }
};


// Global Custom Dropdown Modernization Utility
window.modernizeSelects = () => {
  // Find all select elements that haven't been modernized yet
  const selects = document.querySelectorAll('select:not(.custom-dropdown-hidden)');
  selects.forEach(select => {
    // Clean up any previously created custom dropdown next to this select to avoid duplicates
    let sibling = select.nextSibling;
    while (sibling) {
      if (sibling.classList && sibling.classList.contains('custom-dropdown')) {
        sibling.remove();
        break;
      }
      sibling = sibling.nextSibling;
    }

    // Hide original select element
    select.classList.add('custom-dropdown-hidden');
    select.style.display = 'none';

    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown';
    if (select.id) wrapper.id = 'custom-' + select.id;
    if (select.classList.contains('phase-status-select')) {
      wrapper.style.width = '110px';
    } else if (select.style.width) {
      wrapper.style.width = select.style.width;
    }

    // Create trigger box
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    if (select.classList.contains('phase-status-select')) {
      trigger.classList.add('phase-status-trigger');
    }
    
    const selectedOpt = select.options[select.selectedIndex] || select.options[0];
    wrapper.setAttribute('data-value', selectedOpt ? selectedOpt.value : '');
    
    const triggerText = document.createElement('span');
    triggerText.innerText = selectedOpt ? selectedOpt.text : 'Select...';
    trigger.appendChild(triggerText);

    // Add chevron SVG indicator
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />`;
    trigger.appendChild(svg);

    wrapper.appendChild(trigger);

    // Create tray container
    const tray = document.createElement('div');
    tray.className = 'custom-dropdown-tray';
    if (select.classList.contains('phase-status-select')) {
      tray.classList.add('phase-status-tray');
    }

    // Build options
    Array.from(select.options).forEach(opt => {
      const option = document.createElement('div');
      option.className = 'custom-dropdown-option';
      if (opt.selected) option.classList.add('selected');
      option.dataset.value = opt.value;
      option.innerText = opt.text;

      // Handle item click
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        triggerText.innerText = opt.text;
        wrapper.setAttribute('data-value', opt.value);
        wrapper.classList.remove('active');

        // Toggle selected styling
        tray.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        // Fire change event to keep native code logic in sync
        select.dispatchEvent(new Event('change'));
      });

      tray.appendChild(option);
    });

    wrapper.appendChild(tray);

    // Insert next to original element
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    // Toggle dropdown open/close
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-dropdown').forEach(d => {
        if (d !== wrapper) d.classList.remove('active');
      });
      wrapper.classList.toggle('active');
    });
  });
};

// Close all custom dropdown trays when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
});

App.init();
