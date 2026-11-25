"""
Chirpdesk FastAPI Backend
WhatsApp Cloud API Webhook, Supabase PostgreSQL Data Layer & Gemini AI Auto-Reply
"""

import os
import sys
import logging
from typing import Optional, List, Dict, Any
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException, Query, status
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# ------------------------------------------------------------------------------
# 1. Environment & Configuration
# ------------------------------------------------------------------------------
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "").strip()
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "").strip()
META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "chirpdesk123").strip()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
DEFAULT_WORKSPACE_SLUG = os.getenv("DEFAULT_WORKSPACE_SLUG", "ws-sharma-jewellers").strip()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("chirpdesk-backend")

# Initialize Gemini Client if key is provided
gemini_client = None
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_"):
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info(f"Gemini client initialized with model: {GEMINI_MODEL}")
    except Exception as e:
        logger.warning(f"Could not initialize google-genai SDK: {e}")
else:
    logger.info("GEMINI_API_KEY not configured. Running in rule-based Hinglish fallback mode.")

# ------------------------------------------------------------------------------
# 2. FastAPI Application & Lifecycle
# ------------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Chirpdesk Backend starting up on port 8000...")
    logger.info(f"Connected Supabase URL: {SUPABASE_URL}")
    logger.info(f"Meta Verify Token: {META_VERIFY_TOKEN}")
    yield
    logger.info("Chirpdesk Backend shutting down...")

app = FastAPI(
    title="Chirpdesk WhatsApp AI Backend",
    version="1.0.0",
    description="Meta WhatsApp Cloud API Webhook with Supabase Data Layer & Gemini AI Auto-Reply",
    lifespan=lifespan
)

# Enable CORS for frontend dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# 3. Supabase REST API Client Helper
# ------------------------------------------------------------------------------
def get_supabase_headers() -> Dict[str, str]:
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

