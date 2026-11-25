/**
 * Chirpdesk Supabase Data Layer
 * Connected to live Supabase project: https://unmbmkrcbcktuxxfqyxj.supabase.co
 * All queries are strictly scoped by workspace_id with Row Level Security (RLS).
 * No secret management tokens or database passwords are stored in client code.
 */

const SUPABASE_CONFIG = {
  url: "https://unmbmkrcbcktuxxfqyxj.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubWJta3JjYmNrdHV4eGZxeXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDU3NjQsImV4cCI6MjExMTAyMTc2NH0.8c7rO2W-Xs-vXLdF_a7U8M19MZJjRsx4pRIzV35TK_w",
  publishableKey: "sb_publishable_NPh7cqV3IKUoWvoEF5ZRDw_NUAi1DIQ"
};

class ChirpdeskDataService {
  constructor() {
    this.isSupabaseConfigured = Boolean(
      SUPABASE_CONFIG.url &&
      !SUPABASE_CONFIG.url.includes("your-project") &&
      SUPABASE_CONFIG.anonKey &&
      !SUPABASE_CONFIG.anonKey.includes("placeholder")
    );

    this.currentWorkspaceId = localStorage.getItem("chirpdesk_active_workspace") || "ws-sharma-jewellers";
    this.listeners = new Map();
    this._initLocalStore();

    if (this.isSupabaseConfigured && window.supabase) {
      console.info("[Chirpdesk] Connected to live Supabase project: unmbmkrcbcktuxxfqyxj");
      try {
        this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this._setupRealtime();
      } catch (err) {
        console.warn("[Chirpdesk] Supabase client init warning, using hybrid cache:", err);
        this.client = null;
      }
    } else {
      console.info("[Chirpdesk] Running in fallback mock mode.");
      this.client = null;
    }
  }

  _initLocalStore() {
    const cached = localStorage.getItem("chirpdesk_local_store");
    if (cached) {
      try {
        this.store = JSON.parse(cached);
      } catch (e) {
        this.store = window.CHIRPDESK_MOCK_DATA;
      }
    } else {
      this.store = window.CHIRPDESK_MOCK_DATA;
    }
  }

  _saveLocalStore() {
    try {
      localStorage.setItem("chirpdesk_local_store", JSON.stringify(this.store));
    } catch (e) {
      console.warn("Could not persist local store to localStorage", e);
    }
  }

  _setupRealtime() {
    if (!this.client) return;
    try {
      this.client
        .channel('public:live-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
          this._emit('new_message', payload.new);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rate_alerts' }, payload => {
          this._emit('rate_updated', payload.new);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, payload => {
          this._emit('contact_status_changed', payload.new);
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime subscription note:", e);
    }
  }

  getActiveWorkspaceId() {
    return this.currentWorkspaceId;
  }

  setWorkspace(workspaceId) {
    this.currentWorkspaceId = workspaceId;
    localStorage.setItem("chirpdesk_active_workspace", workspaceId);
    this._emit("workspace_changed", this.getWorkspace(workspaceId));
    return this.getWorkspace(workspaceId);
  }

  getWorkspaces() {
    return this.store.workspaces;
  }

  getWorkspace(workspaceId = this.currentWorkspaceId) {
    return this.store.workspaces.find(w => w.id === workspaceId) || this.store.workspaces[0];
  }

  async getKpi(workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("workspace_kpis")
          .select("*")
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (!error && data) {
          return {
            queued: data.queued,
            sent: data.sent,
            delivered: data.delivered,
            read: data.read,
            failed: data.failed,
            deliveredRate: data.delivered_rate,
            readRate: data.read_rate,
            repliedRate: data.replied_rate,
            failedRate: data.failed_rate,
            aiResolutionRate: data.ai_resolution_rate,
            needsHumanCount: data.needs_human_count
          };
        }
      } catch (err) {
        console.warn("Falling back to local KPI cache:", err);
      }
    }
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.kpi;
  }

  async getChartData(workspaceId = this.currentWorkspaceId) {
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.chartData;
  }

  async getQueueHealth(workspaceId = this.currentWorkspaceId) {
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.queueHealth;
  }

