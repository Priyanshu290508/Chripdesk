# Chirpdesk — WhatsApp AI & Business Automation for Indian Retail

Chirpdesk is a multi-tenant WhatsApp AI and business automation SaaS platform engineered specifically for local shops, jewellers, kirana stores, and retail merchants in India. Built on top of the **official Meta Cloud API**, Chirpdesk replaces fragile unofficial Chrome plugins and chaotic personal WhatsApp accounts with a verified, scalable, and compliant system.

---

## 🎨 Theme: "Mint Slate" Design System

The application strictly implements the **Mint Slate** design system across all screens, featuring rounded geometric typography (`Plus Jakarta Sans` and `Outfit`), generous rounded corners (`16-20px`), and soft layered elevation.

| Token | Light Value | Purpose |
| :--- | :--- | :--- |
| **Canvas** | `#DCDFDA` | Global background canvas |
| **Cards** | `#E8EAE6` | Surface cards and panels |
| **Card Border** | `#C9CCC6` | Subtle dividers and outlines |
| **Sidebar** | `#D3D6D1` | Fixed navigation drawer |
| **Primary Accent** | `#5F7380` | Slate-blue for buttons, links, active states |
| **Warm Accent** | `#A89070` | Tan for badges, secondary lines, bullion highlights |
| **Text / Dark** | `#2B2D2E` | Charcoal for readable headings, buttons, and high contrast |
| **Muted Text** | `#727875` | Subtle descriptors and secondary metrics |
| **Success** | `#5E8B6E` | Sage green for delivery ticks and online status |
| **Warning** | `#B8893F` | Amber for pending items and alerts |
| **Danger** | `#A5524A` | Muted red for failed dispatches and errors |

> **Strict Compliance**: No bright green, purple, pure white (`#FFFFFF`), or pure black (`#000000`) is used anywhere in the UI.

---

## 📁 Project Structure

```
chripdesk/
├── index.html            # Marketing landing page (all 15 structured sections)
├── login.html            # Authentication page with 1-click Indian SME demo accounts
├── dashboard.html        # Logged-in dashboard application shell & views
├── app.js                # Core controller, view router, live chat & event simulation
├── supabase.js           # Supabase data service with automatic offline/mock fallback
├── mock-data.js          # Realistic Indian SME datasets (Sharma Jewellers & Gupta Kirana)
├── supabase-schema.sql   # Complete PostgreSQL schema with Row-Level Security (RLS)
└── README.md             # Architecture, design guidelines & documentation
```

---

## 🚀 Key Capabilities & Features

### 1. Marketing Landing Page (`index.html`)
- **Dismissible Announcement Banner**: Full-width slate-to-charcoal gradient announcing Meta Cloud API Tier-2 updates.
- **Sticky Navbar**: Brand logo, multi-level dropdowns (Product, Solutions, Resources), INR pricing link, contact pill (`+91 98201 54321`), and mobile drawer.
- **Dual-Column Hero**: 3-line headline with accent styling, bold key fact, dual CTA buttons, social-proof badge, divided 3-stat strip (monthly fee, go-live time, free credits), chip badges, and an **interactive tabbed browser mockup** (`Inbox`, `Rate Alerts`, `Broadcasts`, `AI Bot`) with floating badges.
- **Quick Answer Callout**: Accent-bordered card summarizing Chirpdesk's value proposition in plain language.
- **Lead Capture Demo**: Single-row WhatsApp number input that immediately simulates a test message dispatch.
- **Product Showcase**: Side-by-side browser mockups showing live dispatch queue latency and visual workflow node graphs.
- **Scenarios for Indian Retail**: Illustrative use-cases for **Jewellers** (22K/24K gold alerts), **Kirana & Supermarkets** (grocery list voice parsing), and **Clinics/Salons** (appointment reminders).
- **Comparison Table**: Official Meta Cloud API vs. unofficial grey-market browser plugins.
- **Pricing in INR**: Free Trial, Starter (₹999/mo), and Pro Bullion (₹2,499/mo) with monthly/annual 20% discount toggle.
- **Interactive FAQ Accordion**: Clarifies number ban immunity, SIM card reuse, and Hinglish understanding.
- **Floating WhatsApp Support Widget**: Bottom-right expandable support panel with quick-action prompts.

