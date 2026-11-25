/**
 * Chirpdesk Mock Data Store
 * Authentic Indian SME data for "Sharma Jewellers" and "Gupta General Store".
 * All sample figures are marked visibly as "Example data" in the UI.
 */

window.CHIRPDESK_MOCK_DATA = {
  // Available workspaces
  workspaces: [
    {
      id: "ws-sharma-jewellers",
      name: "Sharma Jewellers",
      legalName: "M/s Sharma Jewellers & Sons Pvt. Ltd.",
      type: "Jeweller & Bullion Merchant",
      city: "Jaipur, Rajasthan",
      phone: "+91 98201 54321",
      wabaId: "WABA-IND-88492019-SJ",
      phoneNumberId: "PNID-919820154321-PROD",
      currency: "INR",
      currencySymbol: "₹",
      plan: "Pro Plan",
      creditsLeft: 3420,
      creditsTotal: 5000,
      verified: true,
      qualityRating: "High Quality - Green Tier",
      messagingLimit: "Tier 2 (10,000 msgs/day)",
      gstin: "08AABCS1429B1Z8",
      defaultLanguage: "Hinglish",
      healthStatus: "All 3 services running normally • Last sync 2m ago",
      themeAccent: "#3B82F6"
    },
    {
      id: "ws-gupta-general",
      name: "Gupta General Store",
      legalName: "Gupta Kirana & Daily Needs",
      type: "Kirana & Supermarket",
      city: "Indore, Madhya Pradesh",
      phone: "+91 97555 12345",
      wabaId: "WABA-IND-44781290-GG",
      phoneNumberId: "PNID-919755512345-PROD",
      currency: "INR",
      currencySymbol: "₹",
      plan: "Starter Plan",
      creditsLeft: 840,
      creditsTotal: 1000,
      verified: true,
      qualityRating: "High Quality - Green Tier",
      messagingLimit: "Tier 1 (1,000 msgs/day)",
      gstin: "23AAGFG9876C1Z2",
      defaultLanguage: "Hinglish",
      healthStatus: "WhatsApp Webhook Active • 0 dropped events",
      themeAccent: "#0284C7"
    }
  ],

  // Specific workspace datasets
  storeData: {
    "ws-sharma-jewellers": {
      kpi: {
        queued: 142,
        sent: 18450,
        delivered: 17980,
        read: 15210,
        failed: 74,
        deliveredRate: "97.4%",
        readRate: "84.6%",
        repliedRate: "32.1%",
        failedRate: "0.4%",
        aiResolutionRate: "78.4%",
        needsHumanCount: 3
      },
      chartData: {
        labels: ["01 Nov", "05 Nov", "10 Nov", "15 Nov", "20 Nov", "25 Nov", "28 Nov"],
        sent: [420, 680, 890, 1450, 1100, 1820, 2150],
        delivered: [412, 665, 870, 1410, 1070, 1780, 2095],
        read: [340, 560, 740, 1220, 910, 1530, 1790],
        failed: [3, 5, 2, 8, 4, 6, 7]
      },
      queueHealth: {
        totalJobs: 1248,
        pending: 14,
        processed: 1234,
        avgProcessTime: "420ms",
        statuses: [
          { label: "Initiated", count: 1248, rate: "100%", icon: "sparkles" },
          { label: "Sent", count: 1234, rate: "98.9%", icon: "send" },
          { label: "Pending", count: 14, rate: "1.1%", icon: "clock" },
          { label: "Delivered", count: 1210, rate: "97.0%", icon: "check-check" },
          { label: "Read", count: 1032, rate: "82.7%", icon: "eye" },
          { label: "Replied", count: 395, rate: "31.7%", icon: "message-square" },
          { label: "Failed", count: 10, rate: "0.8%", icon: "alert-circle" }
        ]
      },
      rateAlerts: {
        nextScheduledTime: "Today at 10:30 AM IST (in 45 mins)",
        frequency: "Daily (Mon - Sat)",
        recipientCount: 1420,
        items: [
          { id: "g24", name: "Gold 24K (999 Purity)", rate: "₹78,450", unit: "per 10g", change: "+₹320", trend: "up", active: true },
          { id: "g22", name: "Gold 22K (916 Hallmarked)", rate: "₹71,920", unit: "per 10g", change: "+₹290", trend: "up", active: true },
          { id: "g18", name: "Gold 18K (750 Studded)", rate: "₹58,840", unit: "per 10g", change: "+₹240", trend: "up", active: true },
          { id: "s99", name: "Silver Fine 999", rate: "₹92,500", unit: "per 1 kg", change: "-₹450", trend: "down", active: true }
        ],
        logs: [
          { date: "Yesterday, 10:30 AM", recipients: 1418, delivered: "99.1%", read: "87.4%", status: "Completed" },
          { date: "21 Nov 2026, 10:30 AM", recipients: 1410, delivered: "98.8%", read: "89.1%", status: "Completed" },
          { date: "20 Nov 2026, 10:30 AM", recipients: 1405, delivered: "98.6%", read: "86.2%", status: "Completed" }
        ]
      },
      contacts: [
        {
          id: "c-101",
          name: "Smt. Sunita Agarwal",
          phone: "+91 98290 11223",
          city: "Jaipur (C-Scheme)",
          tags: ["VIP Client", "Gold Buyer", "Hinglish"],
          lastActive: "10 mins ago",
          unreadCount: 1,
          assignedTo: "Rajesh Sharma",
          status: "needs_human",
          notes: "Interested in 22K antique bridal necklace set for daughter's wedding in January."
        },
        {
          id: "c-102",
          name: "Vikram Singhania",
          phone: "+91 94140 44556",
          city: "Jodhpur",
          tags: ["Bullion Trader", "Daily Rates"],
          lastActive: "35 mins ago",
          unreadCount: 0,
          assignedTo: "AI Assistant",
          status: "resolved",
          notes: "Orders 100g 24K cast bars bi-weekly. Prefers RTGS bank settlement."
        },
        {
          id: "c-103",
          name: "Ananya Mehta",
          phone: "+91 99280 88990",
          city: "Delhi / Jaipur",
          tags: ["Diamond", "Custom Order"],
          lastActive: "2 hours ago",
          unreadCount: 2,
          assignedTo: "Pooja Verma",
          status: "needs_human",
          notes: "Requested CAD 3D render of custom solitaire ring. Budget ₹1.5L."
        },
        {
          id: "c-104",
          name: "Mahesh Bhati",
          phone: "+91 98285 77665",
          city: "Jaipur (Mansarovar)",
          tags: ["Rate Alerts", "Silver Articles"],
          lastActive: "Yesterday",
          unreadCount: 0,
          assignedTo: "AI Assistant",
          status: "auto_resolved",
          notes: "Subscribed to daily silver puja utensils alerts."
        }
      ],
      messages: {
        "c-101": [
          {
            id: "m-1",
            sender: "customer",
            text: "Namaste Sharma ji! Aaj ka 22K hallmarked rate kya chal raha hai? Aur kya bridal necklace designs ready stock me hain?",
            time: "10:14 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "m-2",
            sender: "ai",
            text: "Namaste Sunita ji! 🙏 Aaj ka 22K Hallmark Gold rate ₹71,920 per 10g hai. Hamare MI Road showroom me latest Jadau aur Antique bridal sets ready stock me available hain. Kya main aapko digital lookbook PDF send karun?",
            time: "10:15 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "m-3",
            sender: "customer",
            text: "Haan please send kijiye, around 45-50 grams me dekhna hai. Aur banwai (making charge) pe koi discount milega kya?",
            time: "10:18 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "m-4",
            sender: "system",
            text: "AI Assistant flagged this query: Customer negotiating making charges on bridal jewellery. Human handoff recommended.",
            time: "10:19 AM",
            day: "Today",
            type: "system_event"
          }
        ],
        "c-102": [
          {
            id: "m-5",
            sender: "ai",
            text: "🌟 *SHARMA JEWELLERS DAILY BULLION UPDATE*\nDate: 23 Nov 2026\n• 24K Gold (999): ₹78,450 / 10g\n• 22K Gold (916): ₹71,920 / 10g\n• Silver 999: ₹92,500 / kg\nReply 1 to book at today's MCX fix rate.",
            time: "10:30 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "m-6",
            sender: "customer",
            text: "Thanks! Will book 50g bar by afternoon once RTGS clears.",
            time: "11:05 AM",
            day: "Today",
            status: "read"
          }
        ]
      },
      broadcasts: [
        {
          id: "bc-201",
          name: "Wedding Season 2026 Antique Collection",
          templateName: "wedding_bridal_preview_v2",
          audience: "VIP & Gold Buyers (1,420 contacts)",
          scheduledAt: "20 Nov 2026, 11:00 AM",
          status: "Completed",
          sent: 1420,
          delivered: "98.7%",
          read: "86.2%",
          replied: "34.5%"
        },
        {
          id: "bc-202",
          name: "Dhanteras Gold Coin Advance Booking",
          templateName: "festive_coin_offer_hi",
          audience: "All Subscribed Customers (3,850 contacts)",
          scheduledAt: "10 Nov 2026, 09:30 AM",
          status: "Completed",
          sent: 3850,
          delivered: "99.2%",
          read: "91.4%",
          replied: "42.0%"
        },
        {
          id: "bc-203",
          name: "Dev Uthani Ekadashi Special Offer",
          templateName: "jewellery_flash_discount",
          audience: "Local Jaipur Clients (950 contacts)",
          scheduledAt: "Tomorrow, 10:00 AM",
          status: "Scheduled",
          sent: 0,
          delivered: "—",
          read: "—",
          replied: "—"
        }
      ],
      workflows: [
        {
          id: "wf-1",
          title: "New Customer Enquiry & Lookbook Handoff",
          trigger: "Incoming WhatsApp message containing 'rate' or 'catalogue'",
          status: "active",
          executions: 842,
          steps: [
            { id: "s1", type: "trigger", title: "Keyword Trigger", desc: "User sends 'Price', 'Rate' or 'Designs'" },
            { id: "s2", type: "condition", title: "Time & Contact Check", desc: "Is working hours? (10am - 8pm)" },
            { id: "s3", type: "action", title: "Send Dynamic Rate Card", desc: "Fetch today's 22K/24K rates from DB" },
            { id: "s4", type: "handoff", title: "Agent Handoff", desc: "If customer asks custom budget, assign to Rajesh" }
          ]
        },
        {
          id: "wf-2",
          title: "Hallmark Digital Receipt Auto-Send",
          trigger: "POS Billing System Webhook (Order Created)",
          status: "active",
          executions: 1240,
          steps: [
            { id: "s1", type: "trigger", title: "POS Bill Generation", desc: "Order tagged 'Paid' in Jewellery ERP" },
            { id: "s2", type: "action", title: "Dispatch WhatsApp Receipt", desc: "Attach PDF bill with HUID Hallmark code" },
            { id: "s3", type: "action", title: "Feedback Request (48h)", desc: "Schedule Google Review prompt after 2 days" }
          ]
        }
      ],
      recentActivity: [
        { id: "a-1", type: "broadcast", title: "Daily Gold Rate Alert Dispatched", time: "45 mins ago", desc: "Sent to 1,420 registered buyers via Meta Cloud API." },
        { id: "a-2", type: "chat", title: "Human Takeover Requested", time: "1 hour ago", desc: "Sunita Agarwal asked for making charge negotiation on 48g set." },
        { id: "a-3", type: "workflow", title: "Order Receipt Dispatched", time: "2 hours ago", desc: "Bill #SJ-9482 for ₹1,84,500 sent to Manoj Khandelwal with HUID PDF." },
        { id: "a-4", type: "queue", title: "Queue Batch Completed", time: "4 hours ago", desc: "Processed 580 delivery receipts with 0 errors in 420ms avg time." }
      ]
    },

    "ws-gupta-general": {
      kpi: {
        queued: 38,
        sent: 6420,
        delivered: 6310,
        read: 5690,
        failed: 22,
        deliveredRate: "98.3%",
        readRate: "88.6%",
        repliedRate: "41.2%",
        failedRate: "0.3%",
        aiResolutionRate: "84.2%",
        needsHumanCount: 1
      },
      chartData: {
        labels: ["01 Nov", "05 Nov", "10 Nov", "15 Nov", "20 Nov", "25 Nov", "28 Nov"],
        sent: [180, 240, 310, 520, 480, 710, 890],
        delivered: [178, 235, 306, 512, 472, 701, 876],
        read: [155, 210, 275, 460, 415, 630, 788],
        failed: [1, 2, 1, 3, 2, 1, 2]
      },
      queueHealth: {
        totalJobs: 540,
        pending: 6,
        processed: 534,
        avgProcessTime: "310ms",
        statuses: [
          { label: "Initiated", count: 540, rate: "100%", icon: "sparkles" },
          { label: "Sent", count: 534, rate: "98.8%", icon: "send" },
          { label: "Pending", count: 6, rate: "1.2%", icon: "clock" },
          { label: "Delivered", count: 528, rate: "97.7%", icon: "check-check" },
          { label: "Read", count: 476, rate: "88.1%", icon: "eye" },
          { label: "Replied", count: 222, rate: "41.1%", icon: "message-square" },
          { label: "Failed", count: 4, rate: "0.7%", icon: "alert-circle" }
        ]
      },
      rateAlerts: {
        nextScheduledTime: "Today at 08:30 AM IST (Completed)",
        frequency: "Every Monday & Thursday",
        recipientCount: 820,
        items: [
          { id: "o1", name: "Fortune Sunlite Oil (1L)", rate: "₹142", unit: "per pouch", change: "-₹4", trend: "down", active: true },
          { id: "a1", name: "Aashirvaad Shudh Chakki Atta (10kg)", rate: "₹425", unit: "per bag", change: "₹0", trend: "flat", active: true },
          { id: "s1", name: "Madhur Pure Sugar (5kg)", rate: "₹220", unit: "per pack", change: "+₹5", trend: "up", active: true },
          { id: "r1", name: "India Gate Basmati Rice Feast (5kg)", rate: "₹499", unit: "per bag", change: "-₹30", trend: "down", active: true }
        ],
        logs: [
          { date: "Thursday, 08:30 AM", recipients: 818, delivered: "99.4%", read: "91.2%", status: "Completed" },
          { date: "Monday, 08:30 AM", recipients: 805, delivered: "99.0%", read: "89.5%", status: "Completed" }
        ]
      },
      contacts: [
        {
          id: "cg-201",
          name: "Rameshwar Patidar",
          phone: "+91 97520 33441",
          city: "Indore (Vijay Nagar)",
          tags: ["Regular Family", "Monthly Ration"],
          lastActive: "15 mins ago",
          unreadCount: 1,
          assignedTo: "AI Assistant",
          status: "auto_resolved",
          notes: "Monthly ration buyer, spends ~₹6,500 every 1st week. Wants home delivery by evening."
        },
        {
          id: "cg-202",
          name: "Dr. Alok Verma",
          phone: "+91 98260 55667",
          city: "Indore (Palasia)",
          tags: ["Organic Food", "Quick UPI"],
          lastActive: "1 hour ago",
          unreadCount: 0,
          assignedTo: "Amit Gupta",
          status: "needs_human",
          notes: "Enquired if cold pressed mustard oil & A2 desi ghee stock arrived."
        }
      ],
      messages: {
        "cg-201": [
          {
            id: "mg-1",
            sender: "customer",
            text: "Bhaiya 10kg Aashirvaad atta, 2 packet Tata salt aur 5L Fortune tel ghar bhijwa do Vijay Nagar me.",
            time: "11:20 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "mg-2",
            sender: "ai",
            text: "Namaste Rameshwar ji! 🙏 Aapka order note kar liya gaya hai:\n• 1x Aashirvaad Atta 10kg: ₹425\n• 2x Tata Salt 1kg: ₹56\n• 5x Fortune Refined Oil 1L: ₹710\n*Total Bill: ₹1,191*\nDelivery boy sham 5:30 baje tak deliver kar dega. UPI QR code delivery pe scan kar sakte hain. Order confirm karein? (Reply YES)",
            time: "11:21 AM",
            day: "Today",
            status: "read"
          },
          {
            id: "mg-3",
            sender: "customer",
            text: "YES, please send with boy.",
            time: "11:22 AM",
            day: "Today",
            status: "read"
          }
        ]
      },
      broadcasts: [
        {
          id: "bcg-301",
          name: "Weekend Kirana Super Saver Basket",
          templateName: "kirana_grocery_weekly_offers",
          audience: "Vijay Nagar Residents (820 contacts)",
          scheduledAt: "Friday, 06:00 PM",
          status: "Completed",
          sent: 820,
          delivered: "99.2%",
          read: "92.5%",
          replied: "46.1%"
        }
      ],
      workflows: [
        {
          id: "wfg-1",
          title: "WhatsApp Grocery Order Parsing & Delivery Bot",
          trigger: "Customer sends grocery items list via text or voice",
          status: "active",
          executions: 490,
          steps: [
            { id: "sg1", type: "trigger", title: "Order List Received", desc: "Detect item names & quantities in Hindi/Hinglish" },
            { id: "sg2", type: "action", title: "Calculate Itemized Total", desc: "Lookup prices from store catalog" },
            { id: "sg3", type: "action", title: "Send Bill Confirmation", desc: "Ask customer to confirm via 1-click button" }
          ]
        }
      ],
      recentActivity: [
        { id: "ag-1", type: "broadcast", title: "Weekly Staples Broadcast Sent", time: "1 hour ago", desc: "820 families received weekend grocery discounts." },
        { id: "ag-2", type: "chat", title: "Ration Order Confirmed", time: "2 hours ago", desc: "Order #GG-582 for ₹1,191 scheduled for 5:30 PM delivery." }
      ]
    }
  },

  // Templates available for campaigns
  templates: [
    {
      id: "tpl-1",
      name: "daily_gold_rate_alert",
      category: "MARKETING",
      language: "Hinglish (hi_EN)",
      status: "APPROVED",
      body: "🌟 *SHARMA JEWELLERS - TODAY'S GOLD & SILVER RATES* 🌟\n\nDate: {{1}}\n• 24K Pure Gold: {{2}} / 10g\n• 22K Hallmarked Gold: {{3}} / 10g\n• Silver 999: {{4}} / kg\n\n_Making charges flat 9% on all antique necklaces this week!_\nReply '1' to view bridal lookbook.",
      buttons: ["View Lookbook PDF", "Call Showroom"]
    },
    {
      id: "tpl-2",
      name: "kirana_order_confirmation",
      category: "UTILITY",
      language: "Hinglish (hi_EN)",
      status: "APPROVED",
      body: "Namaste {{1}} ji! 🙏\nAapka order #{{2}} confirm ho gaya hai.\nTotal Bill: {{3}}\nExpected Delivery: {{4}} at your doorstep.\nDelivery pe UPI scan karke pay kar sakte hain.",
      buttons: ["Track Delivery", "Help"]
    },
    {
      id: "tpl-3",
      name: "payment_khata_reminder",
      category: "UTILITY",
      language: "Hindi & English",
      status: "APPROVED",
      body: "Namaste {{1}} ji, Sharma Jewellers ki taraf se namaskar. Aapka balance bill #{{2}} ke liye {{3}} baki hai. Kripya diye gaye UPI link se payment karein: {{4}}. Dhanyawad!",
      buttons: ["Pay via UPI", "Call Accounts"]
    }
  ],

  // Team members
  team: [
    { id: "tm-1", name: "Rajesh Sharma", role: "Owner & Admin", email: "rajesh@sharmajewellers.in", phone: "+91 98201 54321", status: "Active" },
    { id: "tm-2", name: "Pooja Verma", role: "Store Manager", email: "pooja@sharmajewellers.in", phone: "+91 98290 44332", status: "Active" },
    { id: "tm-3", name: "Aakash Mehta", role: "Sales Executive", email: "aakash@sharmajewellers.in", phone: "+91 98295 99881", status: "Active" }
  ],

  // Plan pricing
  plans: [
    {
      id: "plan-free",
      name: "Free Trial",
      tagline: "For new shops testing WhatsApp automation",
      priceMonthly: 0,
      priceAnnual: 0,
      period: "14 days free",
      badge: "No card required",
      features: [
        "500 Free WhatsApp conversation credits",
        "1 Connected WhatsApp Business Number",
        "Basic Daily Rate Alerts (1 group)",
        "Hinglish AI auto-replies (100 chats/mo)",
        "Single user team inbox",
        "Meta Cloud API compliance"
      ],
      ctaText: "Start 14-Day Free Trial",
      highlight: false
    },
    {
      id: "plan-starter",
      name: "Starter",
      tagline: "Ideal for growing kirana & retail stores",
      priceMonthly: 999,
      priceAnnual: 799,
      period: "per month, billed annually",
      badge: "Most Popular for Retail",
      features: [
        "2,500 WhatsApp conversation credits / mo",
        "Unlimited Daily Rate & Offer broadcasts",
        "Hinglish + Hindi Smart AI Bot (24/7)",
        "Shared Team Inbox (up to 3 staff members)",
        "Automated Order Confirmation & Receipts",
        "Excel / CSV Contact Import with tags",
        "GST Invoice in INR provided"
      ],
      ctaText: "Choose Starter Plan",
      highlight: true
    },
    {
      id: "plan-pro",
      name: "Pro Bullion & High Volume",
      tagline: "For premier jewellers & multi-store brands",
      priceMonthly: 2499,
      priceAnnual: 1999,
      period: "per month, billed annually",
      badge: "Best for Jewellers",
      features: [
        "10,000 WhatsApp conversation credits / mo",
        "Scheduled Multi-Slot Rate Alerts (Morning & Evening)",
        "Custom Visual Node Workflow Builder",
        "Multi-agent Shared Inbox (10 team logins)",
        "Catalog & Lookbook PDF auto-delivery",
        "Priority Tier 2 Meta Cloud throughput",
        "Dedicated WhatsApp Onboarding Specialist"
      ],
      ctaText: "Choose Pro Plan",
      highlight: false
    }
  ]
};