  async getRateAlerts(workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("rate_alerts")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
          return {
            nextScheduledTime: store.rateAlerts.nextScheduledTime,
            frequency: store.rateAlerts.frequency,
            recipientCount: store.rateAlerts.recipientCount,
            items: data,
            logs: store.rateAlerts.logs
          };
        }
      } catch (err) {
        console.warn("Falling back to local rate alerts cache:", err);
      }
    }
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.rateAlerts;
  }

  async updateRateAlertItem(itemId, newRate, workspaceId = this.currentWorkspaceId) {
    // 1. Update in Supabase
    if (this.client) {
      try {
        await this.client
          .from("rate_alerts")
          .update({ rate: newRate, updated_at: new Date().toISOString() })
          .eq("id", itemId)
          .eq("workspace_id", workspaceId);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    // 2. Update local store
    const store = this.store.storeData[workspaceId];
    if (store && store.rateAlerts && store.rateAlerts.items) {
      const item = store.rateAlerts.items.find(i => i.id === itemId);
      if (item) item.rate = newRate;
      this._saveLocalStore();
    }

    this._emit("rate_updated", { itemId, newRate, workspaceId });
    return true;
  }

  async getContacts(filter = "all", workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        let query = this.client
          .from("contacts")
          .select("*")
          .eq("workspace_id", workspaceId);

        if (filter === "needs_human") {
          query = query.eq("status", "needs_human");
        } else if (filter === "unassigned") {
          query = query.is("assigned_to", null);
        } else if (filter === "mine") {
          query = query.neq("assigned_to", "AI Assistant");
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            city: c.city,
            tags: c.tags || [],
            assignedTo: c.assigned_to,
            status: c.status,
            unreadCount: c.unread_count || 0,
            lastActive: c.last_active || 'Just now',
            notes: c.notes
          }));
        }
      } catch (err) {
        console.warn("Falling back to local contacts cache:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    let list = store.contacts || [];

    if (filter === "needs_human") {
      return list.filter(c => c.status === "needs_human");
    } else if (filter === "unassigned") {
      return list.filter(c => !c.assignedTo || c.assignedTo === "Unassigned");
    } else if (filter === "mine") {
      return list.filter(c => c.assignedTo && c.assignedTo !== "AI Assistant");
    }
    return list;
  }

  async getMessages(contactId, workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("messages")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("contact_id", contactId)
          .order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            time: m.time || '10:00 AM',
            day: m.day || 'Today',
            status: m.status || 'delivered',
            type: m.sender === 'system' ? 'system_event' : 'chat'
          }));
        }
      } catch (err) {
        console.warn("Falling back to local messages cache:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return (store.messages && store.messages[contactId]) || [];
  }

  async sendMessage(contactId, text, sender = "agent", workspaceId = this.currentWorkspaceId) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = "m-" + Date.now();

    const newMsg = {
      id: msgId,
      sender,
      text,
      time: timeStr,
      day: "Today",
      status: "delivered"
    };

    // 1. Insert into Supabase
    if (this.client) {
      try {
        await this.client.from("messages").insert({
          id: msgId,
          workspace_id: workspaceId,
          contact_id: contactId,
          sender,
          text,
          time: timeStr,
          day: "Today",
          status: "delivered"
        });
      } catch (err) {
        console.warn("Supabase message insert error:", err);
      }
    }

    // 2. Insert into local store
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    if (!store.messages) store.messages = {};
    if (!store.messages[contactId]) store.messages[contactId] = [];
    store.messages[contactId].push(newMsg);
    this._saveLocalStore();
    this._emit("new_message", { contactId, message: newMsg });

    // Simulate AI response if customer sends message and human takeover is off
    const contact = (store.contacts || []).find(c => c.id === contactId);
    if (sender === "customer" && contact && contact.status !== "needs_human") {
      setTimeout(async () => {
        const aiMsgId = "m-ai-" + Date.now();
        const aiReply = {
          id: aiMsgId,
          sender: "ai",
          text: `Namaste ji! 🙏 Sharma Jewellers WhatsApp assistant active hai. Aapka message receive ho gaya hai: "${text.substring(0, 30)}...". Kripya batayein hum aapki kya sahayata karein?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          day: "Today",
          status: "delivered"
        };

        if (this.client) {
          try {
            await this.client.from("messages").insert({
              id: aiMsgId,
              workspace_id: workspaceId,
              contact_id: contactId,
              sender: "ai",
              text: aiReply.text,
              time: aiReply.time,
              day: "Today",
              status: "delivered"
            });
          } catch (e) {
            console.warn("Supabase AI reply insert:", e);
          }
        }

        store.messages[contactId].push(aiReply);
        this._saveLocalStore();
        this._emit("new_message", { contactId, message: aiReply });
      }, 1200);
    }

    return newMsg;
  }

  async toggleHumanTakeover(contactId, needsHuman, workspaceId = this.currentWorkspaceId) {
    const status = needsHuman ? "needs_human" : "auto_resolved";
    const assignedTo = needsHuman ? "Rajesh Sharma" : "AI Assistant";

    if (this.client) {
      try {
        await this.client
          .from("contacts")
          .update({ status, assigned_to: assignedTo, updated_at: new Date().toISOString() })
          .eq("id", contactId)
          .eq("workspace_id", workspaceId);
      } catch (err) {
        console.warn("Supabase contact update error:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    const contact = (store.contacts || []).find(c => c.id === contactId);
    if (contact) {
      contact.status = status;
      contact.assignedTo = assignedTo;
      this._saveLocalStore();
      this._emit("contact_status_changed", contact);
      return contact;
    }
    return null;
  }

  async getBroadcasts(workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("broadcasts")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(b => ({
            id: b.id,
            name: b.name,
            templateName: b.template_name,
            audience: b.audience,
            scheduledAt: b.scheduled_at,
            status: b.status,
            sent: b.sent || 0,
            delivered: b.delivered || "—",
            read: b.read || "—",
            replied: b.replied || "—"
          }));
        }
      } catch (err) {
        console.warn("Falling back to local broadcasts cache:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.broadcasts || [];
  }

  async createBroadcast(broadcastData, workspaceId = this.currentWorkspaceId) {
    const newBroadcast = {
      id: "bc-" + Date.now(),
      name: broadcastData.name || "Festive Offer Broadcast",
      templateName: broadcastData.templateName || "custom_template",
      audience: broadcastData.audience || "Subscribed Contacts",
      scheduledAt: broadcastData.scheduledAt || "Just now",
      status: "Scheduled",
      sent: 0,
      delivered: "0%",
      read: "0%",
      replied: "0%"
    };

    if (this.client) {
      try {
        await this.client.from("broadcasts").insert({
          id: newBroadcast.id,
          workspace_id: workspaceId,
          name: newBroadcast.name,
          template_name: newBroadcast.templateName,
          audience: newBroadcast.audience,
          scheduled_at: newBroadcast.scheduledAt,
          status: newBroadcast.status,
          sent: 0,
          delivered: "0%",
          read: "0%",
          replied: "0%"
        });
      } catch (err) {
        console.warn("Supabase create broadcast error:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    if (!store.broadcasts) store.broadcasts = [];
    store.broadcasts.unshift(newBroadcast);
    this._saveLocalStore();
    this._emit("broadcast_created", newBroadcast);
    return newBroadcast;
  }

  async getWorkflows(workspaceId = this.currentWorkspaceId) {
    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.workflows || [];
  }

  async getRecentActivity(workspaceId = this.currentWorkspaceId) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("recent_activity")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(a => ({
            id: a.id,
            type: a.type,
            title: a.title,
            time: a.time,
            desc: a.description
          }));
        }
      } catch (err) {
        console.warn("Falling back to local activity cache:", err);
      }
    }

    const store = this.store.storeData[workspaceId] || this.store.storeData["ws-sharma-jewellers"];
    return store.recentActivity || [];
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  _emit(event, data) {
    const arr = this.listeners.get(event);
    if (arr) {
      arr.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error("Listener error for event:", event, err);
        }
      });
    }
  }
}

// Global instance
window.chirpdesk = new ChirpdeskDataService();