async def supabase_get_workspace(phone_number_id: Optional[str] = None, slug: Optional[str] = None, ws_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Resolve active workspace by ID, phone_number_id, or slug."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"{SUPABASE_URL}/rest/v1/workspaces"
            params = {"select": "*"}
            if ws_id:
                params["id"] = f"eq.{ws_id}"
            elif phone_number_id:
                params["phone_number_id"] = f"eq.{phone_number_id}"
            elif slug:
                params["slug"] = f"eq.{slug}"
            else:
                params["slug"] = f"eq.{DEFAULT_WORKSPACE_SLUG}"

            resp = await client.get(url, headers=get_supabase_headers(), params=params)
            if resp.status_code == 200:
                rows = resp.json()
                if rows:
                    return rows[0]
            
            # Fallback to first available workspace
            fallback_resp = await client.get(f"{SUPABASE_URL}/rest/v1/workspaces?select=*&limit=1", headers=get_supabase_headers())
            if fallback_resp.status_code == 200 and fallback_resp.json():
                return fallback_resp.json()[0]
    except Exception as e:
        logger.error(f"Error fetching workspace from Supabase: {e}")
    return None

async def supabase_get_rate_alerts(workspace_id: str) -> List[Dict[str, Any]]:
    """Fetch active commodity rate alerts for a workspace."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"{SUPABASE_URL}/rest/v1/rate_alerts"
            params = {
                "workspace_id": f"eq.{workspace_id}",
                "is_active": "eq.true",
                "select": "item_code,item_name,unit,current_rate,change_amount,trend"
            }
            resp = await client.get(url, headers=get_supabase_headers(), params=params)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.error(f"Error fetching rate alerts: {e}")
    return []

async def supabase_get_or_create_contact(workspace_id: str, phone_number: str, full_name: str) -> Dict[str, Any]:
    """Find or insert customer contact in public.contacts."""
    cleaned_phone = phone_number.replace("+", "").strip()

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Check existing contact
        check_url = f"{SUPABASE_URL}/rest/v1/contacts"
        params = {
            "workspace_id": f"eq.{workspace_id}",
            "phone_number": f"eq.{cleaned_phone}",
            "select": "*"
        }
        resp = await client.get(check_url, headers=get_supabase_headers(), params=params)
        if resp.status_code == 200:
            contacts = resp.json()
            if contacts:
                return contacts[0]

        # Insert new contact
        payload = {
            "workspace_id": workspace_id,
            "phone_number": cleaned_phone,
            "full_name": full_name or f"WhatsApp User ({cleaned_phone[-4:]})",
            "city": "India",
            "tags": ["WhatsApp", "Inbound"],
            "status": "auto_resolved"
        }
        insert_resp = await client.post(
            check_url,
            headers=get_supabase_headers(),
            json=payload
        )
        if insert_resp.status_code in [200, 201]:
            created = insert_resp.json()
            return created[0] if isinstance(created, list) else created
        else:
            logger.error(f"Failed to insert contact: {insert_resp.text}")
            return {"id": "00000000-0000-0000-0000-000000000000", "phone_number": cleaned_phone, "full_name": full_name, "status": "auto_resolved"}

async def supabase_insert_message(workspace_id: str, contact_id: str, sender_type: str, content: str, delivery_status: str = "sent", metadata: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
    """Log inbound or outbound WhatsApp message in public.messages."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = f"{SUPABASE_URL}/rest/v1/messages"
            payload = {
                "workspace_id": workspace_id,
                "contact_id": contact_id,
                "sender_type": sender_type,
                "content": content,
                "delivery_status": delivery_status,
                "metadata": metadata or {}
            }
            resp = await client.post(url, headers=get_supabase_headers(), json=payload)
            if resp.status_code in [200, 201]:
                res = resp.json()
                return res[0] if isinstance(res, list) else res
            else:
                logger.error(f"Failed to insert message into Supabase: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"Exception inserting message into Supabase: {e}")
    return None

# ------------------------------------------------------------------------------
# 4. Meta WhatsApp Cloud API Dispatcher
# ------------------------------------------------------------------------------
async def send_meta_whatsapp_message(to_phone: str, message_text: str, phone_number_id: Optional[str] = None) -> Dict[str, Any]:
    """Send text message via Meta Graph API v21.0."""
    p_id = phone_number_id or META_PHONE_NUMBER_ID
    cleaned_phone = to_phone.replace("+", "").strip()

    if not META_ACCESS_TOKEN or META_ACCESS_TOKEN.startswith("your_") or not p_id or p_id.startswith("your_"):
        logger.info(f"[Meta Mock Send] Simulated WhatsApp message to {cleaned_phone}: '{message_text}'")
        return {"simulated": True, "success": True, "messages": [{"id": f"sim_wamid_{os.urandom(6).hex()}"}]}

    graph_url = f"https://graph.facebook.com/v21.0/{p_id}/messages"
    headers = {
        "Authorization": f"Bearer {META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": cleaned_phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(graph_url, headers=headers, json=payload)
            data = resp.json()
            if resp.status_code in [200, 201]:
                logger.info(f"WhatsApp sent successfully to {cleaned_phone}. Meta ID: {data.get('messages')}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Meta Graph API error ({resp.status_code}): {data}")
                return {"success": False, "error": data}
    except Exception as e:
        logger.error(f"Failed to call Meta Graph API: {e}")
        return {"success": False, "error": str(e)}

# ------------------------------------------------------------------------------
# 5. Gemini AI Auto-Reply Engine
# ------------------------------------------------------------------------------
async def generate_gemini_reply(workspace_name: str, business_type: str, rates: List[Dict[str, Any]], incoming_text: str) -> str:
    """Generate a polite Hinglish reply using Gemini AI with today's live store rates."""
    # Format rates string
    rates_summary = []
    for r in rates:
        trend_symbol = "▲" if r.get("trend") == "up" else "▼" if r.get("trend") == "down" else "•"
        chg = f"(+{r.get('change_amount')})" if r.get("change_amount", 0) > 0 else ""
        rates_summary.append(f"- {r.get('item_name')}: ₹{r.get('current_rate'):,.2f} {r.get('unit')} {trend_symbol} {chg}")
    rates_context = "\n".join(rates_summary) if rates_summary else "Live rates being updated today."

    # Try Gemini API if client is available
    if gemini_client:
        try:
            system_prompt = (
                f"You are the friendly, polite AI WhatsApp Assistant for '{workspace_name}' ({business_type}), a trusted local shop in India.\n"
                f"Tone: Courteous, respectful, warm, and professional. Speak in natural Hinglish (conversational Hindi written in English/Latin letters, blended naturally with English terms like rate, hallmarked, bill, stock, discount).\n"
                f"Address customers politely using 'Namaste ji', 'Aap', or 'Pranam'.\n\n"
                f"TODAY'S OFFICIAL STORE RATES & PRODUCTS:\n{rates_context}\n\n"
                f"RULES:\n"
                f"1. Answer concisely in 2 to 4 sentences maximum (suitable for mobile WhatsApp).\n"
                f"2. If asked about rates, prices, gold, silver, or items, quote the exact rates above accurately.\n"
                f"3. If asked for custom designs, bulky orders, or human help, politely say our team member will assist shortly.\n"
                f"4. Never hallucinate fake discounts or rates outside the list above.\n"
                f"5. End with a polite closing if helpful (e.g., 'Koi aur jaankari chahiye toh batayein!')."
            )

            prompt = f"Customer WhatsApp message: '{incoming_text}'\nReply in polite Hinglish:"
            
            # Execute with official google-genai SDK
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=f"{system_prompt}\n\n{prompt}"
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API generation failed ({e}), falling back to intelligent rule-based Hinglish response.")

    # Intelligent Rule-Based Fallback (guaranteed 100% uptime)
    text_lower = incoming_text.lower()
    greetings = ["namaste", "hello", "hi", "hey", "pranam", "kya haal", "ram ram", "radhe radhe"]
    is_greeting = any(g in text_lower for g in greetings)
    rate_keywords = ["rate", "bhaav", "bhav", "price", "daam", "gold", "silver", "chandi", "sona", "atta", "oil", "sugar", "chawal"]
    is_rate_query = any(k in text_lower for k in rate_keywords)

    if is_rate_query:
        rates_preview = "\n".join([f"✨ {r.get('item_name')}: ₹{r.get('current_rate'):,.0f} {r.get('unit')}" for r in rates[:3]])
        return (
            f"Namaste ji! 🙏 Aaj {workspace_name} ke live rates yeh hain:\n\n"
            f"{rates_preview}\n\n"
            f"Pure hallmarked aur certified stock uplabdh hai. Aap store visit kar sakte hain ya order ke liye yahan bata sakte hain!"
        )
    elif is_greeting:
        return (
            f"Namaste ji! 🙏 {workspace_name} mein aapka swagat hai.\n"
            f"Hum aapki kya sahayata kar sakte hain? Aaj ke live rates ya catalogue dekhne ke liye batayein."
        )
    else:
        return (
            f"Namaste ji! Aapka message mil gaya hai. Hamari team jald hi aapko assist karegi. "
            f"Agar aapko aaj ke rates janne hain toh 'rates' likh kar reply karein. Dhanyawad! 🙏"
        )

# ------------------------------------------------------------------------------
# 6. Meta Webhook Endpoints
# ------------------------------------------------------------------------------
@app.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Meta WhatsApp Cloud API Webhook Verification.
    Meta sends GET request during webhook setup.
    """
    logger.info(f"Meta verification request: mode={hub_mode}, token={hub_verify_token}")
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        logger.info("Meta webhook verified successfully!")
        return PlainTextResponse(content=hub_challenge, status_code=status.HTTP_200_OK)
    
    logger.warning("Meta webhook verification failed: Token mismatch.")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")

@app.post("/webhook")
async def receive_webhook(request: Request):
    """
    Meta WhatsApp Cloud API Inbound Webhook.
    Receives incoming customer messages, writes to Supabase, and triggers Gemini AI auto-reply.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Meta webhook event validation
    if body.get("object") != "whatsapp_business_account":
        return JSONResponse({"status": "ignored", "reason": "not a whatsapp_business_account"}, status_code=200)

    entries = body.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            metadata = value.get("metadata", {})
            phone_number_id = metadata.get("phone_number_id")
            
            # 1. Resolve Workspace
            workspace = await supabase_get_workspace(phone_number_id=phone_number_id)
            if not workspace:
                logger.error("No active workspace found in Supabase for this phone_number_id.")
                continue

            workspace_id = workspace.get("id")
            workspace_name = workspace.get("name", "Chirpdesk Store")
            business_type = workspace.get("business_type", "retail shop")

            # 2. Extract Customer Profile
            contacts_list = value.get("contacts", [])
            sender_name = "Customer"
            if contacts_list:
                sender_name = contacts_list[0].get("profile", {}).get("name", "Customer")

            # 3. Process Incoming Messages
            messages = value.get("messages", [])
            for msg in messages:
                msg_type = msg.get("type")
                sender_phone = msg.get("from")
                msg_id = msg.get("id")

                # Extract text content
                message_body = ""
                if msg_type == "text":
                    message_body = msg.get("text", {}).get("body", "")
                elif msg_type == "interactive":
                    interactive = msg.get("interactive", {})
                    message_body = (
                        interactive.get("button_reply", {}).get("title") or
                        interactive.get("list_reply", {}).get("title") or "Interactive response"
                    )
                else:
                    message_body = f"[{msg_type.capitalize()} received]"

                logger.info(f"Inbound WhatsApp from {sender_name} ({sender_phone}): '{message_body}'")

                # 4. Find or Create Contact in Supabase
                contact = await supabase_get_or_create_contact(
                    workspace_id=workspace_id,
                    phone_number=sender_phone,
                    full_name=sender_name
                )
                contact_id = contact.get("id")
                contact_status = contact.get("status", "auto_resolved")

                # 5. Log Customer Message in Supabase
                await supabase_insert_message(
                    workspace_id=workspace_id,
                    contact_id=contact_id,
                    sender_type="customer",
                    content=message_body,
                    delivery_status="delivered",
                    metadata={"whatsapp_message_id": msg_id, "phone_number_id": phone_number_id}
                )

                # 6. Check Human Handoff vs Gemini AI Auto-Reply
                if contact_status == "needs_human":
                    logger.info(f"Contact {sender_phone} is marked 'needs_human'. AI Auto-reply skipped for agent handoff.")
                    continue

                # 7. Fetch Live Rates & Generate Gemini AI Reply
                rate_alerts = await supabase_get_rate_alerts(workspace_id)
                ai_reply = await generate_gemini_reply(
                    workspace_name=workspace_name,
                    business_type=business_type,
                    rates=rate_alerts,
                    incoming_text=message_body
                )

                # 8. Send WhatsApp Message back via Meta Graph API
                meta_res = await send_meta_whatsapp_message(
                    to_phone=sender_phone,
                    message_text=ai_reply,
                    phone_number_id=phone_number_id
                )

                # 9. Log Outbound AI Message in Supabase
                await supabase_insert_message(
                    workspace_id=workspace_id,
                    contact_id=contact_id,
                    sender_type="ai",
                    content=ai_reply,
                    delivery_status="sent" if meta_res.get("success") else "failed",
                    metadata={
                        "model": GEMINI_MODEL,
                        "recipient": sender_phone,
                        "meta_response": meta_res
                    }
                )
                logger.info(f"AI Auto-reply sent to {sender_phone}: '{ai_reply}'")

    return JSONResponse({"status": "success", "processed": True}, status_code=status.HTTP_200_OK)

# ------------------------------------------------------------------------------
# 7. Dashboard Send Endpoint (Team Inbox & Rate Alerts)
# ------------------------------------------------------------------------------
class SendMessageRequest(BaseModel):
    phone_number: str
    message: str
    workspace_id: Optional[str] = None
    contact_id: Optional[str] = None
    sender_type: Optional[str] = "agent"  # 'agent', 'broadcast', 'rate_alert'
    template_name: Optional[str] = None

@app.post("/api/send-message")
async def api_send_message(payload: SendMessageRequest):
    """
    Endpoint for frontend dashboard (Team Inbox, Rate Alerts, Broadcasts).
    Sends live WhatsApp message via Meta Cloud API and logs into Supabase.
    """
    if not payload.phone_number or not payload.message:
        raise HTTPException(status_code=400, detail="phone_number and message are required")

    # 1. Resolve Workspace
    workspace = await supabase_get_workspace(ws_id=payload.workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    workspace_id = workspace.get("id")
    phone_number_id = workspace.get("phone_number_id") or META_PHONE_NUMBER_ID

    # 2. Resolve Contact
    contact_id = payload.contact_id
    if not contact_id:
        contact = await supabase_get_or_create_contact(
            workspace_id=workspace_id,
            phone_number=payload.phone_number,
            full_name=f"Customer ({payload.phone_number[-4:]})"
        )
        contact_id = contact.get("id")

    # 3. Dispatch via Meta Cloud API
    meta_result = await send_meta_whatsapp_message(
        to_phone=payload.phone_number,
        message_text=payload.message,
        phone_number_id=phone_number_id
    )

    # 4. Insert into Supabase messages
    logged_msg = await supabase_insert_message(
        workspace_id=workspace_id,
        contact_id=contact_id,
        sender_type=payload.sender_type or "agent",
        content=payload.message,
        delivery_status="sent" if meta_result.get("success") else "failed",
        metadata={
            "channel": "dashboard",
            "meta_result": meta_result,
            "template_name": payload.template_name
        }
    )

    return JSONResponse({
        "success": meta_result.get("success", False),
        "message_id": logged_msg.get("id") if logged_msg else None,
        "contact_id": contact_id,
        "recipient": payload.phone_number,
        "delivery_status": "sent" if meta_result.get("success") else "failed",
        "simulated": meta_result.get("simulated", False)
    })

# ------------------------------------------------------------------------------
# 8. Health & System Info
# ------------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
async def health_check():
    """Health status and service configuration overview."""
    workspace = await supabase_get_workspace()
    rate_count = len(await supabase_get_rate_alerts(workspace.get("id"))) if workspace else 0

    return {
        "status": "online",
        "service": "Chirpdesk WhatsApp AI Backend",
        "version": "1.0.0",
        "supabase": {
            "connected": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY),
            "project_url": SUPABASE_URL,
            "active_workspace": workspace.get("name") if workspace else None,
            "rate_alerts_active": rate_count
        },
        "meta_whatsapp": {
            "configured": bool(META_ACCESS_TOKEN and not META_ACCESS_TOKEN.startswith("your_")),
            "phone_number_id": META_PHONE_NUMBER_ID if META_PHONE_NUMBER_ID else "Default",
            "verify_token": META_VERIFY_TOKEN
        },
        "gemini_ai": {
            "configured": bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_")),
            "model": GEMINI_MODEL,
            "mode": "gemini-live" if gemini_client else "smart-hinglish-fallback"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
