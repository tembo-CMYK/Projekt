// js/db.js

const DB_KEY = 'projekt_designer_db';

// Palette mappings
export const CATEGORY_THEMES = {
  'Web Design': {
    class: 'unicorn',
    bg: '#E1F8F1',
    text: '#0F5B46',
    border: '#A3E2D1'
  },
  'Branding': {
    class: 'swiss',
    bg: '#F4EFFC',
    text: '#582C96',
    border: '#D9C8F5'
  },
  'General Designs': {
    class: 'tech',
    bg: '#EDF3FF',
    text: '#1E40AF',
    border: '#B3CFFF'
  }
};

const DEFAULT_CLIENTS = [
  {
    id: 'client-1',
    name: 'Baranov Medical',
    contactPerson: 'Dr. Dmitry Baranov',
    email: 'contact@baranov-med.com',
    phone: '+41 22 789 22 11',
    address: 'Rue de Lyon 120, 1203 Geneva, Switzerland',
    notes: 'High-end aesthetic preferred. Very detail-oriented client. Prefers clean, sterile but modern design language.'
  },
  {
    id: 'client-2',
    name: 'IT Crowd Solutions',
    contactPerson: 'Roy Trenneman',
    email: 'roy@itcrowd-solutions.co.uk',
    phone: '+44 20 7946 0958',
    address: '12-18 Reynholm Tower, London, UK',
    notes: 'Wants a rebranding that looks techy but not overly geeky. Prefers purple/violet accents.'
  },
  {
    id: 'client-3',
    name: 'TechArts Media',
    contactPerson: 'Jen Barber',
    email: 'jen@techarts.io',
    phone: '+1 (555) 019-2834',
    address: '500 Howard St, San Francisco, CA, USA',
    notes: 'Creative tech community focusing on artistic prints. General graphic design and abstract prints.'
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Healthcare Landing Page Redesign',
    category: 'Web Design',
    clientId: 'client-1',
    status: 'Active', // Active, Negotiating, Archived
    startDate: '2026-03-01',
    dueDate: '2026-07-25',
    budget: 10000,
    coverUrl: 'assets/web_design.png',
    brief: 'Redesign the primary patient-clinician communication portal. The objective is to create a seamless, accessible experience that fosters trust. High contrast, warm glassmorphic accents, and responsive layout are required.',
    timeline: {
      currentPhase: 'Design', // Discovery, Research, Concept, Design, Revisions, Handover
      phases: [
        {
          name: 'Discovery',
          status: 'Completed', // Pending, In Progress, Completed
          completedDate: '2026-03-10',
          checklist: [
            { id: '1-1', text: 'Initial alignment meeting with Dr. Baranov', done: true },
            { id: '1-2', text: 'Document project goals & KPIs', done: true },
            { id: '1-3', text: 'Sign service agreement contract', done: true }
          ]
        },
        {
          name: 'Research',
          status: 'Completed',
          completedDate: '2026-04-05',
          checklist: [
            { id: '2-1', text: 'Analyze old website telemetry & friction points', done: true },
            { id: '2-2', text: 'Create user personas (patients & clinicians)', done: true },
            { id: '2-3', text: 'Competitor design analysis', done: true }
          ]
        },
        {
          name: 'Concept',
          status: 'Completed',
          completedDate: '2026-05-12',
          checklist: [
            { id: '3-1', text: 'Design information architecture map', done: true },
            { id: '3-2', text: 'Create wireframes for desktop and mobile', done: true },
            { id: '3-3', text: 'Align on visual moodboard (mint cyan tints)', done: true }
          ]
        },
        {
          name: 'Design',
          status: 'In Progress',
          completedDate: null,
          checklist: [
            { id: '4-1', text: 'High-fidelity dashboard mockup', done: true },
            { id: '4-2', text: 'Responsive patient portal subpages', done: false },
            { id: '4-3', text: 'Build interactive Figma prototype', done: false },
            { id: '4-4', text: 'Establish design system guidelines & components', done: false }
          ]
        },
        {
          name: 'Revisions',
          status: 'Pending',
          completedDate: null,
          checklist: [
            { id: '5-1', text: 'Review designs with Baranov board', done: false },
            { id: '5-2', text: 'Implement feedback cycle 1', done: false },
            { id: '5-3', text: 'Final client sign-off on design specs', done: false }
          ]
        },
        {
          name: 'Handover',
          status: 'Pending',
          completedDate: null,
          checklist: [
            { id: '6-1', text: 'Export all design assets (SVG, PNG, font files)', done: false },
            { id: '6-2', text: 'Prepare redlines and hand off to dev team', done: false },
            { id: '6-3', text: 'Send final invoice & release assets', done: false }
          ]
        }
      ]
    },
    logs: [
      { id: 'log-1-1', date: '2026-03-02', text: 'Project kick-off. Met with Dr. Baranov and aligned on the medical portal goals.' },
      { id: 'log-1-2', date: '2026-03-10', text: 'Contract signed. Initial 50% deposit generated and sent.' },
      { id: 'log-1-3', date: '2026-04-05', text: 'Research phase concluded. We identified that layout hierarchy was the main issue.' },
      { id: 'log-1-4', date: '2026-05-12', text: 'Concept approved. Wireframes signed off and moodboard styled around clean medical tints.' },
      { id: 'log-1-5', date: '2026-06-20', text: 'Completed the primary high-fidelity home dashboard view in Figma. Sent prototype link.' }
    ],
    assets: {
      prompts: [
        { id: 'pr-1', title: 'Medical Dashboard UI', text: 'Modern patient dashboard portal, clean interface, grid layout, glassmorphic cards with soft gradients, mint green (#E1F8F1) and navy background, high legibility sans-serif font, detailed statistics, medical charts, SVG icons, Figma style, ultra-high quality render' }
      ],
      links: [
        { id: 'ln-1', title: 'Figma File - High Fidelity', url: 'https://figma.com/file/baranov-medical-dashboard' },
        { id: 'ln-2', title: 'Moodboard - Pinterest', url: 'https://pinterest.com/pin/baranov-moodboard-1283' }
      ],
      images: [
        { id: 'img-1', title: 'Dashboard Mockup 1', url: 'assets/web_design.png' }
      ]
    },
    contracts: [
      {
        id: 'cont-1',
        title: 'Service Agreement Contract',
        date: '2026-03-05',
        status: 'Signed', // Draft, Sent, Signed
        terms: 'This agreement governs the design services to be provided by Amanda Smith to Baranov Medical. Standard payment terms apply: 50% upfront deposit, 50% upon project completion and design approval. All original design work is transferred to the client upon final payment.'
      }
    ],
    invoices: [
      {
        id: 'inv-1',
        invoiceNo: 'INV-2026-001',
        date: '2026-03-10',
        dueDate: '2026-03-24',
        status: 'Paid', // Draft, Sent, Paid
        items: [
          { description: '50% Upfront Deposit - Patient Portal Redesign', amount: 5000 }
        ],
        taxRate: 8,
        total: 5400 // with 8% tax
      },
      {
        id: 'inv-2',
        invoiceNo: 'INV-2026-008',
        date: '2026-06-24',
        dueDate: '2026-07-08',
        status: 'Draft',
        items: [
          { description: '50% Final Milestone Handover - Patient Portal Redesign', amount: 5000 }
        ],
        taxRate: 8,
        total: 5400
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'IT Crowd Brand Identity Package',
    category: 'Branding',
    clientId: 'client-2',
    status: 'Negotiating',
    startDate: '2026-06-15',
    dueDate: '2026-09-01',
    budget: 7950,
    coverUrl: 'assets/branding.png',
    brief: 'Complete company rebranding for IT Crowd Solutions. Provide a new scalable logo, typography system, email signature, corporate slide deck, and brand identity guidelines document. Incorporate custom lavender tints.',
    timeline: {
      currentPhase: 'Concept',
      phases: [
        {
          name: 'Discovery',
          status: 'Completed',
          completedDate: '2026-06-18',
          checklist: [
            { id: '2_1-1', text: 'Align with Roy and Moss on visual brand targets', done: true },
            { id: '2_1-2', text: 'Finalize branding brief and sign-off', done: true }
          ]
        },
        {
          name: 'Research',
          status: 'Completed',
          completedDate: '2026-06-22',
          checklist: [
            { id: '2_2-1', text: 'Competitor audit in the IT services sector', done: true },
            { id: '2_2-2', text: 'Collect brand typography inspirations', done: true }
          ]
        },
        {
          name: 'Concept',
          status: 'In Progress',
          completedDate: null,
          checklist: [
            { id: '2_3-1', text: 'Sketch 3 initial logo concepts', done: true },
            { id: '2_3-2', text: 'Digitize logo sketches in vector format', done: false },
            { id: '2_3-3', text: 'Color palette experiments using Switzerland lavender', done: false }
          ]
        },
        {
          name: 'Design',
          status: 'Pending',
          completedDate: null,
          checklist: [
            { id: '2_4-1', text: 'Create stationery and letterhead mockups', done: false },
            { id: '2_4-2', text: 'Email signature template design', done: false }
          ]
        },
        {
          name: 'Revisions',
          status: 'Pending',
          completedDate: null,
          checklist: [
            { id: '2_5-1', text: 'Present logo concepts to IT Crowd team', done: false },
            { id: '2_5-2', text: 'Incorporate design changes', done: false }
          ]
        },
        {
          name: 'Handover',
          status: 'Pending',
          completedDate: null,
          checklist: [
            { id: '2_6-1', text: 'Export corporate logo package (EPS, SVG, PNG)', done: false },
            { id: '2_6-2', text: 'Compile PDF brand book', done: false }
          ]
        }
      ]
    },
    logs: [
      { id: 'log-2-1', date: '2026-06-16', text: 'Kick-off meeting. Roy wants "something retro but futuristic" featuring lavender tones.' },
      { id: 'log-2-2', date: '2026-06-18', text: 'Branding brief locked down. Ready to start research.' },
      { id: 'log-2-3', date: '2026-06-22', text: 'Completed research audit. Created moodboard reflecting retro tech.' }
    ],
    assets: {
      prompts: [
        { id: 'pr-2', title: 'Retro Tech Logo Style', text: 'Minimalist vector logo, retro IT aesthetic, clean curves, monogram letter logo, Switzerland lavender (#F4EFFC) backing, royal purple accents, elegant design style, flat logo mockup, Behance design quality' }
      ],
      links: [
        { id: 'ln-3', title: 'Miro Board - Ideas', url: 'https://miro.com/app/board/itcrowd-rebrand' }
      ],
      images: [
        { id: 'img-2', title: 'Branding Concept', url: 'assets/branding.png' }
      ]
    },
    contracts: [
      {
        id: 'cont-2',
        title: 'Brand Package Proposal',
        date: '2026-06-15',
        status: 'Sent',
        terms: 'Standard branding package deliverables: Logo files, Business cards, Email templates, and Brand Identity PDF. Estimated timeframe: 10 weeks. Budget: $7,950. Invoicing terms: 50% deposit, 50% upon delivery.'
      }
    ],
    invoices: [
      {
        id: 'inv-3',
        invoiceNo: 'INV-2026-015',
        date: '2026-06-18',
        dueDate: '2026-07-02',
        status: 'Sent',
        items: [
          { description: '50% Branding Deposit', amount: 3975 }
        ],
        taxRate: 20,
        total: 4770
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Abstract 3D Poster Series',
    category: 'General Designs',
    clientId: 'client-3',
    status: 'Archived',
    startDate: '2026-01-10',
    dueDate: '2026-02-15',
    budget: 3500,
    coverUrl: 'assets/general_design.png',
    brief: 'Create a series of three abstract 3D artwork files to be printed as editorial wall posters. Theme should reflect tech aesthetics, high precision geometry, and a sky blue layout accent.',
    timeline: {
      currentPhase: 'Handover',
      phases: [
        {
          name: 'Discovery',
          status: 'Completed',
          completedDate: '2026-01-12',
          checklist: [
            { id: '3_1-1', text: 'Discuss art direction with Jen', done: true }
          ]
        },
        {
          name: 'Research',
          status: 'Completed',
          completedDate: '2026-01-15',
          checklist: [
            { id: '3_2-1', text: 'Gather references of 3D geometric abstract arts', done: true }
          ]
        },
        {
          name: 'Concept',
          status: 'Completed',
          completedDate: '2026-01-20',
          checklist: [
            { id: '3_3-1', text: 'Select color palettes (Technical Founder sky blue)', done: true },
            { id: '3_3-2', text: 'Design 3 initial wireframes / blockouts', done: true }
          ]
        },
        {
          name: 'Design',
          status: 'Completed',
          completedDate: '2026-02-05',
          checklist: [
            { id: '3_4-1', text: 'Render high-resolution poster 1 (Cylinder flow)', done: true },
            { id: '3_4-2', text: 'Render poster 2 (Floating cubes)', done: true },
            { id: '3_4-3', text: 'Render poster 3 (Geometric sphere)', done: true }
          ]
        },
        {
          name: 'Revisions',
          status: 'Completed',
          completedDate: '2026-02-10',
          checklist: [
            { id: '3_5-1', text: 'Color corrections for final print', done: true }
          ]
        },
        {
          name: 'Handover',
          status: 'Completed',
          completedDate: '2026-02-15',
          checklist: [
            { id: '3_6-1', text: 'Export CMYK TIFF files for printing', done: true },
            { id: '3_6-2', text: 'Transfer files via Dropbox', done: true }
          ]
        }
      ]
    },
    logs: [
      { id: 'log-3-1', date: '2026-01-11', text: 'Aligned on abstract direction. Light blue accents chosen.' },
      { id: 'log-3-2', date: '2026-02-05', text: 'Completed rendering of all three posters. Files exported at 300dpi.' },
      { id: 'log-3-3', date: '2026-02-15', text: 'Prints approved, files transferred, project closed successfully.' }
    ],
    assets: {
      prompts: [
        { id: 'pr-3', title: 'Abstract 3D Art', text: '3D rendering of floating glossy glass shapes, cylinder flow, pastel spheres, sky blue tint (#EDF3FF) lighting, clean geometry, cinematic studio lighting, high resolution, minimalist editorial aesthetic' }
      ],
      links: [
        { id: 'ln-4', title: 'Artwork Delivery Folder', url: 'https://dropbox.com/sh/techarts-posters-final' }
      ],
      images: [
        { id: 'img-3', title: 'Final Poster Mockup', url: 'assets/general_design.png' }
      ]
    },
    contracts: [
      {
        id: 'cont-3',
        title: 'Copyright Transfer Contract',
        date: '2026-01-12',
        status: 'Signed',
        terms: 'Copyright transfer contract for Poster Series. Amanda Smith transfers print distribution rights to TechArts Media. Amanda Smith retains the right to display the artwork in her portfolio.'
      }
    ],
    invoices: [
      {
        id: 'inv-4',
        invoiceNo: 'INV-2026-002',
        date: '2026-02-15',
        dueDate: '2026-02-15',
        status: 'Paid',
        items: [
          { description: '100% Poster Design Package Payment', amount: 3500 }
        ],
        taxRate: 0,
        total: 3500
      }
    ]
  }
];

const DEFAULT_LIBRARY_ASSETS = [
  {
    id: 'lib-1',
    type: 'prompt',
    title: 'Clean Minimalist UI Dashboard Prompt',
    value: 'Dashboard interface, dark mode, high contrast outline layout, neon cyan highlights, Outfit font, structural glassmorphic elements, 3D icon renders, Figma layout style, high design density, Behance showcase, 8k resolution',
    date: '2026-06-20'
  },
  {
    id: 'lib-2',
    type: 'link',
    title: 'Awwwards Inspiration Directory',
    value: 'https://www.awwwards.com/',
    date: '2026-06-21'
  },
  {
    id: 'lib-3',
    type: 'image',
    title: 'Bento Grid Visual Mockup',
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-22'
  },
  {
    id: 'lib-4',
    type: 'link',
    title: 'Dribbble - Modern UI Inspiration',
    value: 'https://dribbble.com/',
    date: '2026-06-23'
  },
  {
    id: 'lib-5',
    type: 'prompt',
    title: '3D Glassmorphic Icon Design',
    value: '3D glassmorphic icon of a calendar, soft neon pink and translucent purple, highly polished refraction, studio lighting, neutral dark backdrop, Octane render, 4k, transparent background style',
    date: '2026-06-24'
  },
  {
    id: 'lib-6',
    type: 'image',
    title: 'Gradient Mesh Reference Art',
    value: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-24'
  },
  {
    id: 'lib-7',
    type: 'link',
    title: 'Fonts in Use - Typographic references',
    value: 'https://fontsinuse.com/',
    date: '2026-06-24'
  },
  {
    id: 'lib-8',
    type: 'prompt',
    title: 'Brutalist Web Layout Concept',
    value: 'Brutalist web design layout, stark typography, massive bold titles, high-contrast black and white color scheme, absolute grid lines, raw HTML aesthetic, neon green accents, Webflow inspiration style',
    date: '2026-06-24'
  },
  {
    id: 'lib-9',
    type: 'image',
    title: 'Minimalist Workspace Setup',
    value: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-24'
  },
  {
    id: 'lib-10',
    type: 'prompt',
    title: 'Premium Packaging Mockup',
    value: 'Luxurious black perfume bottle packaging mockup, gold foil typography accents, minimalist cosmetics branding, soft studio shadows, textured paper background, photorealistic 3D render',
    date: '2026-06-24'
  }
];

const DEFAULT_PROFILE = {
  name: 'Amanda Smith',
  email: 'amanda@smith-design.com',
  role: 'Professional Account',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  studio: 'Amanda Smith Design Studio'
};

export const AppDB = {
  get() {
    let data = localStorage.getItem(DB_KEY);
    if (!data) {
      this.init();
      data = localStorage.getItem(DB_KEY);
    }
    return JSON.parse(data);
  },

  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  init() {
    const initialData = {
      clients: DEFAULT_CLIENTS,
      projects: DEFAULT_PROJECTS,
      libraryAssets: DEFAULT_LIBRARY_ASSETS,
      profile: DEFAULT_PROFILE
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  },

  getProfile() {
    const db = this.get();
    if (!db.profile) {
      db.profile = {
        name: 'Amanda Smith',
        email: 'amanda@smith-design.com',
        role: 'Professional Account',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        studio: 'Amanda Smith Design Studio'
      };
      this.save(db);
    }
    return db.profile;
  },

  updateProfile(profileData) {
    const db = this.get();
    db.profile = { ...this.getProfile(), ...profileData };
    this.save(db);
    return db.profile;
  },

  // Library Asset CRUD
  getLibraryAssets() {
    let db = this.get();
    if (!db.libraryAssets || db.libraryAssets.length < 5) {
      db.libraryAssets = DEFAULT_LIBRARY_ASSETS;
      this.save(db);
    }
    return db.libraryAssets;
  },

  addLibraryAsset(type, title, value) {
    const db = this.get();
    if (!db.libraryAssets) db.libraryAssets = [];
    const newAsset = {
      id: 'lib-' + Date.now(),
      type,
      title,
      value,
      date: new Date().toISOString().split('T')[0]
    };
    db.libraryAssets.push(newAsset);
    this.save(db);
    return newAsset;
  },

  deleteLibraryAsset(id) {
    const db = this.get();
    if (!db.libraryAssets) return;
    db.libraryAssets = db.libraryAssets.filter(a => a.id !== id);
    this.save(db);
  },

  // Project CRUD
  getProjects() {
    const db = this.get();
    let changed = false;
    if (db.projects) {
      db.projects.forEach(p => {
        if (p.timeline && p.timeline.phases) {
          p.timeline.phases.forEach(ph => {
            if (ph.checklist) {
              ph.checklist.forEach(it => {
                if (!it.status) {
                  it.status = it.done ? 'done' : 'todo';
                  changed = true;
                }
              });
            }
          });
        }
      });
    }
    if (changed) {
      this.save(db);
    }
    return db.projects;
  },

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id);
  },

  saveProject(project) {
    const db = this.get();
    const idx = db.projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      db.projects[idx] = project;
    } else {
      db.projects.push(project);
    }
    this.save(db);
    return project;
  },

  deleteProject(id) {
    const db = this.get();
    db.projects = db.projects.filter(p => p.id !== id);
    this.save(db);
  },

  createProject(title, category, clientId, budget, dueDate, brief) {
    const newProj = {
      id: 'proj-' + Date.now(),
      title,
      category,
      clientId,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      budget: parseFloat(budget) || 0,
      coverUrl: category === 'Web Design' ? 'assets/web_design.png' : (category === 'Branding' ? 'assets/branding.png' : 'assets/general_design.png'),
      brief,
      timeline: {
        currentPhase: 'Discovery',
        phases: [
          { name: 'Discovery', status: 'In Progress', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-1', text: 'Kickoff meeting with client', done: false }] },
          { name: 'Research', status: 'Pending', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-2', text: 'Competitor analysis', done: false }] },
          { name: 'Concept', status: 'Pending', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-3', text: 'Visual direction and sketch ideas', done: false }] },
          { name: 'Design', status: 'Pending', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-4', text: 'Design production elements', done: false }] },
          { name: 'Revisions', status: 'Pending', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-5', text: 'Review and revise with client', done: false }] },
          { name: 'Handover', status: 'Pending', completedDate: null, checklist: [{ id: 'cl-' + Date.now() + '-6', text: 'Export and deliver assets', done: false }] }
        ]
      },
      logs: [
        { id: 'log-' + Date.now() + '-1', date: new Date().toISOString().split('T')[0], text: `Project created and categorized under ${category}.` }
      ],
      assets: {
        prompts: [],
        links: [],
        images: []
      },
      contracts: [],
      invoices: []
    };
    const db = this.get();
    db.projects.push(newProj);
    this.save(db);
    return newProj;
  },

  // Client CRUD
  getClients() {
    return this.get().clients;
  },

  getClientById(id) {
    return this.getClients().find(c => c.id === id);
  },

  createClient(name, contactPerson, email, phone, address, notes) {
    const newClient = {
      id: 'client-' + Date.now(),
      name,
      contactPerson,
      email,
      phone,
      address,
      notes
    };
    const db = this.get();
    db.clients.push(newClient);
    this.save(db);
    return newClient;
  },

  updateClient(clientId, clientData) {
    const db = this.get();
    const idx = db.clients.findIndex(c => c.id === clientId);
    if (idx !== -1) {
      db.clients[idx] = { ...db.clients[idx], ...clientData };
      this.save(db);
    }
  },

  updateClientBrief(clientId, notes) {
    this.updateClient(clientId, { notes });
  },

  updateChecklistTaskStatus(projectId, phaseIdx, taskId, newStatus) {
    const proj = this.getProjectById(projectId);
    if (!proj) return;
    
    const task = proj.timeline.phases[phaseIdx].checklist.find(t => t.id === taskId);
    if (task) {
      const oldStatus = task.status || (task.done ? 'done' : 'todo');
      task.status = newStatus;
      task.done = (newStatus === 'done');
      
      // Log update
      proj.logs.push({
        id: 'log-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        text: `Moved task "${task.text}" to ${newStatus}`
      });
      
      this.saveProject(proj);
    }
  },

  // Project Level Additions
  addAsset(projectId, type, data) {
    const proj = this.getProjectById(projectId);
    if (!proj) return;
    
    const assetId = 'asset-' + Date.now();
    if (type === 'prompt') {
      proj.assets.prompts.push({ id: assetId, title: data.title, text: data.text });
    } else if (type === 'link') {
      proj.assets.links.push({ id: assetId, title: data.title, url: data.url });
    } else if (type === 'image') {
      proj.assets.images.push({ id: assetId, title: data.title, url: data.url });
    }
    
    // Add log
    proj.logs.push({
      id: 'log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      text: `Added new ${type} asset: "${data.title}"`
    });
    
    this.saveProject(proj);
  },

  addContract(projectId, title, terms) {
    const proj = this.getProjectById(projectId);
    if (!proj) return;

    const contract = {
      id: 'cont-' + Date.now(),
      title,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      terms
    };
    
    proj.contracts.push(contract);
    proj.logs.push({
      id: 'log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      text: `Generated draft contract: "${title}"`
    });
    
    this.saveProject(proj);
    return contract;
  },

  addInvoice(projectId, invoiceNo, items, taxRate, status = 'Draft', issueDate = null, dueDate = null, discount = 0, currency = 'USD') {
    const proj = this.getProjectById(projectId);
    if (!proj) return;

    const parsedItems = items.map(it => {
      const qty = parseInt(it.qty) || 1;
      const cost = parseFloat(it.cost) || parseFloat(it.amount) || 0;
      const amount = (it.amount !== undefined && it.amount !== null) ? parseFloat(it.amount) : (qty * cost);
      return {
        description: it.description,
        qty,
        cost,
        amount
      };
    });

    const subtotal = parsedItems.reduce((acc, item) => acc + (item.amount || 0), 0);
    const tax = subtotal * ((parseFloat(taxRate) || 0) / 100);
    const total = Math.max(0, subtotal + tax - (parseFloat(discount) || 0));

    const invoice = {
      id: 'inv-' + Date.now(),
      invoiceNo,
      date: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
      items: parsedItems,
      taxRate: parseFloat(taxRate) || 0,
      discount: parseFloat(discount) || 0,
      currency: currency || 'USD',
      total: Math.round(total * 100) / 100
    };

    proj.invoices.push(invoice);
    proj.logs.push({
      id: 'log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      text: `Generated invoice ${invoiceNo} (${status}) for $${invoice.total}`
    });

    this.saveProject(proj);
    return invoice;
  }
};
