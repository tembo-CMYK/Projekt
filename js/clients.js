// js/clients.js

import { AppDB } from './db.js';

export const ClientsView = {
  renderPanel(container) {
    const clients = AppDB.getClients();
    const projects = AppDB.getProjects();

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h1>Client Directory</h1>
          <p>Manage customer contacts, historical briefs, and project relations.</p>
        </div>
        <button class="header-btn" id="client-new-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
          Add Client
        </button>
      </div>

      <!-- Category Filter Tabs -->
      <div class="client-filters" style="display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <button class="client-filter-btn active" data-category="All" style="font-size: 12px; padding: 6px 16px; border-radius: var(--radius-full); transition: all 0.2s ease; cursor: pointer; color: var(--text-primary); border: 1px solid var(--border-color); background: rgba(255,255,255,0.01);">
          All Clients
        </button>
        <button class="client-filter-btn" data-category="Web Design" style="font-size: 12px; padding: 6px 16px; border-radius: var(--radius-full); transition: all 0.2s ease; cursor: pointer; color: var(--text-muted); border: 1px solid transparent; background: transparent;">
          Web Design Clients
        </button>
        <button class="client-filter-btn" data-category="Branding" style="font-size: 12px; padding: 6px 16px; border-radius: var(--radius-full); transition: all 0.2s ease; cursor: pointer; color: var(--text-muted); border: 1px solid transparent; background: transparent;">
          Branding Clients
        </button>
        <button class="client-filter-btn" data-category="General Designs" style="font-size: 12px; padding: 6px 16px; border-radius: var(--radius-full); transition: all 0.2s ease; cursor: pointer; color: var(--text-muted); border: 1px solid transparent; background: transparent;">
          General Designs Clients
        </button>
      </div>

      <div class="client-list-grid" id="clients-list-container">
        ${clients.map(client => {
          const clientProjs = projects.filter(p => p.clientId === client.id);
          const activeCount = clientProjs.filter(p => p.status === 'Active').length;
          
          // Get initials
          const nameParts = client.name.split(/\s+/).filter(Boolean);
          const initials = nameParts.length > 0 
            ? (nameParts.length > 1 ? nameParts[0][0] + nameParts[1][0] : nameParts[0][0])
            : 'C';

          // Get gradient dynamically
          const gradients = [
            'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            'linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)',
            'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
            'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            'linear-gradient(135deg, #F953C6 0%, #B91D73 100%)',
            'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)',
            'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
            'linear-gradient(135deg, #8A2387 0%, #E94057 100%, #F27121 100%)'
          ];
          const getGradientIndex = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return Math.abs(hash) % gradients.length;
          };
          const avatarGradient = gradients[getGradientIndex(client.name)];

          return `
            <div class="client-card" data-id="${client.id}">
              <div class="client-card-header">
                <div class="client-avatar" style="background: ${avatarGradient};">
                  ${initials.toUpperCase()}
                </div>
                <div class="client-title-info">
                  <div class="client-card-title">${client.name}</div>
                  <div class="client-card-meta">${client.contactPerson}</div>
                </div>
              </div>
              <div class="client-card-details">
                <div class="client-detail-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="client-detail-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <span class="client-detail-text" title="${client.email}">${client.email}</span>
                </div>
                <div class="client-detail-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="client-detail-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.017 12.017 0 0 1-4.5-4.5c-.156-.441.01-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span class="client-detail-text" title="${client.phone}">${client.phone}</span>
                </div>
              </div>
              <div class="client-card-badges">
                <span class="client-badge-item projects">
                  Projects: ${clientProjs.length}
                </span>
                ${activeCount > 0 ? `
                  <span class="client-badge-item active">
                    ${activeCount} Active
                  </span>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${clients.length === 0 ? `
        <div class="empty-state" style="margin-top: 0;">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128A9.321 9.321 0 0 1 12 19.5c-1.093 0-2.117-.187-3.07-.528M8 16.251a4.125 4.125 0 0 1-7.533 2.493 9.337 9.337 0 0 0 4.121.952 9.38 9.38 0 0 0 2.625-.372m0-3.072v.003c0-1.11-.288-2.152-.786-3.07M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 2.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h3>No Clients Yet</h3>
          <p>Your client directory is empty. Add your first client to start managing contacts and project relations.</p>
          <button class="btn btn-primary" id="empty-client-add-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add First Client
          </button>
        </div>
      ` : ''}
    `;

    this.bindEvents();
  },

  bindEvents() {
    // New Client Button
    const newClientBtn = document.getElementById('client-new-btn');
    if (newClientBtn) {
      newClientBtn.addEventListener('click', () => this.showNewClientModal());
    }

    // Empty state CTA button
    const emptyClientBtn = document.getElementById('empty-client-add-btn');
    if (emptyClientBtn) {
      emptyClientBtn.addEventListener('click', () => this.showNewClientModal());
    }

    // Client Card Click (View detail)
    const cards = document.querySelectorAll('#clients-list-container .client-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.viewClientDetail(id);
      });
    });

    // Category Filter Button Clicks
    const filterBtns = document.querySelectorAll('.client-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.style.color = 'var(--text-muted)';
          b.style.border = '1px solid transparent';
          b.style.background = 'transparent';
          b.style.textShadow = 'none';
        });

        btn.classList.add('active');
        btn.style.color = 'var(--text-primary)';
        btn.style.border = '1px solid var(--border-color)';
        btn.style.background = 'rgba(255,255,255,0.01)';
        btn.style.textShadow = '0 0 6px rgba(255,255,255,0.3)';

        const category = btn.dataset.category;
        const projects = AppDB.getProjects();
        
        cards.forEach(card => {
          const clientId = card.dataset.id;
          const clientProjs = projects.filter(p => p.clientId === clientId);
          
          if (category === 'All') {
            card.style.display = 'block';
          } else {
            const hasProjInCat = clientProjs.some(p => p.category === category);
            card.style.display = hasProjInCat ? 'block' : 'none';
          }
        });
      });
    });
  },

  showNewClientModal() {
    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.innerText = 'Add New Client Profile';

    body.innerHTML = `
      <form id="new-client-form">
        <div class="form-group">
          <label class="form-label">Client / Company Name</label>
          <input type="text" class="form-input" id="client-name-input" placeholder="e.g. Baranov Medical" required />
        </div>
        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <input type="text" class="form-input" id="client-contact-input" placeholder="e.g. Dr. Dmitry Baranov" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="client-email-input" placeholder="e.g. info@company.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-input" id="client-phone-input" placeholder="e.g. +41 22 789 22" required />
        </div>
        <div class="form-group">
          <label class="form-label">Office Address</label>
          <input type="text" class="form-input" id="client-address-input" placeholder="e.g. Rue de Lyon, Geneva" />
        </div>
        <div class="form-group">
          <label class="form-label">Initial Relationship Notes / Brief</label>
          <textarea class="form-input" id="client-notes-input" style="height: 100px;" placeholder="Preferences, stylistic tone, project history details..."></textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
      <button class="btn btn-primary" id="modal-submit-client-btn">Save Profile</button>
    `;

    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modal-cancel-btn').addEventListener('click', close);

    document.getElementById('modal-submit-client-btn').addEventListener('click', () => {
      const form = document.getElementById('new-client-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const name = document.getElementById('client-name-input').value;
      const contact = document.getElementById('client-contact-input').value;
      const email = document.getElementById('client-email-input').value;
      const phone = document.getElementById('client-phone-input').value;
      const address = document.getElementById('client-address-input').value;
      const notes = document.getElementById('client-notes-input').value;

      AppDB.createClient(name, contact, email, phone, address, notes);
      close();
      window.showToast(`Client "${name}" profile created!`);
      this.renderPanel(document.getElementById('view-clients'));
    });
  },

  viewClientDetail(id) {
    const client = AppDB.getClientById(id);
    const projects = AppDB.getProjects().filter(p => p.clientId === id);
    const container = document.getElementById('view-clients');

    container.innerHTML = `
      <div class="back-bar" id="client-back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        Back to client directory
      </div>

      <div class="section-header">
        <div class="section-title">
          <h1>${client.name}</h1>
          <p>Client Profile Details & Creative brief history</p>
        </div>
      </div>

      <div class="client-detail-layout">
        <!-- Client Profile Contact Box -->
        <div class="detail-sidebar">
          <div class="detail-card">
            <div class="detail-card-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Profile Contacts</span>
              <button class="btn btn-secondary" id="edit-contacts-toggle-btn" style="font-size: 11px; padding: 4px 10px;">Edit</button>
            </div>
            
            <!-- View Mode -->
            <div id="contacts-display-container" style="display: flex; flex-direction: column; gap: 16px; font-size: 13px;">
              <div>
                <span class="form-label" style="font-size: 10px;">Primary Contact</span>
                <div id="contact-display-name" style="font-size: 15px; font-weight: 700; margin-top: 2px;">${client.contactPerson}</div>
              </div>
              <div>
                <span class="form-label" style="font-size: 10px;">Email</span>
                <div style="margin-top: 2px;"><a id="contact-display-email" href="mailto:${client.email}" style="color: var(--color-primary); font-weight: 500;">${client.email}</a></div>
              </div>
              <div>
                <span class="form-label" style="font-size: 10px;">Phone</span>
                <div id="contact-display-phone" style="margin-top: 2px;">${client.phone}</div>
              </div>
              <div>
                <span class="form-label" style="font-size: 10px;">Address</span>
                <div id="contact-display-address" style="margin-top: 2px; line-height: 1.4; color: var(--text-muted);">${client.address || 'No address logged.'}</div>
              </div>
            </div>

            <!-- Edit Mode -->
            <div id="contacts-edit-container" style="display: none; flex-direction: column; gap: 12px; font-size: 13px;">
              <div>
                <label class="form-label" style="font-size: 10px;">Primary Contact</label>
                <input type="text" id="edit-contact-name" class="form-input" value="${client.contactPerson}" style="width: 100%; margin-top: 4px;" />
              </div>
              <div>
                <label class="form-label" style="font-size: 10px;">Email</label>
                <input type="email" id="edit-contact-email" class="form-input" value="${client.email}" style="width: 100%; margin-top: 4px;" />
              </div>
              <div>
                <label class="form-label" style="font-size: 10px;">Phone</label>
                <input type="text" id="edit-contact-phone" class="form-input" value="${client.phone}" style="width: 100%; margin-top: 4px;" />
              </div>
              <div>
                <label class="form-label" style="font-size: 10px;">Address</label>
                <input type="text" id="edit-contact-address" class="form-input" value="${client.address || ''}" style="width: 100%; margin-top: 4px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- Brief History & Linked Projects -->
        <div class="detail-main">
          <div class="detail-card">
            <div class="detail-card-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Client Brief & Relationship Notes</span>
              <button class="btn btn-secondary" id="edit-notes-toggle-btn" style="font-size: 11px; padding: 6px 12px;">Edit Notes</button>
            </div>
            
            <!-- View Mode -->
            <div id="notes-display-container" style="font-size: 13px; line-height: 1.6; color: var(--text-primary); white-space: pre-line; padding: 6px 0;">
              ${client.notes || '<em style="color: var(--text-muted);">No relationship notes or initial briefs logged. Click Edit to add details.</em>'}
            </div>

            <!-- Edit Mode -->
            <div id="notes-edit-container" style="display: none; flex-direction: column; gap: 8px;">
              <textarea class="form-input" id="edit-notes-textarea" style="height: 140px; line-height: 1.5; font-family: var(--font-body); width: 100%;">${client.notes || ''}</textarea>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-title">Linked Projects (${projects.length})</div>
            
            ${projects.length === 0 ? '<p style="color: var(--text-muted); padding: 10px 0;">No projects linked to this client yet.</p>' : ''}
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${projects.map(proj => `
                <div class="doc-item" data-proj-id="${proj.id}" style="padding: 16px;">
                  <div class="doc-info">
                    <span class="doc-title" style="font-size: 15px;">${proj.title}</span>
                    <span class="doc-meta">Category: <strong>${proj.category}</strong> | Due Date: ${proj.dueDate}</span>
                  </div>
                  <span class="status-badge ${proj.status.toLowerCase()}">${proj.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event handlers
    document.getElementById('client-back-btn').addEventListener('click', () => {
      this.renderPanel(container);
    });

    // Toggle Contacts Edit Mode
    const contactsToggleBtn = document.getElementById('edit-contacts-toggle-btn');
    if (contactsToggleBtn) {
      contactsToggleBtn.addEventListener('click', () => {
        const displayContainer = document.getElementById('contacts-display-container');
        const editContainer = document.getElementById('contacts-edit-container');
        const nameInput = document.getElementById('edit-contact-name');
        const emailInput = document.getElementById('edit-contact-email');
        const phoneInput = document.getElementById('edit-contact-phone');
        const addressInput = document.getElementById('edit-contact-address');

        const isEditing = editContainer.style.display === 'flex';

        if (isEditing) {
          // Save action
          const contactPerson = nameInput.value.trim();
          const email = emailInput.value.trim();
          const phone = phoneInput.value.trim();
          const address = addressInput.value.trim();

          if (!contactPerson || !email) {
            window.showToast("Primary contact and email are required.");
            return;
          }

          // Save to database
          AppDB.updateClient(client.id, { contactPerson, email, phone, address });
          window.showToast("Client contact info updated.");

          // Update display texts
          document.getElementById('contact-display-name').innerText = contactPerson;
          const emailDisplay = document.getElementById('contact-display-email');
          emailDisplay.href = `mailto:${email}`;
          emailDisplay.innerText = email;
          document.getElementById('contact-display-phone').innerText = phone;
          document.getElementById('contact-display-address').innerText = address || 'No address logged.';

          // Switch back to view mode
          contactsToggleBtn.innerText = 'Edit';
          contactsToggleBtn.classList.remove('btn-primary');
          contactsToggleBtn.classList.add('btn-secondary');
          displayContainer.style.display = 'flex';
          editContainer.style.display = 'none';
        } else {
          // Switch to edit mode
          contactsToggleBtn.innerText = 'Save Contacts';
          contactsToggleBtn.classList.remove('btn-secondary');
          contactsToggleBtn.classList.add('btn-primary');
          displayContainer.style.display = 'none';
          editContainer.style.display = 'flex';
        }
      });
    }

    // Toggle Notes Edit Mode
    const notesToggleBtn = document.getElementById('edit-notes-toggle-btn');
    if (notesToggleBtn) {
      notesToggleBtn.addEventListener('click', () => {
        const displayContainer = document.getElementById('notes-display-container');
        const editContainer = document.getElementById('notes-edit-container');
        const textarea = document.getElementById('edit-notes-textarea');

        const isEditing = editContainer.style.display === 'block';

        if (isEditing) {
          // Save action
          const updatedNotes = textarea.value.trim();
          
          // Save to database
          AppDB.updateClientBrief(client.id, updatedNotes);
          window.showToast("Client notes updated.");

          // Update display text
          displayContainer.innerHTML = updatedNotes ? updatedNotes.replace(/\n/g, '<br/>') : '<em style="color: var(--text-muted);">No relationship notes or initial briefs logged. Click Edit to add details.</em>';

          // Switch back to view mode
          notesToggleBtn.innerText = 'Edit Notes';
          notesToggleBtn.classList.remove('btn-primary');
          notesToggleBtn.classList.add('btn-secondary');
          displayContainer.style.display = 'block';
          editContainer.style.display = 'none';
        } else {
          // Switch to edit mode
          notesToggleBtn.innerText = 'Save Changes';
          notesToggleBtn.classList.remove('btn-secondary');
          notesToggleBtn.classList.add('btn-primary');
          displayContainer.style.display = 'none';
          editContainer.style.display = 'block';
        }
      });
    }

    const docItems = container.querySelectorAll('.doc-item');
    docItems.forEach(item => {
      item.addEventListener('click', () => {
        const projId = item.dataset.projId;
        // Navigate to Projects view and open details
        const navProj = document.querySelector('.nav-item[data-view="projects"]');
        navProj.click();
        
        // Wait for Projects tab panel render then display detail
        setTimeout(() => {
          ProjectsView.viewProjectDetail(projId);
        }, 150);
      });
    });
  }
};