### 2. Logged-in Dashboard (`dashboard.html`)
- **Fixed Sidebar**: Logo, scrollable navigation with uppercase section labels (`ENGAGE`, `AUDIENCE`, `AUTOMATE`, `ACCOUNT`), active pill indicators, expandable Contacts submenu, pinned plan progress card, and developer tools row (theme toggle, API modal, logout).
- **Sticky Top Bar**: Real-time view title, "Take a tour" spotlight button, global search, notifications tray, and an instant **Workspace Switcher** (`Sharma Jewellers` ⇋ `Gupta General Store`).
- **Overview Page**:
  - Welcome banner with active service health badge and message credits counter.
  - 5 Equal KPI cards with top-left tinted icons, top-right SVG sparklines, and `(30D)` period tags: *Messages Queued*, *Sent*, *Delivered*, *Read*, *Failed*.
  - Multi-line SVG performance chart with dashed grid, hoverable tooltips, and x-axis dates.
  - 4 Circular progress rings in a 2x2 grid (*Delivered 97%*, *Read 85%*, *Replied 32%*, *Failed 0.4%*).
  - WhatsApp connection card showing Green Tier quality, verified phone number, and Tier 2 daily limits.
  - Queue Health card with 4 mini metric boxes and 7 status tiles with rate badges (*Initiated*, *Sent*, *Pending*, *Delivered*, *Read*, *Replied*, *Failed*).
  - Today's Rate Alerts card with scheduled send times and active bullion/commodity rates.
  - AI Assistant resolution rate card with "Needs human" pending handoff counter.
  - Real-time recent activity stream.
- **Shared Team Inbox**: 3-column layout featuring conversation filters (*All*, *Needs human*, *Unassigned*, *Mine*), WhatsApp chat bubbles, double checkmarks, message composer, template quick-replies, and a **"Take over from AI"** instant toggle switch.
- **Broadcasts Campaign Wizard**: 3-step stepper (Audience CSV, Template, Schedule) with live smartphone bezel preview.
- **Daily Rate Alerts Manager**: 1-click update tool for Gold 24K, 22K, 18K, and Silver with formatted WhatsApp broadcast preview.
- **Hinglish AI Bot Studio**: Tone and language selector (Hindi, Hinglish, English), FAQ builder, catalogue document uploader, and live interactive bot tester.
- **Visual Workflows**: Node-based graph canvas with triggers, conditions, actions, and human agent handoff nodes.
- **Workspace Settings**: Meta WABA ID, Phone Number ID, Webhook endpoints, and GSTIN billing details.

---

## 💾 Supabase Data Layer & Multi-Tenancy

The data layer in `supabase.js` seamlessly supports both **Offline/Mock Mode** and **Live Supabase PostgreSQL**:

1. **Standalone Offline Mode (Default)**:
   - When `SUPABASE_CONFIG` contains placeholder values, the app loads `window.CHIRPDESK_MOCK_DATA`.
   - All actions (sending messages, changing commodity rates, creating broadcasts, toggling AI handoff) persist in `localStorage` scoped by `workspace_id`.
   - Real-time event dispatchers simulate webhook arrivals and automated AI responses in 1.2 seconds.

2. **Connecting Real Supabase**:
   - Open `supabase.js` and set:
     ```javascript
     const SUPABASE_CONFIG = {
       url: "https://<your-project-id>.supabase.co",
       anonKey: "<your-anon-public-key>"
     };
     ```
   - Run `supabase-schema.sql` in your Supabase SQL Editor.
   - All queries and mutations are protected by Row Level Security (RLS) policies scoped to the tenant's `workspace_id`.

---

## 🛠️ How to Run Locally

Because this project uses plain HTML5, vanilla JavaScript, Tailwind CSS (via CDN), and Supabase JS (via CDN), **no build step, npm install, or bundler is required**.

1. Simply open `index.html` in any modern web browser:
   - Double-click `index.html` in Windows Explorer, or
   - Use a local HTTP server such as:
     ```powershell
     python -m http.server 8000
     ```
     and visit `http://localhost:8000`.

2. Click **"Sign in"** or visit `login.html`:
   - Click **"Sharma Jewellers"** to explore bullion/jewellery workflows.
   - Click **"Gupta General Store"** to explore kirana and FMCG grocery workflows.
   - Click **"Take a tour"** in the top bar for a guided walkthrough of all capabilities.

---

## 📄 License & Attribution
© 2026 Chirpdesk Technologies Pvt. Ltd. All rights reserved. Built with pride for India's local retail merchants.

