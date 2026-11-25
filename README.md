# Chirpdesk — Multi-Tenant WhatsApp AI CRM & Automation SaaS

![Python](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google)
![Supabase](https://img.shields.io/badge/Database-Supabase%20Realtime-3ECF8E?style=flat-square&logo=supabase)
![WhatsApp Cloud API](https://img.shields.io/badge/Messaging-Meta%20Cloud%20API-25D366?style=flat-square&logo=whatsapp)
![Tailwind CSS](https://img.shields.io/badge/UI-Mint%20Slate%20Dashboard-06B6D4?style=flat-square&logo=tailwindcss)

**Chirpdesk** is a full-stack, multi-tenant **WhatsApp AI Customer Support & CRM SaaS platform** built directly on top of the **Meta WhatsApp Cloud API**, **Python FastAPI**, **Google Gemini (`gemini-2.5-flash`)**, and **Supabase**. 

Instead of relying on rigid third-party no-code bot builders, Chirpdesk implements a custom webhook engine, real-time database synchronization, and workspace-isolated AI agents so businesses can automate customer replies in natural English and Hinglish while retaining full human takeover control.

---

## Key Features (What Chirpdesk Can Do)

* **AI-Powered Auto-Replies (`gemini-2.5-flash`):** Understands incoming customer queries (pricing, availability, business hours, FAQs) and replies naturally in English or Hinglish within seconds using workspace-specific business context.
* **Live Team Inbox with Human Handover:** Unified conversation thread displaying `customer`, `ai`, and `agent` messages with distinct badges. Human support agents can step in anytime to send manual replies directly to WhatsApp.
* **Real-Time Sync (Supabase Realtime):** New incoming WhatsApp messages and outgoing AI responses appear live on the dashboard without requiring a page reload.
* **Multi-Tenant Workspace Architecture:** Supports multiple businesses on a single deployment (`workspaces` table), each with isolated contacts, message history, Meta credentials, and custom AI knowledge rules.
* **Contacts CRM & Auto-Lead Capture:** Automatically creates and updates customer profiles in the `contacts` table whenever a new phone number messages the business, alongside bulk **CSV Import** support.
* **Broadcast Campaigns:** Send approved Meta WhatsApp template messages in bulk to segmented contact lists and track campaign delivery (`campaigns` table).

---

## How It Works (End-to-End Architecture)

When a customer sends a WhatsApp message to the connected business number, Chirpdesk executes the following real-time pipeline:

```text
+-----------------+       HTTPS Webhook        +----------------------+
|  WhatsApp User  | -------------------------> | Meta WhatsApp Cloud  |
+-----------------+                            |   API (Graph v21.0)  |
        ^                                      +----------+-----------+
        |                                                 |
        | Outbound Reply                       POST /webhook (JSON)
        | (Graph API)                                     |
        |                                                 v
+-------+---------+                            +----------------------+
| Meta Cloud API  | <------------------------- |  Cloudflare Tunnel   |
+-----------------+                            |  (Public HTTPS URL)  |
                                               +----------+-----------+
                                                          |
                                                          v
+-----------------+    Realtime WebSocket      +----------------------+
|    Chirpdesk    | <------------------------- |   Python FastAPI     |
| Mint Slate UI   |                            |   Backend (:8000)    |
+-----------------+                            +----+------------+----+
                                                    |            |
                                     Generate Reply |            | Log Chat
                                                    v            v
                                               +---------+  +---------+
                                               | Gemini  |  |Supabase |
                                               |2.5 Flash|  |Postgres |
                                               +---------+  +---------+
```

1. **Webhook Ingestion:** Meta Cloud API pushes an incoming message event (`POST /webhook`) through a secure HTTPS tunnel (**Cloudflare Tunnel** in local dev) to the **FastAPI** server.
2. **Contact & Workspace Resolution:** FastAPI maps the incoming payload to the active workspace (e.g., `ws-sharma-jewellers`), finds or creates the sender in the Supabase `contacts` table, and stores the message with `sender_type = "customer"`.
3. **AI Response Generation:** FastAPI sends the customer's query along with the workspace's business context to **Google Gemini (`gemini-2.5-flash`)** to generate a concise, helpful reply.
4. **WhatsApp Dispatch & Logging:** FastAPI sends the generated reply back to the user via the **Meta Graph API** (`/messages` endpoint) and logs it in Supabase with `sender_type = "ai"`.
5. **Live Dashboard Update:** **Supabase Realtime** broadcasts the new database rows immediately to the **Mint Slate Frontend**, updating the Live Team Inbox in real time.

---

## Tech Stack & How Each Tool Is Used

| Layer | Technology | Role in Chirpdesk |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Tailwind CSS, Vanilla JS | Clean **Mint Slate** multi-tenant dashboard with 4 core views: Live Inbox, Contacts, Broadcast Campaigns, and Settings. |
| **Backend Server** | Python, FastAPI, Uvicorn | Handles Meta webhook verification (`GET /webhook`), incoming message processing (`POST /webhook`), AI orchestration, and Graph API calls. |
| **AI Engine** | Google Gemini (`gemini-2.5-flash`) | Generates fast, context-aware customer support replies in Hinglish and English via the Google AI Studio API. |
| **Database & Realtime** | Supabase (PostgreSQL) | Stores multi-tenant data across a 9-table UUID schema (`workspaces`, `contacts`, `messages`, `campaigns`, etc.) with Realtime enabled on `messages`. |
| **Messaging API** | Meta WhatsApp Cloud API | Connects the WhatsApp Business Account (WABA) and business phone number for two-way messaging and template broadcasts. |
| **Public Tunneling** | Cloudflare Tunnel (`cloudflared`) | Exposes local `http://localhost:8000` over a stable public HTTPS URL so Meta servers can deliver live webhook events during development. |

---

## Project Structure

```text
Chripdesk/
├── backend/
│   ├── main.py              # FastAPI app, /webhook GET & POST routes, Gemini + Meta integration
│   ├── requirements.txt     # Python dependencies (fastapi, uvicorn, google-genai, supabase, httpx)
│   └── .env.example         # Environment variable template (safe for GitHub)
├── index.html               # Mint Slate SaaS dashboard UI
├── app.js                   # Supabase Realtime listeners, inbox rendering, and UI logic
├── schema.sql               # 9-table multi-tenant PostgreSQL schema for Supabase
├── .gitignore               # Excludes .env, venv, and __pycache__ from version control
└── README.md                # Project documentation
```

---

## Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/Priyanshu290508/Chripdesk.git](https://github.com/Priyanshu290508/Chripdesk.git)
cd Chripdesk
```

### 2. Configure Supabase Database
1. Create a new project in [Supabase](https://supabase.com/).
2. Run the SQL schema (`schema.sql`) in the **SQL Editor** to create the multi-tenant UUID tables (`workspaces`, `contacts`, `messages`, `campaigns`, etc.).
3. Enable **Supabase Realtime** on the `messages` table.

### 3. Setup Backend Environment
Create a `backend/.env` file using `backend/.env.example` as a reference:
```env
# Meta WhatsApp Cloud API
META_ACCESS_TOKEN=your_meta_cloud_api_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_VERIFY_TOKEN=your_custom_verify_token

# Supabase
SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash

# Server Config
PORT=8000
HOST=0.0.0.0
DEFAULT_WORKSPACE_SLUG=ws-sharma-jewellers
```

### 4. Start the FastAPI Server
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Expose Webhook via Cloudflare Tunnel & Connect Meta
1. Start a public HTTPS tunnel pointing to port `8000`:
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```
2. Copy the generated `https://<random-subdomain>.trycloudflare.com` URL.
3. In the **Meta Developer Portal** (`WhatsApp -> Configuration -> Webhooks`):
   * **Callback URL:** `https://<random-subdomain>.trycloudflare.com/webhook`
   * **Verify Token:** Same value as `META_VERIFY_TOKEN` in `backend/.env`
   * Click **Verify and save**, then subscribe to the **`messages`** webhook field.
4. Subscribe your WhatsApp Business Account (WABA) to the app:
   ```bash
   curl -X POST "[https://graph.facebook.com/v21.0/](https://graph.facebook.com/v21.0/)<WABA_ID>/subscribed_apps" \
     -H "Authorization: Bearer <META_ACCESS_TOKEN>"
   ```

---

## Author

Built by **Priyanshu** ([@Priyanshu290508](https://github.com/Priyanshu290508))
