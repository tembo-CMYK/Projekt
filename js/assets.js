// js/assets.js

import { AppDB } from './db.js';

export const AssetsView = {
  activeTypeFilter: 'All', // All, prompt, link, image
  searchQuery: '',
  activeSort: 'Newest', // Newest, Title

  renderPanel(container) {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h1>Standard Asset Library</h1>
          <p>Store, search, and retrieve design inspirations, AI prompts, visual reference images, and bookmarks.</p>
        </div>
        <button class="header-btn" id="library-new-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add to Library
        </button>
      </div>

      <!-- Controls & Search Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; gap: 12px; align-items: center; flex-grow: 1; max-width: 480px;">
          <div class="header-search" style="width: 100%; max-width: 320px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
            <input type="text" id="library-search-input" placeholder="Search inspiration library..." />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="form-label" style="font-size: 9px; white-space: nowrap;">Sort By</span>
            <select id="library-sort-select" style="width: 140px; padding: 4px 8px; font-size: 11px;">
              <option value="Newest">Newest Added</option>
              <option value="Title">Title A-Z</option>
            </select>
          </div>
        </div>

        <!-- sliding pill type filters -->
        <div class="tab-filters" id="library-type-filters">
          <div class="tab-slider-pill" id="library-type-pill"></div>
          <button class="filter-tab ${this.activeTypeFilter === 'All' ? 'active' : ''}" data-type="All">All Assets</button>
          <button class="filter-tab ${this.activeTypeFilter === 'prompt' ? 'active' : ''}" data-type="prompt">AI Prompts</button>
          <button class="filter-tab ${this.activeTypeFilter === 'link' ? 'active' : ''}" data-type="link">Bookmarks</button>
          <button class="filter-tab ${this.activeTypeFilter === 'image' ? 'active' : ''}" data-type="image">Images</button>
        </div>
      </div>

      <!-- Assets Responsive Grid -->
      <div class="assets-library-grid" id="library-grid-container">
        <!-- Rendered via JS -->
      </div>
    `;

    this.renderGrid();
    this.bindEvents();
    setTimeout(() => this.updateTabSlider(), 50);
  },

  renderGrid() {
    const assets = AppDB.getLibraryAssets();
    const gridContainer = document.getElementById('library-grid-container');
    if (!gridContainer) return;

    // 1. Filter by category type
    let filtered = assets;
    if (this.activeTypeFilter !== 'All') {
      filtered = filtered.filter(a => a.type === this.activeTypeFilter);
    }

    // 2. Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.value.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    if (this.activeSort === 'Newest') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    } else if (this.activeSort === 'Title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background-color: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color); color: var(--text-muted);">
          No inspiration assets found matching your criteria.
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered.map(asset => {
      // Define actions and formats based on type
      if (asset.type === 'prompt') {
        return `
          <div class="detail-card asset-lib-card prompt-lib-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <button class="lib-delete-btn" data-id="${asset.id}" title="Remove from Library">&times;</button>
            <div>
              <div style="font-size: 8px; color: var(--unicorn-text); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 6px;">AI Prompt</div>
              <h3 style="font-size: 14px; font-weight: 500; color: #FFF; margin-bottom: 8px;">${asset.title}</h3>
              <div style="font-family: monospace; font-size: 11px; background-color: rgba(0,0,0,0.15); border: 1px solid var(--border-color); padding: 8px; border-radius: var(--radius-sm); color: var(--unicorn-text); line-height: 1.5; max-height: 100px; overflow-y: auto; word-break: break-word;">
                ${asset.value}
              </div>
            </div>
            <button class="btn btn-primary copy-btn" data-text="${asset.value.replace(/"/g, '&quot;')}" style="margin-top: 14px; width: 100%;">
              Copy Prompt
            </button>
          </div>
        `;
      } else if (asset.type === 'link') {
        // Parse host for clean display
        let cleanUrl = asset.value;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        let hostname = 'Website Link';
        try {
          hostname = new URL(cleanUrl).hostname;
        } catch(e) {}

        return `
          <div class="detail-card asset-lib-card link-lib-card" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <button class="lib-delete-btn" data-id="${asset.id}" title="Remove from Library">&times;</button>
            <div>
              <div style="font-size: 8px; color: var(--swiss-text); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 6px;">Bookmark Link</div>
              <h3 style="font-size: 14px; font-weight: 500; color: #FFF; margin-bottom: 4px;">${asset.title}</h3>
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                Source: <span style="color: var(--swiss-text);">${hostname}</span>
              </div>
            </div>
            <a href="${cleanUrl}" target="_blank" class="btn btn-secondary" style="width: 100%; border-color: var(--swiss-border); color: var(--swiss-text); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 12px; height: 12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              Open Bookmark
            </a>
          </div>
        `;
      } else if (asset.type === 'image') {
        return `
          <div class="detail-card asset-lib-card image-lib-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <button class="lib-delete-btn" data-id="${asset.id}" style="background-color: rgba(0,0,0,0.5); z-index: 10;" title="Remove from Library">&times;</button>
            <div class="image-lib-thumb-wrapper" style="width: 100%; height: 120px; overflow: hidden; cursor: pointer; border-bottom: 1px solid var(--border-color);">
              <img src="${asset.value}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'" />
            </div>
            <div style="padding: 12px;">
              <div style="font-size: 8px; color: var(--tech-text); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;">Inspiration Image</div>
              <h3 style="font-size: 13px; font-weight: 500; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.title}</h3>
            </div>
          </div>
        `;
      }
      return '';
    }).join('');

    this.bindGridInteractions();
  },

  bindEvents() {
    // Add New Asset Button
    const addBtn = document.getElementById('library-new-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddAssetModal());
    }

    // Search Input key listener
    const searchInput = document.getElementById('library-search-input');
    if (searchInput) {
      searchInput.value = this.searchQuery;
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderGrid();
      });
    }

    // Sort select listener
    const sortSelect = document.getElementById('library-sort-select');
    if (sortSelect) {
      sortSelect.value = this.activeSort;
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderGrid();
      });
    }

    // Filter categories click
    const filterTabs = document.querySelectorAll('#library-type-filters .filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTypeFilter = tab.dataset.type;
        this.renderGrid();
        this.updateTabSlider();
      });
    });
  },

  updateTabSlider() {
    const container = document.getElementById('library-type-filters');
    if (!container) return;
    const activeTab = container.querySelector('.filter-tab.active');
    const pill = document.getElementById('library-type-pill');
    if (activeTab && pill) {
      pill.style.width = `${activeTab.offsetWidth}px`;
      pill.style.left = `${activeTab.offsetLeft}px`;
    }
  },

  bindGridInteractions() {
    const grid = document.getElementById('library-grid-container');
    if (!grid) return;

    // Prompt copy buttons
    grid.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
          btn.innerText = 'Copied!';
          window.showToast("Prompt copied to clipboard!");
          setTimeout(() => btn.innerText = 'Copy Prompt', 1500);
        });
      });
    });

    // Image lightbox click
    grid.querySelectorAll('.image-lib-thumb-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const img = wrapper.querySelector('img');
        const url = img.src;
        const title = wrapper.parentElement.querySelector('h3').innerText;

        const modal = document.getElementById('universal-modal');
        const mTitle = document.getElementById('modal-title');
        const mBody = document.getElementById('modal-body');
        const mFooter = document.getElementById('modal-footer');

        mTitle.innerText = title;
        mBody.innerHTML = `<img src="${url}" style="width:100%; border-radius: var(--radius-md);" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'" />`;
        mFooter.innerHTML = `
          <button id="modal-download-btn" class="btn btn-secondary" style="border-color: var(--swiss-border); color: var(--swiss-text); display: inline-flex; align-items: center; gap: 6px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 12px; height: 12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Download
          </button>
          <button class="btn btn-primary" id="modal-close-btn">Close</button>
        `;

        modal.classList.add('active');
        document.getElementById('modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));

        const downloadBtn = document.getElementById('modal-download-btn');
        downloadBtn.addEventListener('click', async () => {
          downloadBtn.innerText = 'Downloading...';
          downloadBtn.disabled = true;
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : 'download.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            console.error(e);
            window.open(url, '_blank');
          } finally {
            downloadBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 12px; height: 12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Download
            `;
            downloadBtn.disabled = false;
          }
        });
      });
    });

    // Hover scale thumbnail logic
    grid.querySelectorAll('.image-lib-thumb-wrapper').forEach(wrapper => {
      const img = wrapper.querySelector('img');
      wrapper.addEventListener('mouseenter', () => img.style.transform = 'scale(1.04)');
      wrapper.addEventListener('mouseleave', () => img.style.transform = 'scale(1.00)');
    });

    // Delete item click
    grid.querySelectorAll('.lib-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const cardTitle = btn.parentElement.querySelector('h3').innerText;
        
        if (confirm(`Remove "${cardTitle}" from your asset library?`)) {
          AppDB.deleteLibraryAsset(id);
          window.showToast("Asset deleted from library.");
          this.renderGrid();
        }
      });
    });
  },

  showAddAssetModal() {
    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.innerText = 'Add Inspiration to Library';

    body.innerHTML = `
      <form id="new-library-asset-form">
        <div class="form-group">
          <label class="form-label">Asset Type</label>
          <select class="form-input" id="lib-asset-type-select" required>
            <option value="prompt">AI Prompt (Unicorn mint theme)</option>
            <option value="link">Bookmark Link (Switzerland lavender theme)</option>
            <option value="image">Reference Image (Technical Founder sky blue theme)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Title / Label</label>
          <input type="text" class="form-input" id="lib-asset-title" placeholder="e.g. Neo-Brutalist Layout Ideas" required />
        </div>
        
        <!-- Contextual field changes based on select -->
        <div class="form-group" id="lib-asset-value-group">
          <label class="form-label" id="lib-asset-value-label">Prompt Content</label>
          <textarea class="form-input" id="lib-asset-value" style="height: 120px;" placeholder="Enter asset content..." required></textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
      <button class="btn btn-primary" id="modal-submit-lib-asset-btn">Save to Library</button>
    `;

    modal.classList.add('active');

    // Trigger select modernization
    window.modernizeSelects();

    // Toggle label/placeholder according to chosen type
    const typeSelect = document.getElementById('lib-asset-type-select');
    const valueLabel = document.getElementById('lib-asset-value-label');
    const valueInput = document.getElementById('lib-asset-value');

    const updateFields = () => {
      const type = typeSelect.value;
      if (type === 'prompt') {
        valueLabel.innerText = 'Prompt Content';
        valueInput.placeholder = 'Paste prompt templates here...';
        valueInput.value = '';
      } else if (type === 'link') {
        valueLabel.innerText = 'URL Address';
        valueInput.placeholder = 'https://...';
        valueInput.value = '';
      } else if (type === 'image') {
        valueLabel.innerText = 'Image Path or Web Link';
        valueInput.placeholder = 'Paste local visual/Unsplash URL...';
        valueInput.value = '';
      }
    };

    typeSelect.addEventListener('change', updateFields);

    const close = () => modal.classList.remove('active');
    document.getElementById('modal-cancel-btn').addEventListener('click', close);

    document.getElementById('modal-submit-lib-asset-btn').addEventListener('click', () => {
      const form = document.getElementById('new-library-asset-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const aType = typeSelect.value;
      const aTitle = document.getElementById('lib-asset-title').value.trim();
      const aVal = valueInput.value.trim();

      AppDB.addLibraryAsset(aType, aTitle, aVal);
      close();
      window.showToast(`Saved "${aTitle}" to your Standard Library.`);
      this.renderGrid();
    });
  }
};
