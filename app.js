/**
 * Chirpdesk Application Controller
 * Handles routing, view transitions, live chat simulation, multi-tenant workspace switching,
 * theme toggling, interactive tour, and real-time event simulation.
 */

(function () {
  'use strict';

  // State
  let currentWorkspace = null;
  let activeContactId = 'c-101';
  let activeInboxFilter = 'all';
  let tourStep = 1;

  // DOM Elements
  const el = {
    // Nav & Sidebar
    navItems: document.querySelectorAll('.nav-item'),
    appSidebar: document.getElementById('appSidebar'),
    mobileDrawerOverlay: document.getElementById('mobileDrawerOverlay'),
    openDrawerBtn: document.getElementById('openDrawerBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    contactsExpandBtn: document.getElementById('contactsExpandBtn'),
    contactsChevron: document.getElementById('contactsChevron'),
    contactsSubmenu: document.getElementById('contactsSubmenu'),
    sidebarWorkspaceBadge: document.getElementById('sidebarWorkspaceBadge'),
    sidebarStoreName: document.getElementById('sidebarStoreName'),
    sidebarUnreadBadge: document.getElementById('sidebarUnreadBadge'),
    sidebarPlanName: document.getElementById('sidebarPlanName'),
    sidebarCreditsText: document.getElementById('sidebarCreditsText'),
    sidebarCreditsBar: document.getElementById('sidebarCreditsBar'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeToggleIcon: document.getElementById('themeToggleIcon'),
    devModalTrigger: document.getElementById('devModalTrigger'),

    // Top Bar
    pageTitle: document.getElementById('pageTitle'),
    pageSubtitle: document.getElementById('pageSubtitle'),
    topbarWorkspaceName: document.getElementById('topbarWorkspaceName'),
    workspaceSwitcherBtn: document.getElementById('workspaceSwitcherBtn'),
    workspaceDropdown: document.getElementById('workspaceDropdown'),
    notificationBellBtn: document.getElementById('notificationBellBtn'),
    notificationPopover: document.getElementById('notificationPopover'),
    takeTourBtn: document.getElementById('takeTourBtn'),
    userAvatarInitials: document.getElementById('userAvatarInitials'),
    wsCheckSharma: document.getElementById('wsCheck-sharma'),
    wsCheckGupta: document.getElementById('wsCheck-gupta'),

    // Views
    views: {
      overview: document.getElementById('viewOverview'),
      inbox: document.getElementById('viewInbox'),
      broadcasts: document.getElementById('viewBroadcasts'),
      'rate-alerts': document.getElementById('viewRateAlerts'),
      'ai-assistant': document.getElementById('viewAiAssistant'),
      workflows: document.getElementById('viewWorkflows'),
      contacts: document.getElementById('viewContacts'),
      subscribers: document.getElementById('viewContacts'), // Reuses contacts view
      receipts: document.getElementById('viewWorkflows'),  // Reuses workflow view
      templates: document.getElementById('viewBroadcasts'), // Reuses broadcasts view
      team: document.getElementById('viewSettings'),       // Reuses settings/team view
      settings: document.getElementById('viewSettings')
    },

    // Overview Elements
    overviewUserName: document.getElementById('overviewUserName'),
    overviewHealthStatus: document.getElementById('overviewHealthStatus'),
    overviewCreditsPill: document.getElementById('overviewCreditsPill'),
    kpiQueued: document.getElementById('kpiQueued'),
    kpiSent: document.getElementById('kpiSent'),
    kpiDelivered: document.getElementById('kpiDelivered'),
    kpiRead: document.getElementById('kpiRead'),
    kpiFailed: document.getElementById('kpiFailed'),
    rateRingDelivered: document.getElementById('rateRingDelivered'),
    rateRingRead: document.getElementById('rateRingRead'),
    rateRingReplied: document.getElementById('rateRingReplied'),
    rateRingFailed: document.getElementById('rateRingFailed'),
    connStatusBadge: document.getElementById('connStatusBadge'),
    connQuality: document.getElementById('connQuality'),
    connPhone: document.getElementById('connPhone'),
    connLimit: document.getElementById('connLimit'),
    queueTotalJobs: document.getElementById('queueTotalJobs'),
    queuePending: document.getElementById('queuePending'),
    queueProcessed: document.getElementById('queueProcessed'),
    queueAvgTime: document.getElementById('queueAvgTime'),
    tileCountInitiated: document.getElementById('tileCount-initiated'),
    tileCountSent: document.getElementById('tileCount-sent'),
    tileCountPending: document.getElementById('tileCount-pending'),
    tileCountDelivered: document.getElementById('tileCount-delivered'),
    tileCountRead: document.getElementById('tileCount-read'),
    tileCountReplied: document.getElementById('tileCount-replied'),
    tileCountFailed: document.getElementById('tileCount-failed'),
    overviewRateScheduled: document.getElementById('overviewRateScheduled'),
    overviewRatesContainer: document.getElementById('overviewRatesContainer'),
    overviewAiRate: document.getElementById('overviewAiRate'),
    overviewNeedsHumanBadge: document.getElementById('overviewNeedsHumanBadge'),
    overviewActivityList: document.getElementById('overviewActivityList'),

    // Inbox Elements
    inboxContactList: document.getElementById('inboxContactList'),
    inboxContactSearch: document.getElementById('inboxContactSearch'),
    chatActiveAvatar: document.getElementById('chatActiveAvatar'),
    chatActiveName: document.getElementById('chatActiveName'),
    chatActivePhone: document.getElementById('chatActivePhone'),
    chatAiToggle: document.getElementById('chatAiToggle'),
    chatMessagesContainer: document.getElementById('chatMessagesContainer'),
    chatComposerForm: document.getElementById('chatComposerForm'),
    chatMessageInput: document.getElementById('chatMessageInput'),
    detailsAvatar: document.getElementById('detailsAvatar'),
    detailsName: document.getElementById('detailsName'),
    detailsPhone: document.getElementById('detailsPhone'),
    detailsCity: document.getElementById('detailsCity'),
    detailsTagsContainer: document.getElementById('detailsTagsContainer'),
    detailsAssignSelect: document.getElementById('detailsAssignSelect'),
    detailsNotesInput: document.getElementById('detailsNotesInput'),

    // Rate Alerts Elements
    rateAlertsEditorTbody: document.getElementById('rateAlertsEditorTbody'),
    liveRatePreviewText: document.getElementById('liveRatePreviewText'),

    // Broadcasts Elements
    broadcastHistoryTbody: document.getElementById('broadcastHistoryTbody'),
    dispatchBroadcastBtn: document.getElementById('dispatchBroadcastBtn'),

    // Contacts Table
    contactsTableTbody: document.getElementById('contactsTableTbody'),

    // Settings
    settingsWabaId: document.getElementById('settingsWabaId'),
    settingsPhoneId: document.getElementById('settingsPhoneId'),
    settingsLegalName: document.getElementById('settingsLegalName'),
    settingsGstin: document.getElementById('settingsGstin'),
    settingsCity: document.getElementById('settingsCity'),

    // Modals
    tourModal: document.getElementById('tourModal'),
    tourStepTitle: document.getElementById('tourStepTitle'),
    tourStepContent: document.getElementById('tourStepContent'),
    tourNextBtn: document.getElementById('tourNextBtn'),
    tourPrevBtn: document.getElementById('tourPrevBtn'),
    closeTourModalBtn: document.getElementById('closeTourModalBtn'),
    devModal: document.getElementById('devModal'),
    closeDevModalBtn: document.getElementById('closeDevModalBtn'),
    devModalOkBtn: document.getElementById('devModalOkBtn'),
    devWorkspaceId: document.getElementById('devWorkspaceId')
  };

  /**
   * Initialize Application
   */
  async function init() {
    initTheme();
    setupEventListeners();
    await switchWorkspace(window.chirpdesk.getActiveWorkspaceId(), false);

    // Check URL hash for initial route (e.g. #rate-alerts)
    const hash = window.location.hash.replace('#', '');
    if (hash && el.views[hash]) {
      navigate(hash);
    } else {
      navigate('overview');
    }

    // Subscribe to realtime data events
    window.chirpdesk.on('rate_updated', () => renderRateAlerts());
    window.chirpdesk.on('new_message', () => renderChatMessages());
    window.chirpdesk.on('contact_status_changed', () => {
      renderInboxContacts();
      renderChatHeader();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Theme initialization & toggling
   */
  function initTheme() {
    const saved = localStorage.getItem('chirpdesk_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      if (el.themeToggleIcon) el.themeToggleIcon.setAttribute('data-lucide', 'sun');
    } else {
      document.documentElement.classList.remove('dark');
      if (el.themeToggleIcon) el.themeToggleIcon.setAttribute('data-lucide', 'moon');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('chirpdesk_theme', isDark ? 'dark' : 'light');
    if (el.themeToggleIcon) {
      el.themeToggleIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  /**
   * Route & View Navigation
   */
  function navigate(viewName, subParam = null) {
    if (!el.views[viewName]) viewName = 'overview';

    // Hide all views
    Object.values(el.views).forEach(v => {
      if (v) v.classList.add('hidden');
    });

    // Show target view
    el.views[viewName].classList.remove('hidden');

    // Update active state in sidebar nav items
    el.navItems.forEach(btn => {
      const target = btn.getAttribute('data-view');
      const sub = btn.getAttribute('data-sub');
      if (target === viewName && (!sub || sub === subParam)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Topbar Title
    const titles = {
      overview: { title: 'Overview', sub: 'Realtime shop metrics & WhatsApp performance' },
      inbox: { title: 'Shared Team Inbox', sub: 'Multi-agent live WhatsApp chat with 24/7 AI handoff' },
      broadcasts: { title: 'Broadcast Campaigns', sub: 'Meta Cloud API high-delivery bulk notifications' },
      'rate-alerts': { title: "Today's Rate Alerts", sub: 'Daily bullion & grocery price broadcasts' },
      'ai-assistant': { title: 'Hinglish AI Assistant', sub: 'Natural language bot & shop knowledge base' },
      workflows: { title: 'Visual Workflows', sub: 'Order receipts, payment reminders & escalations' },
      contacts: { title: 'Customer Directory', sub: 'Subscribers, opt-ins & custom tags' },
      settings: { title: 'Workspace Settings', sub: 'WABA credentials, webhooks & GST profile' }
    };

    const info = titles[viewName] || { title: 'Chirpdesk', sub: 'WhatsApp AI Automation' };
    el.pageTitle.textContent = info.title;
    el.pageSubtitle.textContent = info.sub;

    window.location.hash = viewName;
    closeMobileDrawer();

    // Handle view-specific initializations
    if (viewName === 'inbox') {
      if (subParam) {
        setInboxFilter(subParam);
      }
      renderInboxContacts();
      renderChatMessages();
    } else if (viewName === 'rate-alerts') {
      renderRateAlerts();
    } else if (viewName === 'broadcasts') {
      renderBroadcasts();
    } else if (viewName === 'contacts') {
      renderContactsTable();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Multi-Tenant Workspace Switching
   */
  async function switchWorkspace(wsId, shouldNotify = true) {
    currentWorkspace = window.chirpdesk.setWorkspace(wsId);
    if (!currentWorkspace) return;

    // Update Top Bar & Sidebar
    el.topbarWorkspaceName.textContent = currentWorkspace.name;
    el.sidebarStoreName.textContent = currentWorkspace.name;
    el.sidebarWorkspaceBadge.textContent = wsId === 'ws-sharma-jewellers' ? 'Jeweller' : 'Kirana';

    if (wsId === 'ws-sharma-jewellers') {
      el.overviewUserName.textContent = 'Rajesh Sharma';
      el.userAvatarInitials.textContent = 'RS';
      el.wsCheckSharma.classList.remove('hidden');
      el.wsCheckGupta.classList.add('hidden');
      activeContactId = 'c-101';
    } else {
      el.overviewUserName.textContent = 'Amit Gupta';
      el.userAvatarInitials.textContent = 'AG';
      el.wsCheckSharma.classList.add('hidden');
      el.wsCheckGupta.classList.remove('hidden');
      activeContactId = 'cg-201';
    }

    el.sidebarPlanName.textContent = currentWorkspace.plan;
    el.sidebarCreditsText.textContent = `${currentWorkspace.creditsLeft.toLocaleString()} / ${currentWorkspace.creditsTotal.toLocaleString()}`;
    const pct = Math.round((currentWorkspace.creditsLeft / currentWorkspace.creditsTotal) * 100);
    el.sidebarCreditsBar.style.width = `${pct}%`;
    el.overviewCreditsPill.textContent = `${currentWorkspace.creditsLeft.toLocaleString()} Credits Left`;
    el.overviewHealthStatus.textContent = currentWorkspace.healthStatus;

    if (el.devWorkspaceId) el.devWorkspaceId.textContent = currentWorkspace.id;

    // Refresh Overview Data
    await renderOverview();
    await renderRateAlerts();
    await renderBroadcasts();
    await renderContactsTable();
    await renderSettings();

    // Close dropdown
    el.workspaceDropdown.classList.add('hidden');

    if (shouldNotify) {
      showToast(`Switched workspace to ${currentWorkspace.name}`);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Render Overview Page KPIs & Sections
   */
  async function renderOverview() {
    const kpi = await window.chirpdesk.getKpi();
    const queue = await window.chirpdesk.getQueueHealth();
    const rates = await window.chirpdesk.getRateAlerts();
    const activity = await window.chirpdesk.getRecentActivity();

    // KPI row
    el.kpiQueued.textContent = kpi.queued.toLocaleString();
    el.kpiSent.textContent = kpi.sent.toLocaleString();
    el.kpiDelivered.textContent = kpi.delivered.toLocaleString();
    el.kpiRead.textContent = kpi.read.toLocaleString();
    el.kpiFailed.textContent = kpi.failed.toLocaleString();

    // Conversion Rings
    el.rateRingDelivered.textContent = kpi.deliveredRate;
    el.rateRingRead.textContent = kpi.readRate;
    el.rateRingReplied.textContent = kpi.repliedRate;
    el.rateRingFailed.textContent = kpi.failedRate;

    // WhatsApp Connection details
    el.connQuality.textContent = currentWorkspace.qualityRating;
    el.connPhone.textContent = `${currentWorkspace.phone} • Verified`;
    el.connLimit.textContent = currentWorkspace.messagingLimit;

    // Queue Health stat boxes
    el.queueTotalJobs.textContent = queue.totalJobs.toLocaleString();
    el.queuePending.textContent = queue.pending.toLocaleString();
    el.queueProcessed.textContent = queue.processed.toLocaleString();
    el.queueAvgTime.textContent = queue.avgProcessTime;

    // Queue Status Tiles
    if (queue.statuses) {
      queue.statuses.forEach(s => {
        const id = 'tileCount-' + s.label.toLowerCase();
        const tile = document.getElementById(id);
        if (tile) tile.textContent = s.count.toLocaleString();
      });
    }

    // Today's Rate Alerts Card
    el.overviewRateScheduled.textContent = `Next scheduled send: ${rates.nextScheduledTime} • ${rates.recipientCount} Subscribed`;
    renderOverviewRateItems(rates.items);

    // AI Resolution
    el.overviewAiRate.textContent = kpi.aiResolutionRate;
    el.overviewNeedsHumanBadge.textContent = `${kpi.needsHumanCount} chats waiting for your staff`;
    el.sidebarUnreadBadge.textContent = kpi.needsHumanCount;

    // Recent Activity Feed
    renderActivityFeed(activity);
  }

  function renderOverviewRateItems(items) {
    if (!el.overviewRatesContainer || !items) return;
    el.overviewRatesContainer.innerHTML = items.map(item => `
      <div class="p-3 bg-canvas/70 rounded-brand-sm border border-card-border space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted truncate">${item.name}</span>
          <span class="text-[10px] font-bold ${item.trend === 'up' ? 'text-status-success' : (item.trend === 'down' ? 'text-status-danger' : 'text-muted')}">
            ${item.change}
          </span>
        </div>
        <p class="text-lg font-extrabold text-charcoal">${item.rate}</p>
        <span class="text-[10px] text-muted block">${item.unit}</span>
      </div>
    `).join('');
  }

  function renderActivityFeed(activity) {
    if (!el.overviewActivityList || !activity) return;
    el.overviewActivityList.innerHTML = activity.map(item => `
      <div class="p-3 bg-canvas/40 rounded-brand-sm border border-card-border flex items-start justify-between gap-3 text-xs">
        <div class="flex items-start gap-2.5">
          <div class="w-7 h-7 rounded-full bg-slate-subtle text-slate-accent flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="${item.type === 'broadcast' ? 'send' : (item.type === 'chat' ? 'message-circle' : 'activity')}" class="w-3.5 h-3.5"></i>
          </div>
          <div>
            <p class="font-bold text-charcoal">${item.title}</p>
            <p class="text-muted text-[11px] mt-0.5">${item.desc}</p>
          </div>
        </div>
        <span class="text-[10px] text-muted shrink-0">${item.time}</span>
      </div>
    `).join('');
  }

  /**
   * Inbox & Live Chat Module
   */
  async function renderInboxContacts() {
    if (!el.inboxContactList) return;
    const contacts = await window.chirpdesk.getContacts(activeInboxFilter);

    if (contacts.length === 0) {
      el.inboxContactList.innerHTML = `
        <div class="p-6 text-center text-xs text-muted">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          <p class="font-bold">No conversations found</p>
          <p class="text-[11px]">All caught up with this filter.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    el.inboxContactList.innerHTML = contacts.map(c => `
      <div class="contact-item p-3 cursor-pointer hover:bg-canvas transition ${c.id === activeContactId ? 'bg-canvas border-l-4 border-slate-accent' : ''}" data-id="${c.id}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-slate-accent text-offwhite flex items-center justify-center text-xs font-bold shrink-0">
              ${c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div class="truncate">
              <p class="text-xs font-bold text-charcoal truncate">${c.name}</p>
              <p class="text-[11px] text-muted truncate">${c.notes || c.phone}</p>
            </div>
          </div>
          <span class="text-[9px] text-muted shrink-0">${c.lastActive}</span>
        </div>
        <div class="mt-2 flex items-center justify-between text-[10px]">
          <span class="px-1.5 py-0.2 rounded font-semibold ${c.status === 'needs_human' ? 'bg-tan-subtle text-tan-deep border border-tan-accent/30' : 'bg-slate-subtle text-slate-accent'}">
            ${c.status === 'needs_human' ? 'Needs Human' : 'AI Handled'}
          </span>
          <span class="text-muted font-medium">${c.assignedTo || 'Unassigned'}</span>
        </div>
      </div>
    `).join('');

    // Attach click handlers to contact cards
    document.querySelectorAll('.contact-item').forEach(card => {
      card.addEventListener('click', () => {
        activeContactId = card.getAttribute('data-id');
        renderInboxContacts();
        renderChatHeader();
        renderChatMessages();
      });
    });

    renderChatHeader();
    if (window.lucide) window.lucide.createIcons();
  }

  async function renderChatHeader() {
    const contacts = await window.chirpdesk.getContacts('all');
    const contact = contacts.find(c => c.id === activeContactId) || contacts[0];
    if (!contact) return;

    el.chatActiveAvatar.textContent = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    el.chatActiveName.textContent = contact.name;
    el.chatActivePhone.textContent = `${contact.phone} • ${contact.city || 'Verified'}`;
    el.chatAiToggle.checked = (contact.status !== 'needs_human');

    // Right details panel
    el.detailsAvatar.textContent = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    el.detailsName.textContent = contact.name;
    el.detailsPhone.textContent = contact.phone;
    el.detailsCity.textContent = contact.city || 'India';
    el.detailsNotesInput.value = contact.notes || '';

    if (contact.tags && el.detailsTagsContainer) {
      el.detailsTagsContainer.innerHTML = contact.tags.map(t => `
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-tan-subtle text-tan-deep border border-tan-accent/40">${t}</span>
      `).join('');
    }
  }

  async function renderChatMessages() {
    if (!el.chatMessagesContainer) return;
    const messages = await window.chirpdesk.getMessages(activeContactId);

    if (messages.length === 0) {
      el.chatMessagesContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-muted text-xs space-y-1">
          <i data-lucide="message-square" class="w-8 h-8 opacity-40"></i>
          <p class="font-bold">No messages yet</p>
          <p class="text-[11px]">Type below to send a WhatsApp message.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    el.chatMessagesContainer.innerHTML = `
      <div class="text-center my-2">
        <span class="px-3 py-1 rounded-full bg-card border border-card-border text-[10px] font-bold text-muted uppercase">
          Today
        </span>
      </div>
    ` + messages.map(m => {
      if (m.type === 'system_event') {
        return `
          <div class="p-2.5 rounded-brand-sm bg-tan-subtle/80 border border-tan-accent/30 text-[11px] text-tan-deep flex items-center gap-2">
            <i data-lucide="shield-alert" class="w-4 h-4 shrink-0 text-tan-accent"></i>
            <span>${m.text}</span>
          </div>
        `;
      }

      const isMe = m.sender === 'agent' || m.sender === 'ai';
      return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[85%] sm:max-w-[75%] p-3 rounded-brand-sm ${isMe ? (m.sender === 'ai' ? 'bg-slate-subtle border border-slate-accent/30' : 'bg-card border border-slate-accent/40') : 'bg-card border border-card-border'} shadow-xs">
            <p class="text-charcoal leading-relaxed whitespace-pre-line">${m.text}</p>
            <div class="flex items-center justify-end gap-1 text-[9px] text-muted mt-1.5">
              <span>${m.time}</span>
              ${m.sender === 'ai' ? '<span class="font-bold text-slate-accent">• AI Assistant</span>' : ''}
              ${isMe ? '<i data-lucide="check-check" class="w-3.5 h-3.5 text-slate-accent"></i>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Auto-scroll to bottom
    el.chatMessagesContainer.scrollTop = el.chatMessagesContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }

  function setInboxFilter(filter) {
    activeInboxFilter = filter;
    document.querySelectorAll('.inbox-filter-tab').forEach(t => {
      if (t.getAttribute('data-filter') === filter) {
        t.className = 'inbox-filter-tab active px-3 py-1 rounded-full bg-slate-accent text-offwhite';
      } else {
        t.className = 'inbox-filter-tab px-3 py-1 rounded-full text-muted hover:text-charcoal hover:bg-canvas';
      }
    });
    renderInboxContacts();
  }

  /**
   * Rate Alerts Page Logic
   */
  async function renderRateAlerts() {
    const alerts = await window.chirpdesk.getRateAlerts();
    if (!el.rateAlertsEditorTbody || !alerts) return;

    el.rateAlertsEditorTbody.innerHTML = alerts.items.map(item => `
      <tr class="hover:bg-canvas/50 transition">
        <td class="py-3 px-3 font-bold text-charcoal">${item.name}</td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-1">
            <input 
              type="text" 
              class="rate-input w-28 px-2 py-1 bg-canvas rounded border border-card-border font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-tan-accent"
              value="${item.rate}"
              data-id="${item.id}"
            >
          </div>
        </td>
        <td class="py-3 px-3 text-muted">${item.unit}</td>
        <td class="py-3 px-3 font-semibold ${item.trend === 'up' ? 'text-status-success' : 'text-status-danger'}">
          ${item.change}
        </td>
        <td class="py-3 px-3">
          <button class="save-single-rate-btn px-2.5 py-1 rounded bg-slate-accent text-offwhite text-[11px] font-bold hover:bg-slate-hover" data-id="${item.id}">
            Save
          </button>
        </td>
      </tr>
    `).join('');

    // Attach inline save events
    document.querySelectorAll('.save-single-rate-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const input = document.querySelector(`.rate-input[data-id="${id}"]`);
        if (input) {
          await window.chirpdesk.updateRateAlertItem(id, input.value);
          showToast(`Updated ${id} to ${input.value}`);
          updateLiveRatePreview();
        }
      });
    });

    updateLiveRatePreview();
  }

  async function updateLiveRatePreview() {
    const alerts = await window.chirpdesk.getRateAlerts();
    if (!el.liveRatePreviewText || !alerts) return;

    const formattedLines = alerts.items.map(i => `• ${i.name}: ${i.rate} ${i.unit} (${i.change})`).join('\n');
    el.liveRatePreviewText.textContent = `🌟 *${currentWorkspace.name.toUpperCase()} - DAILY RATES* 🌟\nDate: 24 Nov 2026\n\n${formattedLines}\n\n_100% BIS Hallmarked. Visit our showroom or reply 1 for digital catalogue._`;
  }

  /**
   * Broadcasts Page Logic
   */
  async function renderBroadcasts() {
    const list = await window.chirpdesk.getBroadcasts();
    if (!el.broadcastHistoryTbody) return;

    el.broadcastHistoryTbody.innerHTML = list.map(b => `
      <tr class="hover:bg-canvas/50 transition">
        <td class="py-3 px-4 font-bold text-charcoal">${b.name}</td>
        <td class="py-3 px-4 text-muted font-mono text-[11px]">${b.templateName}</td>
        <td class="py-3 px-4 font-bold text-charcoal">${b.audience}</td>
        <td class="py-3 px-4 text-status-success font-semibold">${b.delivered}</td>
        <td class="py-3 px-4 text-tan-deep font-semibold">${b.read}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'Completed' ? 'bg-status-success/20 text-status-success' : 'bg-tan-subtle text-tan-deep'}">
            ${b.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Contacts Table Logic
   */
  async function renderContactsTable() {
    const contacts = await window.chirpdesk.getContacts('all');
    if (!el.contactsTableTbody) return;

    el.contactsTableTbody.innerHTML = contacts.map(c => `
      <tr class="hover:bg-canvas/50 transition">
        <td class="py-3 px-4 font-bold text-charcoal">${c.name}</td>
        <td class="py-3 px-4 font-mono text-muted">${c.phone}</td>
        <td class="py-3 px-4 text-charcoal">${c.city || '—'}</td>
        <td class="py-3 px-4">
          <div class="flex flex-wrap gap-1">
            ${(c.tags || []).map(t => `<span class="px-1.5 py-0.2 rounded bg-card border border-card-border text-[9px] font-bold">${t}</span>`).join('')}
          </div>
        </td>
        <td class="py-3 px-4 text-muted">${c.assignedTo || 'AI Bot'}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'needs_human' ? 'bg-tan-subtle text-tan-deep border border-tan-accent/40' : 'bg-status-success/20 text-status-success'}">
            ${c.status === 'needs_human' ? 'Needs Human' : 'Active'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Settings Page Logic
   */
  async function renderSettings() {
    if (!currentWorkspace) return;
    if (el.settingsWabaId) el.settingsWabaId.value = `${currentWorkspace.wabaId} (Verified)`;
    if (el.settingsPhoneId) el.settingsPhoneId.value = `${currentWorkspace.phoneNumberId} (Active)`;
    if (el.settingsLegalName) el.settingsLegalName.textContent = currentWorkspace.legalName;
    if (el.settingsGstin) el.settingsGstin.textContent = currentWorkspace.gstin;
    if (el.settingsCity) el.settingsCity.textContent = currentWorkspace.city;
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Nav Click Handlers
    el.navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        const sub = btn.getAttribute('data-sub');
        navigate(view, sub);
      });
    });

    // Expandable Contacts Submenu
    if (el.contactsExpandBtn) {
      el.contactsExpandBtn.addEventListener('click', () => {
        const isHidden = el.contactsSubmenu.classList.contains('hidden');
        if (isHidden) {
          el.contactsSubmenu.classList.remove('hidden');
          el.contactsChevron.style.transform = 'rotate(180deg)';
        } else {
          el.contactsSubmenu.classList.add('hidden');
          el.contactsChevron.style.transform = 'rotate(0deg)';
        }
      });
    }

    // Mobile Drawer
    if (el.openDrawerBtn) el.openDrawerBtn.addEventListener('click', openMobileDrawer);
    if (el.closeDrawerBtn) el.closeDrawerBtn.addEventListener('click', closeMobileDrawer);
    if (el.mobileDrawerOverlay) el.mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

    // Dark Mode Toggle
    if (el.themeToggleBtn) el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Workspace Switcher Dropdown
    if (el.workspaceSwitcherBtn) {
      el.workspaceSwitcherBtn.addEventListener('click', () => {
        el.workspaceDropdown.classList.toggle('hidden');
      });
    }

    document.querySelectorAll('.workspace-select-item').forEach(item => {
      item.addEventListener('click', () => {
        const ws = item.getAttribute('data-ws');
        switchWorkspace(ws);
      });
    });

    // Notifications popover
    if (el.notificationBellBtn) {
      el.notificationBellBtn.addEventListener('click', () => {
        el.notificationPopover.classList.toggle('hidden');
      });
    }

    // Developer API modal
    if (el.devModalTrigger) {
      el.devModalTrigger.addEventListener('click', () => {
        el.devModal.classList.remove('hidden');
      });
    }
    if (el.closeDevModalBtn) el.closeDevModalBtn.addEventListener('click', () => el.devModal.classList.add('hidden'));
    if (el.devModalOkBtn) el.devModalOkBtn.addEventListener('click', () => el.devModal.classList.add('hidden'));

    // Tour modal
    if (el.takeTourBtn) el.takeTourBtn.addEventListener('click', startTour);
    if (el.closeTourModalBtn) el.closeTourModalBtn.addEventListener('click', closeTour);
    if (el.tourNextBtn) el.tourNextBtn.addEventListener('click', nextTourStep);
    if (el.tourPrevBtn) el.tourPrevBtn.addEventListener('click', prevTourStep);

    // Inbox Filters
    document.querySelectorAll('.inbox-filter-tab').forEach(t => {
      t.addEventListener('click', () => {
        setInboxFilter(t.getAttribute('data-filter'));
      });
    });

    // Chat Composer Form
    if (el.chatComposerForm) {
      el.chatComposerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = el.chatMessageInput.value.trim();
        if (!text) return;
        el.chatMessageInput.value = '';
        await window.chirpdesk.sendMessage(activeContactId, text, 'agent');
        renderChatMessages();
      });
    }

    // AI Takeover Switch
    if (el.chatAiToggle) {
      el.chatAiToggle.addEventListener('change', async () => {
        const isAiActive = el.chatAiToggle.checked;
        await window.chirpdesk.toggleHumanTakeover(activeContactId, !isAiActive);
        showToast(isAiActive ? 'AI Bot enabled for this customer' : 'Human staff took over this chat');
      });
    }

    // Quick Reply Buttons
    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (el.chatMessageInput) {
          el.chatMessageInput.value = btn.textContent.trim();
          el.chatMessageInput.focus();
        }
      });
    });

    // Lookbook button
    const lookbookBtn = document.getElementById('sendLookbookTemplateBtn');
    if (lookbookBtn) {
      lookbookBtn.addEventListener('click', async () => {
        await window.chirpdesk.sendMessage(
          activeContactId,
          "🌟 Sharma Jewellers: Hamara Bridal Collection 2026 Catalogue PDF (4MB) send kiya gaya hai. Reply '1' to book video consultation.",
          'agent'
        );
        showToast('Lookbook PDF dispatched to customer WhatsApp!');
      });
    }

    // Broadcast Dispatch button
    if (el.dispatchBroadcastBtn) {
      el.dispatchBroadcastBtn.addEventListener('click', async () => {
        const name = document.getElementById('bcCampaignName').value || 'Festive Broadcast';
        const tpl = document.getElementById('bcTemplateSelect').value;
        await window.chirpdesk.createBroadcast({
          name,
          templateName: tpl,
          audience: '1,420 Subscribed Contacts',
          scheduledAt: 'Scheduled for 10:30 AM IST'
        });
        showToast(`Campaign "${name}" scheduled successfully via Meta Cloud API!`);
        renderBroadcasts();
      });
    }

    // Rate Alerts: Send Test button
    const testAlertBtn = document.getElementById('overviewSendTestAlertBtn');
    if (testAlertBtn) {
      testAlertBtn.addEventListener('click', () => {
        showToast('Simulated test bullion alert dispatched to your WhatsApp (+91 98201 54321)!');
      });
    }

    const testDirectBtn = document.getElementById('sendTestRateAlertDirectBtn');
    if (testDirectBtn) {
      testDirectBtn.addEventListener('click', () => {
        showToast('Sample formatted rate alert sent to your WhatsApp number!');
      });
    }

    const saveRatesBtn = document.getElementById('saveAllRatesBtn');
    if (saveRatesBtn) {
      saveRatesBtn.addEventListener('click', () => {
        showToast("Today's rates saved and morning broadcast scheduled for 10:30 AM IST!");
      });
    }

    // Copy Webhook Button
    const copyWebhookBtn = document.getElementById('copyWebhookBtn');
    if (copyWebhookBtn) {
      copyWebhookBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('https://api.chirpdesk.in/v1/webhooks/meta-cloud-events');
        showToast('Meta Cloud Webhook URL copied to clipboard!');
      });
    }

    // AI Test Bot Simulator
    const aiTestChatForm = document.getElementById('aiTestChatForm');
    const aiTestInput = document.getElementById('aiTestInput');
    const aiTestChatStream = document.getElementById('aiTestChatStream');

    if (aiTestChatForm && aiTestInput && aiTestChatStream) {
      aiTestChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = aiTestInput.value.trim();
        if (!q) return;
        aiTestInput.value = '';

        // Append user bubble
        const userDiv = document.createElement('div');
        userDiv.className = 'flex justify-end';
        userDiv.innerHTML = `
          <div class="bg-card border border-card-border p-2.5 rounded-brand-sm rounded-tr-none max-w-[85%]">
            <p class="text-charcoal">${q}</p>
            <span class="text-[9px] text-muted block text-right mt-1">You</span>
          </div>
        `;
        aiTestChatStream.appendChild(userDiv);
        aiTestChatStream.scrollTop = aiTestChatStream.scrollHeight;

        // Simulate intelligent Hinglish response
        setTimeout(() => {
          let reply = "Namaste ji! Sharma Jewellers me aapka swagat hai. Kripya batayein hum aapki kya sahayata kar sakte hain?";
          const lower = q.toLowerCase();
          if (lower.includes('rate') || lower.includes('gold') || lower.includes('sona') || lower.includes('bhav')) {
            reply = "Namaste! 🙏 Aaj ka 22K Hallmarked Gold rate ₹71,920/10g hai aur 24K rate ₹78,450/10g hai. Kya aap design catalogue dekhna chahenge?";
          } else if (lower.includes('time') || lower.includes('timing') || lower.includes('khula') || lower.includes('open')) {
            reply = "Hamara MI Road showroom subah 10:00 AM se raat 8:30 PM tak open rehta hai (Monday to Saturday).";
          } else if (lower.includes('discount') || lower.includes('making') || lower.includes('banwai')) {
            reply = "Wedding season me flat 9% making charges chal rahe hain! Special wedding budget ke liye main aapki chat hamare store owner Rajesh Sharma ji ko transfer kar raha hoon.";
          }

          const botDiv = document.createElement('div');
          botDiv.className = 'flex justify-start';
          botDiv.innerHTML = `
            <div class="bg-canvas border border-slate-accent/30 p-2.5 rounded-brand-sm rounded-tl-none max-w-[85%]">
              <p class="text-charcoal">${reply}</p>
              <span class="text-[9px] text-slate-accent block text-right mt-1">Bot • Hinglish NLP</span>
            </div>
          `;
          aiTestChatStream.appendChild(botDiv);
          aiTestChatStream.scrollTop = aiTestChatStream.scrollHeight;
        }, 800);
      });
    }

    // Close popovers on click outside
    document.addEventListener('click', (e) => {
      if (el.workspaceDropdown && !el.workspaceDropdown.contains(e.target) && !el.workspaceSwitcherBtn.contains(e.target)) {
        el.workspaceDropdown.classList.add('hidden');
      }
      if (el.notificationPopover && !el.notificationPopover.contains(e.target) && !el.notificationBellBtn.contains(e.target)) {
        el.notificationPopover.classList.add('hidden');
      }
    });
  }

  function openMobileDrawer() {
    el.appSidebar.classList.remove('-translate-x-full');
    el.mobileDrawerOverlay.classList.remove('hidden');
  }

  function closeMobileDrawer() {
    el.appSidebar.classList.add('-translate-x-full');
    el.mobileDrawerOverlay.classList.add('hidden');
  }

  /**
   * Tour Guide Logic
   */
  const tourSteps = [
    {
      title: "Guided Tour: Overview & KPIs (Step 1 of 4)",
      content: "<p><strong>Welcome to Chirpdesk!</strong> This overview shows 30-day message metrics, queue latency, and live delivery rates verified directly with Meta Cloud API servers.</p><p>Check the 5 KPI cards at the top for Queued, Sent, Delivered, Read, and Failed dispatches.</p>"
    },
    {
      title: "Guided Tour: Shared Team Inbox (Step 2 of 4)",
      content: "<p><strong>Never miss an inquiry:</strong> Multiple store staff can reply to customers simultaneously from your shop's single official WhatsApp number.</p><p>The AI automatically handles common FAQs in Hindi and Hinglish. If a customer negotiates or asks complex questions, click <em>'Take over from AI'</em> to respond personally.</p>"
    },
    {
      title: "Guided Tour: Daily Rate Alerts (Step 3 of 4)",
      content: "<p><strong>Automate morning commodity alerts:</strong> Enter today's 24K, 22K gold or silver prices in seconds.</p><p>Chirpdesk broadcasts a beautifully formatted WhatsApp alert to all registered buyers at 10:30 AM with zero risk of number bans.</p>"
    },
    {
      title: "Guided Tour: Multi-Tenant Switching (Step 4 of 4)",
      content: "<p><strong>Multi-Branch Architecture:</strong> Use the workspace switcher in the top right to toggle between <em>Sharma Jewellers</em> (Jaipur Bullion) and <em>Gupta General Store</em> (Indore Kirana).</p><p>All database queries and settings are securely isolated by <code>workspace_id</code>.</p>"
    }
  ];

  function startTour() {
    tourStep = 1;
    renderTourStep();
    el.tourModal.classList.remove('hidden');
  }

  function renderTourStep() {
    const s = tourSteps[tourStep - 1];
    el.tourStepTitle.textContent = s.title;
    el.tourStepContent.innerHTML = s.content;
    el.tourPrevBtn.disabled = (tourStep === 1);
    el.tourPrevBtn.style.opacity = (tourStep === 1) ? '0.5' : '1';
    el.tourNextBtn.textContent = (tourStep === tourSteps.length) ? 'Finish Tour' : 'Next Step';
  }

  function nextTourStep() {
    if (tourStep < tourSteps.length) {
      tourStep++;
      renderTourStep();
    } else {
      closeTour();
      showToast('Tour completed! You are ready to explore Chirpdesk.');
    }
  }

  function prevTourStep() {
    if (tourStep > 1) {
      tourStep--;
      renderTourStep();
    }
  }

  function closeTour() {
    el.tourModal.classList.add('hidden');
  }

  /**
   * Helper: Non-intrusive Toast Notification
   */
  function showToast(msg) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'px-4 py-2.5 rounded-brand-sm bg-charcoal text-offwhite text-xs font-semibold shadow-card flex items-center gap-2 pointer-events-auto border border-offwhite/10 transition-all duration-300 translate-y-2 opacity-0';
    toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-tan-accent shrink-0"></i><span>${msg}</span>`;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 20);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

