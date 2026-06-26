// js/projects.js

import { AppDB, CATEGORY_THEMES } from './db.js';
import { FinanceView } from './finance.js';

export const ProjectsView = {
  activeStatusFilter: 'Active', // Active, Negotiating, Archived, All
  activeCategoryFilter: 'All',  // All, Web Design, Branding, General Designs

  renderPanel(container) {
    const projects = AppDB.getProjects();
    const clients = AppDB.getClients();
 
    // Filters UI
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h1>Projects Board</h1>
          <p>Track project timelines, processes, creative briefs, assets, and invoices.</p>
        </div>
        <button class="header-btn" id="project-new-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Project
        </button>
      </div>
 
      <!-- Tab Status Filters -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; flex-wrap: wrap; gap: 16px;">
        <div class="tab-filters" id="project-status-filters">
          <div class="tab-slider-pill" id="project-status-pill"></div>
          <button class="filter-tab ${this.activeStatusFilter === 'Active' ? 'active' : ''}" data-status="Active">Active</button>
          <button class="filter-tab ${this.activeStatusFilter === 'Negotiating' ? 'active' : ''}" data-status="Negotiating">Negotiating</button>
          <button class="filter-tab ${this.activeStatusFilter === 'Archived' ? 'active' : ''}" data-status="Archived">Archived</button>
          <button class="filter-tab ${this.activeStatusFilter === 'All' ? 'active' : ''}" data-status="All">All Projects</button>
        </div>
      </div>
 
      <!-- Category Filter Tags -->
      <div class="category-filters">
        <button class="category-tab ${this.activeCategoryFilter === 'All' ? 'active' : ''}" data-category="All">All Categories</button>
        <button class="category-tab ${this.activeCategoryFilter === 'Web Design' ? 'active' : ''}" data-category="Web Design">Web Design</button>
        <button class="category-tab ${this.activeCategoryFilter === 'Branding' ? 'active' : ''}" data-category="Branding">Branding</button>
        <button class="category-tab ${this.activeCategoryFilter === 'General Designs' ? 'active' : ''}" data-category="General Designs">General Designs</button>
      </div>
 
      <!-- Cards Grid -->
      <div class="projects-grid" id="projects-grid-container">
        <!-- Rendered via JS -->
      </div>
    `;
 
    this.renderGrid();
    this.bindGridEvents();
    setTimeout(() => this.updateTabSlider(), 50);
  },

  renderGrid() {
    const projects = AppDB.getProjects();
    const clients = AppDB.getClients();
    const gridContainer = document.getElementById('projects-grid-container');

    // Filter project list
    let filtered = projects;
    if (this.activeStatusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === this.activeStatusFilter);
    }
    if (this.activeCategoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === this.activeCategoryFilter);
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </div>
          <h3>No Projects Found</h3>
          <p>No projects match your current filter. Try a different status or category, or kick off a new project.</p>
          <button class="btn btn-primary" id="empty-state-new-proj-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Project
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById('empty-state-new-proj-btn');
      if (emptyBtn) emptyBtn.addEventListener('click', () => this.showNewProjectModal());
      return;
    }

    gridContainer.innerHTML = filtered.map(proj => {
      const client = clients.find(c => c.id === proj.clientId) || { name: 'Unknown Client' };
      const theme = CATEGORY_THEMES[proj.category] || { class: 'tech' };
      
      // Compile step elements matching the reference card vertical diagram
      let firstPendingRendered = false;
      const stepElements = proj.timeline.phases.map((ph, idx) => {
        let statusClass = 'pending';
        let desc = 'Awaiting stage';
        
        if (ph.status === 'Completed') {
          statusClass = 'completed';
          desc = ph.completedDate ? `Completed on ${ph.completedDate}` : 'Phase finalized';
        } else if (ph.status === 'In Progress') {
          statusClass = 'active';
          const nextTask = ph.checklist.find(t => !t.done);
          desc = nextTask ? `Next: ${nextTask.text}` : 'In progress';
        }
        
        // Render completed, active, and first pending stage to match reference card density
        if (ph.status === 'Completed' || ph.status === 'In Progress' || (!firstPendingRendered && ph.status === 'Pending')) {
          if (ph.status === 'Pending') firstPendingRendered = true;
          
          if (ph.status === 'In Progress') {
            const incompleteTasks = ph.checklist.filter(t => !t.done);
            return `
              <div class="workflow-step active">
                <span class="workflow-step-node"></span>
                <div class="workflow-step-info">
                  <span class="workflow-step-name">${ph.name} <span class="workflow-step-badge">Active</span></span>
                  <span class="workflow-step-desc">${desc}</span>
                </div>
              </div>
              ${incompleteTasks.length > 0 ? `
                <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0 4px 4px; z-index: 2;">
                  <span class="workflow-step-diamond"></span>
                  <span class="workflow-step-label">checklist</span>
                </div>
                <div class="workflow-step-branch">
                  ${incompleteTasks.slice(0, 2).map(task => `
                    <div class="workflow-step" style="margin-bottom: 4px;">
                      <span class="workflow-step-node" style="width: 6px; height: 6px; margin-top: 5px; border-color: rgba(255,255,255,0.1);"></span>
                      <div class="workflow-step-info">
                        <span class="workflow-step-name" style="font-size: 10px; color: var(--text-muted); font-weight: 400;">${task.text}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            `;
          } else {
            return `
              <div class="workflow-step ${statusClass}">
                <span class="workflow-step-node"></span>
                <div class="workflow-step-info">
                  <span class="workflow-step-name">${ph.name}</span>
                  <span class="workflow-step-desc">${desc}</span>
                </div>
              </div>
            `;
          }
        }
        return '';
      }).filter(el => el !== '').join('');

      return `
        <div class="project-card" data-id="${proj.id}" data-category="${proj.category}">
          <div class="project-card-cover-container">
            <img src="${proj.coverUrl}" class="project-card-cover" alt="${proj.title}" />
          </div>
          <div class="project-card-header">
            <div class="client-tag">
              <div class="client-logo">${client.name.charAt(0)}</div>
              <div class="profile-info">
                <span class="client-name">${client.name}</span>
                <span class="client-date">${proj.startDate}</span>
              </div>
            </div>
            <span class="status-badge ${proj.status.toLowerCase()}">${proj.status}</span>
          </div>
          
          <h3 class="project-card-title">${proj.title}</h3>
          
          <div class="project-card-body-text">
            <strong>${proj.category}.</strong> ${proj.brief.length > 90 ? proj.brief.substring(0, 90) + '...' : proj.brief}
          </div>

          <div class="project-card-tags">
            <span class="tag-category ${theme.class}">${proj.category}</span>
            <span class="tag-tool">Figma</span>
          </div>

          <div class="workflow-diagram">
            <div class="workflow-line-connector"></div>
            ${stepElements}
          </div>

          <div class="project-card-meta-row">
            <span>Budget: <strong>$${proj.budget.toLocaleString()}</strong></span>
            <span>Due: <strong>${proj.dueDate}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    // Bind project card click
    const cards = gridContainer.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.viewProjectDetail(id);
      });
    });
  },

  bindGridEvents() {
    // New Project Button
    const newProjBtn = document.getElementById('project-new-btn');
    if (newProjBtn) {
      newProjBtn.addEventListener('click', () => this.showNewProjectModal());
    }

    // Status Tab Switches
    const statusTabs = document.querySelectorAll('.filter-tab');
    statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeStatusFilter = tab.dataset.status;
        this.renderGrid();
        this.updateTabSlider();
      });
    });

    // Category Tab Switches
    const catTabs = document.querySelectorAll('.category-tab');
    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategoryFilter = tab.dataset.category;
        this.renderGrid();
      });
    });
  },

  updateTabSlider() {
    const container = document.getElementById('project-status-filters');
    if (!container) return;
    const activeTab = container.querySelector('.filter-tab.active');
    const pill = document.getElementById('project-status-pill');
    if (activeTab && pill) {
      pill.style.width = `${activeTab.offsetWidth}px`;
      pill.style.left = `${activeTab.offsetLeft}px`;
    }
  },

  showNewProjectModal() {
    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.innerText = 'Create New Project Space';

    const clients = AppDB.getClients();
    const clientOptions = clients.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');

    body.innerHTML = `
      <form id="new-project-form">
        <div class="form-group">
          <label class="form-label">Project Title</label>
          <input type="text" class="form-input" id="proj-title-input" placeholder="e.g. Portfolio Redesign" required />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-input" id="proj-category-select" required>
            <option value="Web Design">Web Design (Ex-Unicorn mint theme)</option>
            <option value="Branding">Branding (Switzerland lavender theme)</option>
            <option value="General Designs">General Designs (Technical Founder sky blue theme)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Assign Client</label>
          <select class="form-input" id="proj-client-select" required>
            ${clientOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Budget ($)</label>
          <input type="number" class="form-input" id="proj-budget-input" min="0" placeholder="e.g. 5000" required />
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="date" class="form-input" id="proj-due-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Project Brief / Objective</label>
          <textarea class="form-input" id="proj-brief-input" style="height: 100px;" placeholder="Define the primary design scope..."></textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
      <button class="btn btn-primary" id="modal-submit-project-btn">Launch Space</button>
    `;

    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modal-cancel-btn').addEventListener('click', close);

    document.getElementById('modal-submit-project-btn').addEventListener('click', () => {
      const form = document.getElementById('new-project-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const pTitle = document.getElementById('proj-title-input').value;
      const pCat = document.getElementById('proj-category-select').value;
      const pClient = document.getElementById('proj-client-select').value;
      const pBudget = document.getElementById('proj-budget-input').value;
      const pDue = document.getElementById('proj-due-input').value;
      const pBrief = document.getElementById('proj-brief-input').value;

      AppDB.createProject(pTitle, pCat, pClient, pBudget, pDue, pBrief);
      close();
      window.showToast(`Project "${pTitle}" space has been launched!`);
      this.renderPanel(document.getElementById('view-projects'));
    });
  },

  viewProjectDetail(id) {
    const container = document.getElementById('view-projects');
    
    // Inject loader
    container.innerHTML = `<div style="text-align:center; padding: 48px; color: var(--text-muted);">Loading space...</div>`;
    
    // Attach function to window so we can trigger it from elsewhere
    window.loadProjectDetail = (projId) => {
      const proj = AppDB.getProjectById(projId);
      if (!proj) return;
      const client = AppDB.getClientById(proj.clientId) || { name: 'Unknown Client' };
      const theme = CATEGORY_THEMES[proj.category] || { class: 'tech' };

      // Calculate progress percentage
      let totalChecklistItems = 0;
      let completedChecklistItems = 0;
      proj.timeline.phases.forEach(ph => {
        ph.checklist.forEach(cl => {
          totalChecklistItems++;
          if (cl.done) completedChecklistItems++;
        });
      });
      const progressPercent = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

      // Instalment tracker calculations
      const invoicesList = proj.invoices || [];
      const totalPaid = invoicesList
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.total, 0);
      const totalInvoiced = invoicesList
        .reduce((sum, inv) => sum + inv.total, 0);
      const remainingBalance = Math.max(0, proj.budget - totalInvoiced);
      const paidPercent = proj.budget > 0 ? Math.min(100, Math.round((totalPaid / proj.budget) * 100)) : 0;

      container.innerHTML = `
        <div class="back-bar" id="proj-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to board
        </div>

        <!-- Project Detail Header -->
        <div class="section-header" style="align-items: flex-start; margin-bottom: 24px;">
          <div class="section-title">
            <span class="tag-category ${theme.class}" style="display: inline-block; margin-bottom: 8px;">${proj.category}</span>
            <h1 style="font-size: 32px;">${proj.title}</h1>
            <p>Client: <strong style="color: var(--text-primary);">${client.name}</strong> | Start: ${proj.startDate} | Budget: ${window.getProjectCurrencySymbol(proj)}${proj.budget.toLocaleString()}</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary" id="project-client-portal-btn" style="padding: 8px 12px; display: inline-flex; align-items: center; gap: 4px; border-color: rgba(168, 85, 247, 0.4); color: var(--unicorn-text);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              Client View
            </button>
            <select class="form-input" id="detail-status-select" style="width: 140px; padding: 6px 10px; font-size: 13px;">
              <option value="Active" ${proj.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Negotiating" ${proj.status === 'Negotiating' ? 'selected' : ''}>Negotiating</option>
              <option value="Archived" ${proj.status === 'Archived' ? 'selected' : ''}>Archived</option>
            </select>
            <button class="btn btn-secondary" id="detail-delete-btn" style="color: var(--color-danger); border-color: var(--color-danger); padding: 8px 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
        </div>

        <!-- Brief & Payment Tracker Hero Grid -->
        <div class="top-brief-grid">
          
          <!-- Creative Brief Card (Save State & Edit Toggle) -->
          <div class="detail-card brief-card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
            <div>
              <div class="detail-card-title" style="margin-bottom: 12px; border-bottom: none; padding-bottom: 0;">
                <span>Creative Brief & Targets</span>
                <button class="btn btn-secondary" id="brief-edit-toggle-btn" style="font-size: 11px; padding: 6px 12px;">Edit Brief</button>
              </div>
              
              <!-- Display Mode -->
              <div id="brief-display-container" style="line-height: 1.6; font-size: 12px; color: #8F9CAE; padding: 6px 12px 6px 0; max-height: 130px; overflow-y: auto;">
                ${proj.brief ? proj.brief.replace(/\n/g, '<br/>') : '<em style="color: var(--text-muted);">No creative brief provided yet. Click Edit to define scope.</em>'}
              </div>
              
              <!-- Edit Mode -->
              <div id="brief-edit-container" style="display: none; flex-direction: column; gap: 8px; margin-top: 6px;">
                <textarea class="form-input" id="detail-brief-textarea" style="height: 100px; line-height: 1.5; font-family: var(--font-body); resize: vertical; font-size: 12px;">${proj.brief || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- Agreed Price & Payment Tracker Card -->
          <div class="detail-card finance-tracker-card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
            <div>
              <div class="detail-card-title" style="margin-bottom: 12px; border-bottom: none; padding-bottom: 0;">
                <span>Agreed Price & Instalment Tracker</span>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Mini Stats Row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div style="background-color: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-sm);">
                    <span class="form-label" style="font-size: 8px; color: var(--text-muted);">Agreed Price</span>
                    <div style="font-size: 16px; font-family: var(--font-heading); color: #FFF; margin-top: 2px;">${window.getProjectCurrencySymbol(proj)}${proj.budget.toLocaleString()}</div>
                  </div>
                  <div style="background-color: rgba(16, 185, 129, 0.02); border: 1px solid rgba(16, 185, 129, 0.15); padding: 8px 12px; border-radius: var(--radius-sm);">
                    <span class="form-label" style="font-size: 8px; color: var(--color-success);">Paid to Date</span>
                    <div style="font-size: 16px; font-family: var(--font-heading); color: var(--color-success); margin-top: 2px;">${window.getProjectCurrencySymbol(proj)}${totalPaid.toLocaleString()}</div>
                  </div>
                </div>

                <!-- Payment Progress Bar -->
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--text-muted); margin-bottom: 4px;">
                    <span>Payment Progress</span>
                    <span>${paidPercent}% Paid</span>
                  </div>
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${paidPercent}%;"></div>
                  </div>
                </div>

                <!-- Instalments List -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <span class="form-label" style="font-size: 8px; color: var(--text-muted);">Instalment Milestones</span>
                  
                  <div style="display: flex; flex-direction: column; gap: 6px; max-height: 95px; overflow-y: auto; padding-right: 12px;">
                    ${invoicesList.length === 0 ? '<div style="font-size: 10px; color: var(--text-muted); text-align: center; padding: 4px 0;">No invoice instalments logged.</div>' : ''}
                    
                    ${invoicesList.map(inv => {
                      let statusDotColor = 'var(--text-muted)';
                      let statusClassText = 'Draft';
                      if (inv.status === 'Paid') {
                        statusDotColor = 'var(--color-success)';
                        statusClassText = 'Paid';
                      } else if (inv.status === 'Sent') {
                        statusDotColor = 'var(--color-warning)';
                        statusClassText = 'Pending';
                      }
                      return `
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; padding: 5px 8px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: rgba(255,255,255,0.01);">
                          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                            <span style="width: 5px; height: 5px; border-radius: 50%; background-color: ${statusDotColor}; flex-shrink: 0;"></span>
                            <span style="color: #FFF; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${inv.invoiceNo} — ${inv.items[0]?.description || 'Milestone deliverable'}</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 8px;">
                            <strong>${window.getCurrencySymbol(inv.currency)}${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            <span style="font-size: 8px; text-transform: uppercase; color: ${statusDotColor};">${statusClassText}</span>
                          </div>
                        </div>
                      `;
                    }).join('')}

                    ${remainingBalance > 0 ? `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; padding: 5px 8px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); background-color: transparent;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="width: 5px; height: 5px; border-radius: 50%; background-color: var(--text-muted); flex-shrink: 0;"></span>
                          <span style="color: var(--text-muted);">Remaining Balance</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="color: var(--text-muted); font-weight: 500;">${window.getProjectCurrencySymbol(proj)}${remainingBalance.toLocaleString()}</span>
                          <span style="font-size: 8px; text-transform: uppercase; color: var(--text-muted);">Uninvoiced</span>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="project-detail-layout">
          <!-- MAIN (Timeline, Checklist, Logs) -->
          <div class="detail-main">
            
            <!-- Timeline Tracker Card -->
            <div class="detail-card">
              <div class="detail-card-title">
                <span>Timeline & Phases Tracker</span>
                <div style="font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                  <span>Global Progress:</span>
                  <strong style="color: var(--color-success);">${progressPercent}%</strong>
                </div>
              </div>
              <div class="progress-container" style="margin-bottom: 24px; height: 8px;">
                <div class="progress-bar" id="detail-progress-bar" style="width: ${progressPercent}%; height: 8px;"></div>
              </div>

              <div class="timeline-track">
                ${proj.timeline.phases.map((phase, pIdx) => {
                  const activeClass = proj.timeline.currentPhase === phase.name ? 'active' : '';
                  return `
                    <div class="timeline-phase ${phase.status} ${activeClass}" data-phase-name="${phase.name}">
                      <div class="phase-header">
                        <span class="phase-node"></span>
                        <span class="phase-name">${phase.name}</span>
                        <div style="display: flex; gap: 16px; align-items: center;">
                          <select class="phase-status-select" data-phase-idx="${pIdx}" style="padding: 2px 6px; font-size: 11px; width: 100px;">
                            <option value="Pending" ${phase.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${phase.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${phase.status === 'Completed' ? 'selected' : ''}>Completed</option>
                          </select>
                          <span class="phase-status-label">${phase.status}</span>
                        </div>
                      </div>
                      
                      <div class="phase-content" style="display: ${activeClass || phase.status === 'In Progress' ? 'block' : 'none'};">
                        <!-- Kanban Columns Board -->
                        <div class="kanban-board-container" style="margin: 16px 0;">
                          <div class="kanban-board-grid">
                            <!-- To Do lane -->
                            <div class="kanban-lane" data-status="todo" data-phase-idx="${pIdx}">
                              <div class="kanban-lane-header">To Do</div>
                              <div class="kanban-cards-slot">
                                ${phase.checklist.filter(it => (it.status || 'todo') === 'todo').map(item => `
                                  <div class="kanban-card" draggable="true" data-item-id="${item.id}" data-phase-idx="${pIdx}">
                                    <span>${item.text}</span>
                                    <span class="kanban-card-draghandle">::</span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                            <!-- In Progress lane -->
                            <div class="kanban-lane" data-status="progress" data-phase-idx="${pIdx}">
                              <div class="kanban-lane-header">In Progress</div>
                              <div class="kanban-cards-slot">
                                ${phase.checklist.filter(it => (it.status || 'todo') === 'progress').map(item => `
                                  <div class="kanban-card" draggable="true" data-item-id="${item.id}" data-phase-idx="${pIdx}">
                                    <span>${item.text}</span>
                                    <span class="kanban-card-draghandle">::</span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>

                            <!-- Done lane -->
                            <div class="kanban-lane" data-status="done" data-phase-idx="${pIdx}">
                              <div class="kanban-lane-header">Done</div>
                              <div class="kanban-cards-slot">
                                ${phase.checklist.filter(it => (it.status || 'todo') === 'done').map(item => `
                                  <div class="kanban-card" draggable="true" data-item-id="${item.id}" data-phase-idx="${pIdx}">
                                    <span>${item.text}</span>
                                    <span class="kanban-card-draghandle">✓</span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 14px;">
                          <input type="text" class="form-input add-task-input" placeholder="+ Add custom phase task..." style="font-size: 11px; padding: 4px 8px;" />
                          <button class="btn btn-secondary add-task-btn" data-phase-idx="${pIdx}" style="font-size: 11px; padding: 4px 10px;">Add</button>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Process Logs Card -->
            <div class="detail-card">
              <div class="detail-card-title">Process Record & Log History</div>
              <div class="log-list" id="detail-log-list">
                ${proj.logs.slice().reverse().map(log => `
                  <div class="log-item">
                    <div class="log-meta">
                      <span>${AppDB.getProfile().name}</span>
                      <span>${log.date}</span>
                    </div>
                    <div class="log-text">${log.text}</div>
                  </div>
                `).join('')}
              </div>
              <div style="display: flex; gap: 10px; margin-top: 20px;">
                <input type="text" class="form-input" id="log-message-input" placeholder="Log a process note... (e.g. Sent client high-fi wireframes)" />
                <button class="btn btn-primary" id="log-submit-btn">Log Note</button>
              </div>
            </div>

          </div>

          <!-- SIDEBAR (Assets, Invoices, Contracts) -->
          <div class="detail-sidebar">
            
            <!-- Asset Manager Card -->
            <div class="detail-card">
              <div class="detail-card-title">Asset Manager</div>
              <div class="asset-tabs">
                <span class="asset-tab-btn active" data-tab="prompts">Prompts</span>
                <span class="asset-tab-btn" data-tab="links">Links</span>
                <span class="asset-tab-btn" data-tab="images">Images</span>
              </div>

              <!-- Prompts Section -->
              <div class="asset-section" id="asset-sec-prompts">
                <div class="doc-list" style="gap: 8px;">
                  ${proj.assets.prompts.map(pr => `
                    <div class="prompt-card">
                      <div class="prompt-title">${pr.title}</div>
                      <div class="prompt-text">${pr.text}</div>
                      <button class="copy-btn" data-text="${pr.text.replace(/"/g, '&quot;')}">Copy Prompt</button>
                    </div>
                  `).join('')}
                </div>
                <div style="border-top: 1px solid var(--border-color); margin-top: 12px; padding-top: 12px;">
                  <input type="text" class="form-input" id="new-prompt-title" placeholder="Prompt Name" style="font-size: 11px; margin-bottom: 6px;" />
                  <textarea class="form-input" id="new-prompt-text" placeholder="Paste AI generator prompt text..." style="height: 60px; font-size: 11px; margin-bottom: 6px;"></textarea>
                  <button class="btn btn-secondary" id="add-prompt-btn" style="font-size: 11px; width: 100%;">Add AI Prompt</button>
                </div>
              </div>

              <!-- Links Section -->
              <div class="asset-section" id="asset-sec-links" style="display: none;">
                <div class="doc-list" style="gap: 8px;">
                  ${proj.assets.links.map(ln => `
                    <div class="link-item">
                      <div class="link-info">
                        <span class="link-title">${ln.title}</span>
                        <a href="${ln.url}" target="_blank" class="link-url">${ln.url}</a>
                      </div>
                      <a href="${ln.url}" target="_blank" class="link-go-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                      </a>
                    </div>
                  `).join('')}
                </div>
                <div style="border-top: 1px solid var(--border-color); margin-top: 12px; padding-top: 12px;">
                  <input type="text" class="form-input" id="new-link-title" placeholder="Link Name (e.g. Figma)" style="font-size: 11px; margin-bottom: 6px;" />
                  <input type="url" class="form-input" id="new-link-url" placeholder="https://" style="font-size: 11px; margin-bottom: 6px;" />
                  <button class="btn btn-secondary" id="add-link-btn" style="font-size: 11px; width: 100%;">Add Link</button>
                </div>
              </div>

              <!-- Images Section -->
              <div class="asset-section" id="asset-sec-images" style="display: none;">
                <div class="asset-grid">
                  ${proj.assets.images.map(img => `
                    <div class="image-thumb-card" data-url="${img.url}">
                      <img src="${img.url}" alt="${img.title}" onerror="this.src='https://images.unsplash.com/photo-1541462608141-2f52d7219857?auto=format&fit=crop&w=400&q=80'" />
                      <div class="image-thumb-title">${img.title}</div>
                    </div>
                  `).join('')}
                </div>
                <div style="border-top: 1px solid var(--border-color); margin-top: 12px; padding-top: 12px;">
                  <input type="text" class="form-input" id="new-image-title" placeholder="Image Title" style="font-size: 11px; margin-bottom: 6px;" />
                  <input type="text" class="form-input" id="new-image-url" placeholder="Paste local path or web URL" style="font-size: 11px; margin-bottom: 6px;" />
                  <button class="btn btn-secondary" id="add-image-btn" style="font-size: 11px; width: 100%;">Add Image Asset</button>
                </div>
              </div>
            </div>

            <!-- Invoices Card -->
            <div class="detail-card">
              <div class="detail-card-title">
                <span>Invoices Ledger</span>
                <button class="btn btn-secondary" id="detail-new-invoice-btn" style="font-size: 11px; padding: 6px 12px;">+ Generate</button>
              </div>
              <div class="doc-list" id="detail-invoices-list">
                ${proj.invoices.map(inv => `
                  <div class="doc-item" data-inv-id="${inv.id}">
                    <div class="doc-info">
                      <span class="doc-title">${inv.invoiceNo}</span>
                      <span class="doc-meta">Total: ${window.getCurrencySymbol(inv.currency)}${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} | Due: ${inv.dueDate}</span>
                    </div>
                    <span class="doc-status ${inv.status}">${inv.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Contracts Card -->
            <div class="detail-card">
              <div class="detail-card-title">
                <span>Client Agreements</span>
                <button class="btn btn-secondary" id="detail-new-contract-btn" style="font-size: 11px; padding: 6px 12px;">+ Create</button>
              </div>
              <div class="doc-list" id="detail-contracts-list">
                ${proj.contracts.map(cont => `
                  <div class="doc-item" data-cont-id="${cont.id}">
                    <div class="doc-info">
                      <span class="doc-title">${cont.title}</span>
                      <span class="doc-meta">Date: ${cont.date}</span>
                    </div>
                    <span class="doc-status ${cont.status}">${cont.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>
      `;

      this.bindDetailEvents(proj.id);
      window.modernizeSelects();
    };

    window.loadProjectDetail(id);
  },

  bindDetailEvents(projectId) {
    const proj = AppDB.getProjectById(projectId);

    // Back button
    document.getElementById('proj-back-btn').addEventListener('click', () => {
      this.renderPanel(document.getElementById('view-projects'));
    });

    // Delete Project
    document.getElementById('detail-delete-btn').addEventListener('click', () => {
      if (confirm(`Are you sure you want to permanently delete the project "${proj.title}"?`)) {
        AppDB.deleteProject(projectId);
        window.showToast("Project space closed and deleted.");
        this.renderPanel(document.getElementById('view-projects'));
      }
    });

    // Toggle Brief Edit Mode
    const editToggleBtn = document.getElementById('brief-edit-toggle-btn');
    if (editToggleBtn) {
      editToggleBtn.addEventListener('click', () => {
        const displayContainer = document.getElementById('brief-display-container');
        const editContainer = document.getElementById('brief-edit-container');
        const textarea = document.getElementById('detail-brief-textarea');
        
        const isEditing = editContainer.style.display === 'flex';
        
        if (isEditing) {
          // Save action
          const newBrief = textarea.value;
          proj.brief = newBrief;
          
          // Save to database
          AppDB.saveProject(proj);
          window.showToast("Creative brief updated.");
          
          // Switch back to view/save state
          displayContainer.innerHTML = newBrief.trim() ? newBrief.replace(/\n/g, '<br/>') : '<em style="color: var(--text-muted);">No creative brief provided yet. Click Edit to define scope.</em>';
          displayContainer.style.display = 'block';
          editContainer.style.display = 'none';
          editToggleBtn.innerText = 'Edit Brief';
          editToggleBtn.classList.remove('btn-primary');
          editToggleBtn.classList.add('btn-secondary');
        } else {
          // Enter edit mode
          displayContainer.style.display = 'none';
          editContainer.style.display = 'flex';
          editToggleBtn.innerText = 'Save Changes';
          editToggleBtn.classList.remove('btn-secondary');
          editToggleBtn.classList.add('btn-primary');
          textarea.focus();
        }
      });
    }

    // Status select update
    document.getElementById('detail-status-select').addEventListener('change', (e) => {
      const p = AppDB.getProjectById(projectId);
      const nextStatus = e.target.value;
      p.status = nextStatus;
      p.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        text: `Updated project active status to: "${nextStatus}"`
      });
      AppDB.saveProject(p);
      window.showToast(`Project status is now ${nextStatus}`);
      window.loadProjectDetail(projectId);
    });

    // Timeline Phase expands / collapses
    const phaseHeaders = document.querySelectorAll('.phase-header');
    phaseHeaders.forEach(head => {
      head.addEventListener('click', () => {
        const phNode = head.parentElement;
        const phName = phNode.dataset.phaseName;
        
        // Toggle current active phase textually
        const p = AppDB.getProjectById(projectId);
        p.timeline.currentPhase = phName;
        AppDB.saveProject(p);

        // UI toggling
        document.querySelectorAll('.timeline-phase').forEach(node => {
          node.classList.remove('active');
          node.querySelector('.phase-content').style.display = 'none';
        });
        phNode.classList.add('active');
        phNode.querySelector('.phase-content').style.display = 'block';
      });
    });

    // Kanban Drag-and-Drop Event Bindings
    const kanbanCards = document.querySelectorAll('.kanban-card');
    kanbanCards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          taskId: card.dataset.itemId,
          phaseIdx: card.dataset.phaseIdx
        }));
        requestAnimationFrame(() => card.classList.add('dragging'));
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    const kanbanLanes = document.querySelectorAll('.kanban-lane');
    kanbanLanes.forEach(lane => {
      lane.addEventListener('dragover', (e) => {
        e.preventDefault();
        lane.style.borderColor = 'rgba(255,255,255,0.2)';
        lane.style.backgroundColor = 'rgba(255,255,255,0.02)';
      });

      lane.addEventListener('dragleave', () => {
        lane.style.borderColor = '';
        lane.style.backgroundColor = '';
      });

      lane.addEventListener('drop', (e) => {
        e.preventDefault();
        lane.style.borderColor = '';
        lane.style.backgroundColor = '';

        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          const taskId = data.taskId;
          const phaseIdx = parseInt(data.phaseIdx);
          const nextStatus = lane.dataset.status;

          // Only allow drop if card belongs to the same phase
          if (phaseIdx === parseInt(lane.dataset.phaseIdx)) {
            AppDB.updateChecklistTaskStatus(projectId, phaseIdx, taskId, nextStatus);
            window.showToast("Task status updated.");
            if (nextStatus === 'Done' && window.triggerConfetti) {
              window.triggerConfetti(e.clientX, e.clientY);
            }
            window.loadProjectDetail(projectId);
          } else {
            window.showToast("Tasks can only be moved within their own phase.");
          }
        } catch (err) {
          console.error(err);
        }
      });
    });

    // Add Checklist Item Task
    const addTaskBtns = document.querySelectorAll('.add-task-btn');
    addTaskBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const phaseIdx = parseInt(btn.dataset.phaseIdx);
        const input = btn.parentElement.querySelector('.add-task-input');
        const txt = input.value.trim();
        if (!txt) return;

        const p = AppDB.getProjectById(projectId);
        p.timeline.phases[phaseIdx].checklist.push({
          id: 'cl-' + Date.now(),
          text: txt,
          done: false
        });

        p.logs.push({
          id: 'log-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          text: `Added checklist task: "${txt}"`
        });

        AppDB.saveProject(p);
        window.loadProjectDetail(projectId);
      });
    });

    // Submit Log Note
    const logSubmit = document.getElementById('log-submit-btn');
    logSubmit.addEventListener('click', () => {
      const input = document.getElementById('log-message-input');
      const text = input.value.trim();
      if (!text) return;

      const p = AppDB.getProjectById(projectId);
      p.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        text
      });
      AppDB.saveProject(p);
      input.value = '';
      window.loadProjectDetail(projectId);
      window.showToast("Process log entry added.");
    });

    // Asset Tabs Switching
    const tabBtns = document.querySelectorAll('.asset-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tab = btn.dataset.tab;
        document.querySelectorAll('.asset-section').forEach(sec => sec.style.display = 'none');
        document.getElementById(`asset-sec-${tab}`).style.display = 'block';
      });
    });

    // Copy Prompt Button
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
          btn.innerText = 'Copied!';
          window.showToast("Prompt copied to clipboard!");
          setTimeout(() => btn.innerText = 'Copy Prompt', 1500);
        });
      });
    });

    // Add Prompt Asset
    document.getElementById('add-prompt-btn').addEventListener('click', () => {
      const titleInput = document.getElementById('new-prompt-title');
      const textInput = document.getElementById('new-prompt-text');
      const title = titleInput.value.trim();
      const text = textInput.value.trim();
      if (!title || !text) return;

      AppDB.addAsset(projectId, 'prompt', { title, text });
      titleInput.value = '';
      textInput.value = '';
      window.loadProjectDetail(projectId);
      window.showToast("AI Prompt asset stored.");
    });

    // Add Link Asset
    document.getElementById('add-link-btn').addEventListener('click', () => {
      const titleInput = document.getElementById('new-link-title');
      const urlInput = document.getElementById('new-link-url');
      const title = titleInput.value.trim();
      const url = urlInput.value.trim();
      if (!title || !url) return;

      AppDB.addAsset(projectId, 'link', { title, url });
      titleInput.value = '';
      urlInput.value = '';
      window.loadProjectDetail(projectId);
      window.showToast("Web bookmark added.");
    });

    // Add Image Asset
    document.getElementById('add-image-btn').addEventListener('click', () => {
      const titleInput = document.getElementById('new-image-title');
      const urlInput = document.getElementById('new-image-url');
      const title = titleInput.value.trim();
      const url = urlInput.value.trim();
      if (!title || !url) return;

      AppDB.addAsset(projectId, 'image', { title, url });
      titleInput.value = '';
      urlInput.value = '';
      window.loadProjectDetail(projectId);
      window.showToast("Visual image asset added.");
    });

    // Invoices list clicks (view)
    const invItems = document.querySelectorAll('#detail-invoices-list .doc-item');
    invItems.forEach(item => {
      item.addEventListener('click', () => {
        const invId = item.dataset.invId;
        FinanceView.viewInvoice(projectId, invId);
      });
    });

    // Generate Invoice Button
    document.getElementById('detail-new-invoice-btn').addEventListener('click', () => {
      const financeNav = document.querySelector('.nav-item[data-view="finance"]');
      if (financeNav) {
        financeNav.click();
        setTimeout(() => {
          FinanceView.showNewInvoiceView(projectId);
        }, 100);
      }
    });

    // Contracts list clicks (view)
    const contItems = document.querySelectorAll('#detail-contracts-list .doc-item');
    contItems.forEach(item => {
      item.addEventListener('click', () => {
        const contId = item.dataset.contId;
        FinanceView.viewContract(projectId, contId);
      });
    });

    // Create Contract Button
    document.getElementById('detail-new-contract-btn').addEventListener('click', () => {
      this.showNewContractModal(projectId);
    });

    // Image Thumb Click (Lightbox popup placeholder)
    const imgCards = document.querySelectorAll('.image-thumb-card');
    imgCards.forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        const title = card.querySelector('.image-thumb-title').innerText;
        
        const modal = document.getElementById('universal-modal');
        const mTitle = document.getElementById('modal-title');
        const mBody = document.getElementById('modal-body');
        const mFooter = document.getElementById('modal-footer');
        
        mTitle.innerText = title;
        mBody.innerHTML = `<img src="${url}" style="width:100%; border-radius: var(--radius-md);" onerror="this.src='https://images.unsplash.com/photo-1541462608141-2f52d7219857?auto=format&fit=crop&w=800&q=80'" />`;
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

    // View Client Portal Button click
    const clientPortalBtn = document.getElementById('project-client-portal-btn');
    if (clientPortalBtn) {
      clientPortalBtn.addEventListener('click', () => {
        this.showClientPortalModal(projectId);
      });
    }
  },

  showClientPortalModal(projectId) {
    const modal = document.getElementById('universal-modal');
    const mTitle = document.getElementById('modal-title');
    const mBody = document.getElementById('modal-body');
    const mFooter = document.getElementById('modal-footer');
    
    const proj = AppDB.getProjectById(projectId);
    const client = AppDB.getClientById(proj.clientId) || { name: 'Client' };

    mTitle.innerText = `Client Portal — ${proj.title}`;
    
    const renderPortalBody = () => {
      // Refresh project instance
      const p = AppDB.getProjectById(projectId);
      
      let contractsHtml = '';
      if (!p.contracts || p.contracts.length === 0) {
        contractsHtml = '<p style="color: var(--text-muted); font-size: 11px;">No contracts generated yet.</p>';
      } else {
        contractsHtml = p.contracts.map(cont => {
          const isSigned = cont.status === 'Signed';
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); padding: 10px 14px; border-radius: var(--radius-sm); background-color: rgba(255,255,255,0.01); margin-bottom: 8px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 12px; font-weight: 500; color: #FFF;">${cont.title}</span>
                <span style="font-size: 9px; color: var(--text-muted);">Date: ${cont.date}</span>
              </div>
              <div>
                ${isSigned ? `
                  <span style="color: var(--color-success); font-size: 11px; font-weight: 600;">✓ Legally Signed</span>
                ` : `
                  <button class="btn btn-primary btn-sign-portal" data-cont-id="${cont.id}" style="font-size: 10px; padding: 4px 10px; background-color: var(--color-success); border-color: var(--color-success); color: #FFF;">Sign Contract</button>
                `}
              </div>
            </div>
          `;
        }).join('');
      }

      let invoicesHtml = '';
      if (!p.invoices || p.invoices.length === 0) {
        invoicesHtml = '<p style="color: var(--text-muted); font-size: 11px;">No invoices generated yet.</p>';
      } else {
        invoicesHtml = p.invoices.map(inv => {
          const isPaid = inv.status === 'Paid';
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); padding: 10px 14px; border-radius: var(--radius-sm); background-color: rgba(255,255,255,0.01); margin-bottom: 8px;">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 12px; font-weight: 500; color: #FFF;">${inv.invoiceNo} — ${inv.items[0]?.description || 'Milestone payment'}</span>
                <span style="font-size: 9px; color: var(--text-muted);">Issued: ${inv.date} | Due: ${inv.dueDate}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; font-weight: 600; color: #FFF;">${window.getCurrencySymbol(inv.currency)}${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                ${isPaid ? `
                  <span style="color: var(--color-success); font-size: 11px; font-weight: 600;">✓ Paid</span>
                ` : `
                  <button class="btn btn-primary btn-pay-portal" data-inv-id="${inv.id}" style="font-size: 10px; padding: 4px 10px; background-color: #FFF; color: #000;">Pay Invoice</button>
                `}
              </div>
            </div>
          `;
        }).join('');
      }

      mBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
          <div style="padding: 12px 16px; background-color: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: var(--radius-md);">
            <h4 style="font-size: 13px; color: var(--unicorn-text); margin: 0 0 4px 0; font-weight: 500;">Simulated Client View</h4>
            <p style="font-size: 11px; color: var(--text-muted); margin: 0; line-height: 1.4;">This view simulates what client <strong>${client.name}</strong> sees on their shareable portal. They can mock-sign contracts and mock-pay milestone invoices.</p>
          </div>

          <div>
            <h3 style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 600;">Outstanding Contracts</h3>
            <div id="portal-contracts-container">
              ${contractsHtml}
            </div>
          </div>

          <div>
            <h3 style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 600;">Milestone Invoices</h3>
            <div id="portal-invoices-container">
              ${invoicesHtml}
            </div>
          </div>
        </div>
      `;

      // Bind events inside the modal
      mBody.querySelectorAll('.btn-sign-portal').forEach(btn => {
        btn.addEventListener('click', () => {
          const contId = btn.dataset.contId;
          const targetCont = p.contracts.find(c => c.id === contId);
          if (targetCont) {
            targetCont.status = 'Signed';
            p.logs.push({
              id: 'log-' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              text: `Client signed contract: "${targetCont.title}"`
            });
            AppDB.saveProject(p);
            window.showToast("Contract signed successfully!");
            if (window.triggerConfetti) window.triggerConfetti();
            renderPortalBody(); // Re-render modal
            window.loadProjectDetail(projectId); // Re-render detail view behind
          }
        });
      });

      mBody.querySelectorAll('.btn-pay-portal').forEach(btn => {
        btn.addEventListener('click', () => {
          const invId = btn.dataset.invId;
          const targetInv = p.invoices.find(i => i.id === invId);
          if (targetInv) {
            targetInv.status = 'Paid';
            p.logs.push({
              id: 'log-' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              text: `Client paid invoice: "${targetInv.invoiceNo}" for ${window.getCurrencySymbol(targetInv.currency)}${targetInv.total}`
            });
            AppDB.saveProject(p);
            window.showToast("Invoice paid successfully!");
            if (window.triggerConfetti) window.triggerConfetti();
            renderPortalBody(); // Re-render modal
            window.loadProjectDetail(projectId); // Re-render detail view behind
          }
        });
      });
    };

    renderPortalBody();

    mFooter.innerHTML = `
      <button class="btn btn-primary" id="portal-close-btn" style="padding: 6px 18px;">Done</button>
    `;

    modal.classList.remove('modal-large'); // ensure normal size
    modal.classList.add('active');

    document.getElementById('portal-close-btn').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  },

  showNewContractModal(projectId) {
    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.innerText = 'Generate Contract Agreement';

    const p = AppDB.getProjectById(projectId);

    const defaultTerms = `1. Services Provided: The designer agrees to provide design deliverables for the "${p.title}" project.
2. Deliverables List: Detailed specifications as negotiated.
3. Payment Terms: Milestone payments. Submissions made shall be invoiced separately.
4. Intellectual Property: Original source files (Figma, vectors) shall be transferred to the client upon full payment of invoices.`;

    body.innerHTML = `
      <form id="new-contract-form">
        <div class="form-group">
          <label class="form-label">Contract / Agreement Title</label>
          <input type="text" class="form-input" id="contract-title-input" value="Design Service Agreement Proposal" required />
        </div>
        <div class="form-group">
          <label class="form-label">Agreement Terms & Conditions</label>
          <textarea class="form-input" id="contract-terms-input" style="height: 180px; line-height: 1.5;" required>${defaultTerms}</textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
      <button class="btn btn-primary" id="modal-submit-contract-btn">Create Contract</button>
    `;

    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modal-cancel-btn').addEventListener('click', close);

    document.getElementById('modal-submit-contract-btn').addEventListener('click', () => {
      const form = document.getElementById('new-contract-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const cTitle = document.getElementById('contract-title-input').value;
      const cTerms = document.getElementById('contract-terms-input').value;

      AppDB.addContract(projectId, cTitle, cTerms);
      close();
      window.showToast("Contract agreement generated!");
      window.loadProjectDetail(projectId);
    });
  }
};
