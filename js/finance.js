// js/finance.js

import { AppDB } from './db.js';

export const FinanceView = {
  renderPanel(container) {
    const projects = AppDB.getProjects();
    const clients = AppDB.getClients();
    
    // Compile all invoices and contracts
    const allInvoices = [];
    const allContracts = [];
    
    projects.forEach(p => {
      const client = clients.find(c => c.id === p.clientId) || { name: 'Unknown Client' };
      
      if (p.invoices) {
        p.invoices.forEach(inv => {
          allInvoices.push({ ...inv, project: p, client });
        });
      }
      
      if (p.contracts) {
        p.contracts.forEach(cont => {
          allContracts.push({ ...cont, project: p, client });
        });
      }
    });

    // Calculate total earned
    const totalEarned = allInvoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.total, 0);

    const pendingInvoices = allInvoices
      .filter(i => i.status === 'Sent')
      .reduce((sum, i) => sum + i.total, 0);

    const wsSymbol = window.getWorkspaceCurrencySymbol();

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h1>Finances & Documents</h1>
          <p>Track bills, milestones, and legal agreements across all projects.</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="header-btn" id="fin-new-invoice-btn" style="background-color: var(--swiss-text);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Generate Invoice
          </button>
        </div>
      </div>

      <!-- Financial Statistics -->
      <div class="dashboard-stats" style="margin-bottom: 32px;">
        <div class="stat-card">
          <span class="stat-label">Total Earnings (Paid)</span>
          <span class="stat-value" style="color: var(--color-success);">${wsSymbol}${totalEarned.toLocaleString()}</span>
          <div class="stat-change positive">✓ Completed transactions</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Outstanding Invoiced</span>
          <span class="stat-value" style="color: var(--swiss-text);">${wsSymbol}${pendingInvoices.toLocaleString()}</span>
          <div class="stat-change" style="color: var(--text-muted);">⌛ Awaiting client bank transfers</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Invoices</span>
          <span class="stat-value">${allInvoices.length}</span>
          <div class="stat-change" style="color: var(--text-muted);">Drafts: ${allInvoices.filter(i=>i.status==='Draft').length} | Sent: ${allInvoices.filter(i=>i.status==='Sent').length} | Paid: ${allInvoices.filter(i=>i.status==='Paid').length}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <!-- Invoices List -->
        <div class="detail-card">
          <div class="detail-card-title">
            <span>Invoices Ledger</span>
          </div>
          <div class="doc-list" id="finance-invoices-list">
            ${allInvoices.length === 0 ? '<p style="color: var(--text-muted); text-align: center; padding: 24px;">No invoices generated yet.</p>' : ''}
            ${allInvoices.map(inv => `
              <div class="doc-item" data-inv-id="${inv.id}" data-proj-id="${inv.project.id}">
                <div class="doc-info">
                  <span class="doc-title">${inv.invoiceNo}</span>
                  <span class="doc-meta">${inv.client.name} — ${inv.project.title}</span>
                  <span class="doc-meta" style="font-size: 10px;">Issued: ${inv.date} | Due: ${inv.dueDate}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="doc-amount">${window.getCurrencySymbol(inv.currency)}${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span class="doc-status ${inv.status}">${inv.status}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Contracts List -->
        <div class="detail-card">
          <div class="detail-card-title">
            <span>Client Agreements</span>
          </div>
          <div class="doc-list" id="finance-contracts-list">
            ${allContracts.length === 0 ? '<p style="color: var(--text-muted); text-align: center; padding: 24px;">No contracts generated yet.</p>' : ''}
            ${allContracts.map(cont => `
              <div class="doc-item" data-cont-id="${cont.id}" data-proj-id="${cont.project.id}">
                <div class="doc-info">
                  <span class="doc-title">${cont.title}</span>
                  <span class="doc-meta">${cont.client.name} — ${cont.project.title}</span>
                  <span class="doc-meta" style="font-size: 10px;">Date: ${cont.date}</span>
                </div>
                <span class="doc-status ${cont.status}">${cont.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    // New Invoice Button
    const newInvoiceBtn = document.getElementById('fin-new-invoice-btn');
    if (newInvoiceBtn) {
      newInvoiceBtn.addEventListener('click', () => {
        this.showNewInvoiceView();
      });
    }

    // Invoice Click View
    const invItems = document.querySelectorAll('#finance-invoices-list .doc-item');
    invItems.forEach(item => {
      item.addEventListener('click', () => {
        const invId = item.dataset.invId;
        const projId = item.dataset.projId;
        this.viewInvoice(projId, invId);
      });
    });

    // Contract Click View
    const contItems = document.querySelectorAll('#finance-contracts-list .doc-item');
    contItems.forEach(item => {
      item.addEventListener('click', () => {
        const contId = item.dataset.contId;
        const projId = item.dataset.projId;
        this.viewContract(projId, contId);
      });
    });
  },

  showNewInvoiceView(defaultProjId = null) {
    const container = document.getElementById('view-finance');
    if (!container) return;

    const projects = AppDB.getProjects();
    const projectOptions = projects.map(p => `
      <option value="${p.id}" ${defaultProjId === p.id ? 'selected' : ''}>${p.title} (${p.category})</option>
    `).join('');

    const defaultInvNo = 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(100 + Math.random() * 900));
    const today = new Date().toISOString().split('T')[0];
    const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const CURRENCY_SYMBOLS = {
      USD: '$',
      EUR: '€',
      CHF: 'CHF',
      GBP: '£',
      ZMW: 'ZK'
    };

    container.innerHTML = `
      <div class="new-invoice-container" style="display: flex; flex-direction: column; gap: 24px; text-align: left; animation: fadeIn 0.2s ease;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-wrap: wrap; gap: 16px;">
          <div>
            <div class="back-bar" id="invoice-back-btn" style="margin-bottom: 8px; font-size: 12px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 4px;">
              Invoices <span style="color: var(--text-muted); margin: 0 4px;">/</span> <span style="color: #FFF;">New Invoice</span>
            </div>
            <h1 style="font-size: 28px; font-weight: 300; color: #FFF; margin: 0 0 4px 0; letter-spacing: -0.5px;">New Invoice</h1>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Generate and send new invoice.</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button class="btn btn-secondary" id="invoice-toggle-preview-btn" style="padding: 8px 16px; border-color: var(--border-color); color: #FFF; display: flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              <span id="toggle-preview-text">Hide Preview</span>
            </button>
            <button class="btn btn-secondary" id="invoice-save-draft-btn" style="padding: 8px 16px; border-color: var(--border-color); color: #FFF;">
              Save as Draft
            </button>
            <button class="btn btn-primary" id="invoice-send-btn" style="padding: 8px 16px; background-color: #FFF; color: #000; font-weight: 500; display: flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
              Send Invoice
            </button>
          </div>
        </div>

        <!-- Body Grid -->
        <div class="new-invoice-body-grid" style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: start; transition: all 0.3s ease;">
          <!-- Left Column: Form -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Invoice Details Card -->
            <div class="detail-card" style="margin-bottom: 0; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h2 style="font-size: 16px; font-weight: 500; color: #FFF; margin: 0 0 4px 0;">Invoice Details</h2>
                  <p style="color: var(--text-muted); font-size: 12px; margin: 0;">Enter invoice details.</p>
                </div>
                <div id="invoice-client-badge-container">
                  <!-- Dynamically populated -->
                </div>
              </div>

              <form id="new-invoice-form" style="display: flex; flex-direction: column; gap: 16px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Select Project</label>
                  <select class="form-input" id="invoice-project-select" required style="width: 100%;">
                    ${projectOptions}
                  </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">First Name</label>
                    <input type="text" class="form-input" id="invoice-client-first-name" placeholder="Ex. John" required />
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Last Name</label>
                    <input type="text" class="form-input" id="invoice-client-last-name" placeholder="Ex. Jacobs" required />
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Address</label>
                  <input type="text" class="form-input" id="invoice-client-address" placeholder="Ex. 123 Maple Street, Springfield, USA" required />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Invoice Number</label>
                    <input type="text" class="form-input" id="invoice-no-input" value="${defaultInvNo}" required />
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Currency</label>
                    <select class="form-input" id="invoice-currency-select" required style="width: 100%;">
                      <option value="USD">🇺🇸 US Dollar ($)</option>
                      <option value="EUR">🇪🇺 Euro (€)</option>
                      <option value="CHF">🇨🇭 Swiss Franc (CHF)</option>
                      <option value="GBP">🇬🇧 British Pound (£)</option>
                      <option value="ZMW">🇿🇲 Zambian Kwacha (ZK)</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Date Issued</label>
                    <input type="date" class="form-input" id="invoice-issue-date" value="${today}" required style="width: 100%;" />
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Due Date</label>
                    <input type="date" class="form-input" id="invoice-due-date" value="${defaultDue}" required style="width: 100%;" />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Tax Rate (%)</label>
                    <input type="number" class="form-input" id="invoice-tax-input" value="10" min="0" max="100" required />
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label">Discount ($ / symbol-unit)</label>
                    <input type="number" class="form-input" id="invoice-discount-input" value="0" min="0" required />
                  </div>
                </div>
              </form>
            </div>

            <!-- Product Details Card -->
            <div class="detail-card" style="margin-bottom: 0; padding: 24px;">
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; font-weight: 500; color: #FFF; margin: 0 0 4px 0;">Product Details</h2>
                <p style="color: var(--text-muted); font-size: 12px; margin: 0;">Enter product details.</p>
              </div>

              <table class="invoice-creator-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); font-size: 10px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">
                    <th style="padding-bottom: 10px; text-align: left;">Item</th>
                    <th style="width: 70px; padding-bottom: 10px; text-align: left;">QTY</th>
                    <th style="width: 120px; padding-bottom: 10px; text-align: left;">Cost</th>
                    <th style="width: 120px; padding-bottom: 10px; text-align: right;">Total</th>
                    <th style="width: 40px; padding-bottom: 10px; text-align: center;"></th>
                  </tr>
                </thead>
                <tbody id="invoice-items-rows">
                  <tr class="invoice-creator-row">
                    <td style="padding: 10px 0;"><input type="text" class="invoice-creator-input row-desc" value="Design services milestone" required style="width: 100%;" /></td>
                    <td style="padding: 10px 0;"><input type="number" class="invoice-creator-input row-qty" value="1" min="1" required style="width: 100%;" /></td>
                    <td style="padding: 10px 0;"><input type="number" class="invoice-creator-input row-cost" value="1000" min="0" required style="width: 100%;" /></td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 500; color: #FFF; font-size: 13px;" class="row-total-val">$1,000.00</td>
                    <td style="padding: 10px 0; text-align: center;"><button type="button" class="btn-row-delete" style="color: var(--color-danger); cursor: pointer; font-size: 18px; background: none; border: none; padding: 0 4px;">&times;</button></td>
                  </tr>
                </tbody>
              </table>

              <button type="button" class="btn btn-secondary" id="add-invoice-row-btn" style="padding: 8px 16px; border-color: var(--border-color); display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Row
              </button>
            </div>
          </div>

          <!-- Right Column: Live Invoice Preview -->
          <div id="invoice-preview-column" style="display: flex; flex-direction: column; gap: 16px;">
            <div id="invoice-live-preview" style="background-color: #151518; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 32px; color: var(--text-primary); display: flex; flex-direction: column; gap: 24px; font-family: var(--font-body); box-shadow: 0 20px 40px rgba(0,0,0,0.4); position: relative; overflow: hidden; min-height: 600px;">
              
              <!-- Sheet Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 20px;">
                <div>
                  <h2 style="font-family: var(--font-heading); font-size: 28px; font-weight: 300; color: #FFF; margin: 0 0 6px 0; letter-spacing: -0.5px;">Invoice</h2>
                  <div style="font-size: 11px; color: var(--text-muted);" id="prev-inv-no">INV-XXXX</div>
                </div>
                <!-- Brand Logo Square -->
                <div style="width: 40px; height: 40px; background-color: #FFF; color: #000; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; border: 1px solid var(--border-color); box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                  P
                </div>
              </div>

              <!-- Billed By / Billed To columns -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 12px; line-height: 1.6;">
                <div>
                  <span style="color: var(--text-muted); display: block; margin-bottom: 6px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Billed by:</span>
                  <strong id="prev-designer-name" style="color: #FFF; font-size: 13px; font-weight: 500; display: block; margin-bottom: 2px;">AMANDA SMITH</strong>
                  <span id="prev-designer-email" style="display: block; color: var(--text-muted);">amanda@smith-design.com</span>
                  <span id="prev-designer-studio" style="display: block; color: var(--text-muted);">Amanda Smith Design Studio</span>
                </div>
                <div>
                  <span style="color: var(--text-muted); display: block; margin-bottom: 6px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Billed to:</span>
                  <strong id="prev-client-name" style="color: #FFF; font-size: 13px; font-weight: 500; display: block; margin-bottom: 2px;">Client Name</strong>
                  <span id="prev-client-email" style="display: block; color: var(--text-muted);">client@email.com</span>
                  <span id="prev-client-address" style="display: block; color: var(--text-muted);">Client Address</span>
                </div>
              </div>

              <!-- Dates -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
                <div>
                  <span style="color: var(--text-muted); display: block; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date Issued:</span>
                  <span id="prev-issue-date" style="color: #FFF; font-weight: 400;">YYYY-MM-DD</span>
                </div>
                <div>
                  <span style="color: var(--text-muted); display: block; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Due Date:</span>
                  <span id="prev-due-date" style="color: #FFF; font-weight: 400;">YYYY-MM-DD</span>
                </div>
              </div>

              <!-- Items Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text-muted); font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th style="padding-bottom: 10px;">Item Description</th>
                    <th style="text-align: center; padding-bottom: 10px; width: 45px;">QTY</th>
                    <th style="text-align: right; padding-bottom: 10px; width: 100px;">Cost</th>
                    <th style="text-align: right; padding-bottom: 10px; width: 100px;">Total</th>
                  </tr>
                </thead>
                <tbody id="prev-items-body">
                  <!-- Dynamic rows -->
                </tbody>
              </table>

              <!-- Totals Block -->
              <div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 12px; align-items: flex-end;">
                <div style="display: flex; justify-content: space-between; width: 200px;">
                  <span style="color: var(--text-muted);">Subtotal:</span>
                  <span id="prev-subtotal" style="color: #FFF;">$0.00</span>
                </div>
                <div style="display: flex; justify-content: space-between; width: 200px;">
                  <span style="color: var(--text-muted);" id="prev-tax-label">Tax (10%):</span>
                  <span id="prev-tax" style="color: #FFF;">$0.00</span>
                </div>
                <div style="display: flex; justify-content: space-between; width: 200px;">
                  <span style="color: var(--text-muted);">Discount:</span>
                  <span id="prev-discount" style="color: #FFF;">$0.00</span>
                </div>
                <div style="display: flex; justify-content: space-between; width: 200px; font-weight: 500; font-size: 15px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; margin-top: 4px;">
                  <span style="color: #FFF;">Total:</span>
                  <span id="prev-total" style="color: #FFF;">$0.00</span>
                </div>
              </div>

              <!-- Footer Thank You -->
              <div style="font-size: 10px; color: var(--text-muted); text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; margin-top: 12px; font-style: italic;">
                Thank you for your purchase! We appreciate your business and look forward to serving you again.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    const form = document.getElementById('new-invoice-form');
    const projectSelect = document.getElementById('invoice-project-select');
    const currencySelect = document.getElementById('invoice-currency-select');
    const taxInput = document.getElementById('invoice-tax-input');
    const discountInput = document.getElementById('invoice-discount-input');
    const issueInput = document.getElementById('invoice-issue-date');
    const dueInput = document.getElementById('invoice-due-date');
    const noInput = document.getElementById('invoice-no-input');
    
    const firstNameInput = document.getElementById('invoice-client-first-name');
    const lastNameInput = document.getElementById('invoice-client-last-name');
    const addressInput = document.getElementById('invoice-client-address');

    // Back to ledger
    document.getElementById('invoice-back-btn').addEventListener('click', () => {
      this.renderPanel(container);
    });

    // Toggle Preview
    let previewVisible = true;
    document.getElementById('invoice-toggle-preview-btn').addEventListener('click', () => {
      const previewCol = document.getElementById('invoice-preview-column');
      const grid = document.querySelector('.new-invoice-body-grid');
      const textEl = document.getElementById('toggle-preview-text');
      
      previewVisible = !previewVisible;
      if (previewVisible) {
        previewCol.style.display = 'flex';
        grid.style.gridTemplateColumns = '1.1fr 1fr';
        textEl.innerText = 'Hide Preview';
      } else {
        previewCol.style.display = 'none';
        grid.style.gridTemplateColumns = '1fr';
        textEl.innerText = 'Show Preview';
      }
    });

    const updateLivePreview = () => {
      const projId = projectSelect.value;
      const invoiceNo = noInput.value;
      const currency = currencySelect.value;
      const symbol = CURRENCY_SYMBOLS[currency] || '$';
      const taxRate = parseFloat(taxInput.value) || 0;
      const discountVal = parseFloat(discountInput.value) || 0;
      const issueDate = issueInput.value;
      const dueDate = dueInput.value;

      const formatDate = (dateStr) => {
        if (!dateStr) return 'YYYY-MM-DD';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      document.getElementById('prev-inv-no').innerText = invoiceNo || 'INV-XXXX';
      document.getElementById('prev-issue-date').innerText = formatDate(issueDate);
      document.getElementById('prev-due-date').innerText = formatDate(dueDate);
      document.getElementById('prev-tax-label').innerText = `Tax (${taxRate}%):`;

      const profile = AppDB.getProfile();
      document.getElementById('prev-designer-name').innerText = profile.name.toUpperCase();
      document.getElementById('prev-designer-studio').innerText = profile.studio || 'Design Studio Services';
      document.getElementById('prev-designer-email').innerText = profile.email;

      const firstName = firstNameInput.value;
      const lastName = lastNameInput.value;
      const clientAddress = addressInput.value;
      
      const proj = AppDB.getProjectById(projId);
      let clientName = 'Client Name';
      let clientEmail = 'client@email.com';
      
      if (proj) {
        const client = AppDB.getClientById(proj.clientId);
        if (client) {
          clientName = client.name;
          clientEmail = client.email;
        }
      }
      
      document.getElementById('prev-client-name').innerText = clientName;
      document.getElementById('prev-client-email').innerText = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : clientEmail;
      document.getElementById('prev-client-address').innerText = clientAddress || 'Client Address';

      const rows = document.querySelectorAll('#invoice-items-rows tr');
      let subtotal = 0;
      let itemsHtml = '';

      rows.forEach(r => {
        const descInput = r.querySelector('.row-desc');
        const qtyInput = r.querySelector('.row-qty');
        const costInput = r.querySelector('.row-cost');
        const totalCell = r.querySelector('.row-total-val');
        
        if (descInput && qtyInput && costInput) {
          const desc = descInput.value;
          const qty = parseInt(qtyInput.value) || 0;
          const cost = parseFloat(costInput.value) || 0;
          const lineTotal = qty * cost;
          subtotal += lineTotal;

          if (totalCell) {
            totalCell.innerText = `${symbol}${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }

          itemsHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
              <td style="padding: 10px 0; color: #FFF;">${desc || 'Item description'}</td>
              <td style="padding: 10px 0; text-align: center; color: #FFF;">${qty}</td>
              <td style="padding: 10px 0; text-align: right; color: #FFF;">${symbol}${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="padding: 10px 0; text-align: right; color: #FFF; font-weight: 500;">${symbol}${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `;
        }
      });

      const tax = subtotal * (taxRate / 100);
      const total = Math.max(0, subtotal + tax - discountVal);

      document.getElementById('prev-items-body').innerHTML = itemsHtml;
      document.getElementById('prev-subtotal').innerText = `${symbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById('prev-tax').innerText = `${symbol}${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById('prev-discount').innerText = `${symbol}${discountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById('prev-total').innerText = `${symbol}${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const updateClientInfo = () => {
      const projId = projectSelect.value;
      const proj = AppDB.getProjectById(projId);
      if (proj) {
        const client = AppDB.getClientById(proj.clientId);
        if (client) {
          const contact = client.contactPerson || '';
          const parts = contact.split(' ');
          let first = '';
          let last = '';
          if (parts.length > 0) {
            const titles = ['dr.', 'mr.', 'ms.', 'mrs.', 'dr', 'mr', 'ms', 'mrs'];
            if (titles.includes(parts[0].toLowerCase()) && parts.length > 1) {
              first = parts[0] + ' ' + parts[1];
              last = parts.slice(2).join(' ');
            } else {
              first = parts[0];
              last = parts.slice(1).join(' ');
            }
          }
          
          firstNameInput.value = first;
          lastNameInput.value = last;
          addressInput.value = client.address || '';
          
          const initial = client.name.charAt(0).toUpperCase();
          document.getElementById('invoice-client-badge-container').innerHTML = `
            <div class="client-badge-display" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
              <div class="client-logo-circle" style="width: 24px; height: 24px; border-radius: 50%; background: var(--swiss-bg); color: var(--swiss-text); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px;">${initial}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 11px; font-weight: 500; color: #FFF; line-height: 1.2;">${client.name}</span>
                <span style="font-size: 9px; color: var(--text-muted); line-height: 1.2;">${client.email}</span>
              </div>
            </div>
          `;
        }
      }
      updateLivePreview();
    };

    projectSelect.addEventListener('change', updateClientInfo);
    currencySelect.addEventListener('change', updateLivePreview);
    form.addEventListener('input', updateLivePreview);
    
    // Bind initial inputs inside form
    document.querySelectorAll('.invoice-creator-input').forEach(input => {
      input.addEventListener('input', updateLivePreview);
    });

    // Add row button
    document.getElementById('add-invoice-row-btn').addEventListener('click', () => {
      const tbody = document.getElementById('invoice-items-rows');
      const tr = document.createElement('tr');
      tr.className = 'invoice-creator-row';
      tr.innerHTML = `
        <td style="padding: 10px 0;"><input type="text" class="invoice-creator-input row-desc" placeholder="Consultation/Deliverable" required style="width: 100%;" /></td>
        <td style="padding: 10px 0;"><input type="number" class="invoice-creator-input row-qty" value="1" min="1" required style="width: 100%;" /></td>
        <td style="padding: 10px 0;"><input type="number" class="invoice-creator-input row-cost" placeholder="0" min="0" required style="width: 100%;" /></td>
        <td style="padding: 10px 0; text-align: right; font-weight: 500; color: #FFF; font-size: 13px;" class="row-total-val">$0.00</td>
        <td style="padding: 10px 0; text-align: center;"><button type="button" class="btn-row-delete" style="color: var(--color-danger); cursor: pointer; font-size: 18px; background: none; border: none; padding: 0 4px;">&times;</button></td>
      `;
      tbody.appendChild(tr);
      
      tr.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateLivePreview);
      });
      
      updateLivePreview();
    });

    // Remove row
    document.getElementById('invoice-items-rows').addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-row-delete')) {
        const rows = document.querySelectorAll('.invoice-creator-row');
        if (rows.length > 1) {
          e.target.closest('tr').remove();
          updateLivePreview();
        } else {
          window.showToast("An invoice must contain at least one line item.");
        }
      }
    });

    // Save triggers
    const handleSave = (status) => {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const projId = projectSelect.value;
      const invoiceNo = noInput.value;
      const currency = currencySelect.value;
      const taxRate = parseFloat(taxInput.value) || 0;
      const discountVal = parseFloat(discountInput.value) || 0;
      const issueDate = issueInput.value;
      const dueDate = dueInput.value;
      
      const rows = document.querySelectorAll('#invoice-items-rows tr');
      const items = [];
      rows.forEach(r => {
        const desc = r.querySelector('.row-desc').value;
        const qty = parseInt(r.querySelector('.row-qty').value) || 1;
        const cost = parseFloat(r.querySelector('.row-cost').value) || 0;
        items.push({ description: desc, qty, cost });
      });

      AppDB.addInvoice(projId, invoiceNo, items, taxRate, status, issueDate, dueDate, discountVal, currency);
      window.showToast(`Invoice ${invoiceNo} generated as ${status}!`);
      if (window.triggerConfetti) window.triggerConfetti();
      this.renderPanel(container);
    };

    document.getElementById('invoice-save-draft-btn').addEventListener('click', () => handleSave('Draft'));
    document.getElementById('invoice-send-btn').addEventListener('click', () => handleSave('Sent'));

    // Initialize client details
    updateClientInfo();
    window.modernizeSelects();
  },

  viewInvoice(projId, invId) {
    const proj = AppDB.getProjectById(projId);
    const inv = proj.invoices.find(i => i.id === invId);
    const client = AppDB.getClientById(proj.clientId);

    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.innerText = `Invoice Summary - ${inv.invoiceNo}`;

    const subtotal = inv.items.reduce((acc, it) => acc + it.amount, 0);
    const taxAmount = subtotal * (inv.taxRate / 100);
    const symbol = window.getCurrencySymbol(inv.currency);

    body.innerHTML = `
      <div class="doc-preview-modal">
        <div class="doc-paper">
          <div class="doc-paper-header">
            <div>
              <h3 style="font-family: var(--font-heading); font-size: 24px; font-weight: 700; margin-bottom: 6px;">INVOICE</h3>
              <p style="color: var(--text-muted); font-size: 12px;">No: ${inv.invoiceNo}</p>
              <p style="color: var(--text-muted); font-size: 12px;">Date: ${inv.date}</p>
              <p style="color: var(--text-muted); font-size: 12px;">Due: ${inv.dueDate}</p>
            </div>
            <div style="text-align: right;">
              <h4 style="font-family: var(--font-heading); font-size: 16px; margin-bottom: 6px;">${AppDB.getProfile().name.toUpperCase()}</h4>
              <p style="color: var(--text-muted); font-size: 12px;">${AppDB.getProfile().studio}</p>
              <p style="color: var(--text-muted); font-size: 12px;">${AppDB.getProfile().email}</p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-bottom: 30px; font-size: 13px;">
            <h4 style="font-family: var(--font-heading); font-size: 14px; margin-bottom: 4px; text-transform: uppercase; color: var(--text-muted);">Billed To:</h4>
            <strong>${client.name}</strong><br/>
            ${client.contactPerson}<br/>
            ${client.address || ''}<br/>
            ${client.email}
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right; width: 140px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map(it => `
                <tr>
                  <td>${it.description}</td>
                  <td style="text-align: right; font-weight: 600;">${symbol}${it.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
              <tr style="border-top: 1px solid #E2E8F0;">
                <td style="text-align: right; font-weight: 600; color: var(--text-muted);">Subtotal</td>
                <td style="text-align: right; font-weight: 600;">${symbol}${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              ${inv.taxRate > 0 ? `
                <tr>
                  <td style="text-align: right; font-weight: 600; color: var(--text-muted);">Tax (${inv.taxRate}%)</td>
                  <td style="text-align: right; font-weight: 600;">${symbol}${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              ` : ''}
              <tr class="invoice-total-row">
                <td>Total Due</td>
                <td>${symbol}${inv.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 50px; border-top: 1px solid var(--border-color); padding-top: 15px; font-size: 11px; color: var(--text-muted); text-align: center;">
            Thank you for your business. Payment is requested within 14 days of invoice date.
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <div style="display: flex; gap: 8px; width: 100%;">
        <select class="form-input" id="update-inv-status-select" style="width: 150px; padding: 6px 10px; font-size: 13px;">
          <option value="Draft" ${inv.status === 'Draft' ? 'selected' : ''}>Draft</option>
          <option value="Sent" ${inv.status === 'Sent' ? 'selected' : ''}>Sent</option>
          <option value="Paid" ${inv.status === 'Paid' ? 'selected' : ''}>Paid</option>
        </select>
        <button class="btn btn-secondary" id="update-inv-status-btn" style="padding: 6px 14px;">Update Status</button>
        
        <button class="btn btn-secondary" id="print-doc-btn" style="margin-left: auto;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.865 48.865 0 0 0-14.325 0C3.768 7.281 3 8.215 3 9.296v6.454a2.25 2.25 0 0 0 2.25 2.25h1.091M9 10.5h.008v.008H9V10.5Zm3 0h.008v.008H12V10.5Zm3 0h.008v.008H15V10.5Z" /></svg>
          Print PDF
        </button>
        <button class="btn btn-primary" id="modal-close-btn" style="padding: 6px 18px;">Close</button>
      </div>
    `;

    modal.classList.add('active');

    // Print
    document.getElementById('print-doc-btn').addEventListener('click', () => {
      window.print();
    });

    // Close
    const close = () => modal.classList.remove('active');
    document.getElementById('modal-close-btn').addEventListener('click', close);

    // Update status
    document.getElementById('update-inv-status-btn').addEventListener('click', () => {
      const nextStatus = document.getElementById('update-inv-status-select').value;
      inv.status = nextStatus;
      
      // Update log
      proj.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        text: `Updated invoice ${inv.invoiceNo} status to ${nextStatus}`
      });

      AppDB.saveProject(proj);
      window.showToast(`Invoice status updated to ${nextStatus}`);
      if (nextStatus === 'Paid' && window.triggerConfetti) {
        window.triggerConfetti();
      }
      close();

      // Refresh page
      const activeNav = document.querySelector('.nav-item.active').dataset.view;
      if (activeNav === 'finance') {
        this.renderPanel(document.getElementById('view-finance'));
      } else if (activeNav === 'projects') {
        window.loadProjectDetail(projId);
      }
    });
  },

  viewContract(projId, contId) {
    const proj = AppDB.getProjectById(projId);
    const cont = proj.contracts.find(c => c.id === contId);
    const client = AppDB.getClientById(proj.clientId);

    const modal = document.getElementById('universal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    title.innerText = `Contract Summary - ${cont.title}`;

    body.innerHTML = `
      <div class="doc-preview-modal">
        <div class="doc-paper">
          <h2 style="font-family: var(--font-heading); text-align: center; margin-bottom: 40px; font-weight: 700; font-size: 24px; text-transform: uppercase;">SERVICE AGREEMENT</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; font-family: var(--font-body); margin-bottom: 40px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
            <div>
              <strong>DESIGNER:</strong><br/>
              ${AppDB.getProfile().studio}<br/>
              ${AppDB.getProfile().email}
            </div>
            <div>
              <strong>CLIENT:</strong><br/>
              ${client.name}<br/>
              Representative: ${client.contactPerson}<br/>
              Email: ${client.email}
            </div>
          </div>

          <p style="font-size: 14px; margin-bottom: 16px; font-weight: 600;">Subject: Project "${proj.title}"</p>
          
          <div style="font-size: 14px; margin-bottom: 30px; white-space: pre-line;">
            ${cont.terms}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; font-family: var(--font-body); font-size: 13px;">
            <div>
              <p style="border-bottom: 1px solid #000; height: 40px;"></p>
              <strong>Designer Signature</strong><br/>
              Date: ${cont.date}
            </div>
            <div>
              <p style="border-bottom: 1px solid #000; height: 40px; display: flex; align-items: flex-end; font-family: cursive; font-size: 16px; padding-left: 10px;">
                ${cont.status === 'Signed' ? client.contactPerson : ''}
              </p>
              <strong>Client Signature (${cont.status})</strong><br/>
              Date: ${cont.status === 'Signed' ? cont.date : 'Awaiting Signature'}
            </div>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <div style="display: flex; gap: 8px; width: 100%;">
        ${cont.status !== 'Signed' ? `
          <button class="btn btn-primary" id="sign-contract-btn" style="background-color: var(--color-success);">Sign Contract</button>
        ` : '<span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 4px;">✓ Legally Signed</span>'}
        
        <button class="btn btn-secondary" id="print-doc-btn" style="margin-left: auto;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.865 48.865 0 0 0-14.325 0C3.768 7.281 3 8.215 3 9.296v6.454a2.25 2.25 0 0 0 2.25 2.25h1.091M9 10.5h.008v.008H9V10.5Zm3 0h.008v.008H12V10.5Zm3 0h.008v.008H15V10.5Z" /></svg>
          Print PDF
        </button>
        <button class="btn btn-primary" id="modal-close-btn" style="padding: 6px 18px;">Close</button>
      </div>
    `;

    modal.classList.add('active');

    // Print
    document.getElementById('print-doc-btn').addEventListener('click', () => {
      window.print();
    });

    // Close
    const close = () => modal.classList.remove('active');
    document.getElementById('modal-close-btn').addEventListener('click', close);

    // Sign
    const signBtn = document.getElementById('sign-contract-btn');
    if (signBtn) {
      signBtn.addEventListener('click', () => {
        cont.status = 'Signed';
        
        proj.logs.push({
          id: 'log-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          text: `Contract "${cont.title}" signed by client.`
        });

        AppDB.saveProject(proj);
        window.showToast(`Contract signed successfully!`);
        close();

        // Refresh panel
        const activeNav = document.querySelector('.nav-item.active').dataset.view;
        if (activeNav === 'finance') {
          this.renderPanel(document.getElementById('view-finance'));
        } else if (activeNav === 'projects') {
          window.loadProjectDetail(projId);
        }
      });
    }
  }
};
