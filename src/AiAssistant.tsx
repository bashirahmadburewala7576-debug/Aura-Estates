import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bot, Send, Sparkles, User, X } from "lucide-react";
import type { Property } from "./data";
import { llmEndpoint, llmKey, llmModel, llmProvider, llmReady } from "./auth";

type Variant = "admin" | "public";
type ChatMessage = { role: "user" | "assistant"; content: string };
type InquiryLike = { id: string; propertyId: string; name: string; email: string; message: string; status: string };

const SESSION_MSG_KEY = "haven-assistant-msgs";
const PUBLIC_MSG_CAP = 30;

const moneyShort = (n: number, listing: string) =>
  listing === "Rent" ? `PKR ${n.toLocaleString("en-PK")}/mo` : n >= 1000000 ? `PKR ${(n / 1000000).toFixed(2)}M` : `PKR ${n.toLocaleString("en-PK")}`;

const ADMIN_PROMPTS = [
  "Summarize my inventory",
  "Which homes are priced highest?",
  "Draft marketing blurbs for featured homes",
  "Which new inquiries should I prioritise?",
];

const PUBLIC_PROMPTS = [
  "Find me a 3-bed home in Lahore under PKR 50M",
  "Which homes are for rent?",
  "Show me your featured properties",
  "How do I book a viewing?",
];

function inventoryBlock(properties: Property[]): string {
  return properties
    .map(p => `- ${p.id} · ${p.title} · ${p.type} (${p.listing}) · ${p.location} · ${moneyShort(p.price, p.listing)} · ${p.area.toLocaleString()} sq ft · ${p.bedrooms} bed / ${p.bathrooms} bath · ${p.status} · ${p.furnishing} · amenities: ${p.amenities.slice(0, 6).join(", ")}${p.featured ? " · FEATURED" : ""}`)
    .join("\n");
}

function publicPersona(properties: Property[]): string {
  return [
    'You are "Aura", the official AI concierge of Aura Estates — a premium yet warm real-estate marketplace in Lahore, Pakistan. You live in the "Ask Aura" chat widget that appears on every page of the site. The brand line is: "Find a place that feels like home."',
    "",
    "TONE & STYLE:",
    "- Warm, polished, concise — like a trusted property advisor. Keep replies under ~120 words unless the user asks for more detail.",
    "- Prices always in PKR: sale prices like PKR 42.50M (or PKR 850,000 when under 1M), rents like PKR 450,000/mo. Never convert currencies.",
    "- If the user writes in Roman Urdu or Urdu, reply in the same style.",
    "",
    "WHAT YOU KNOW ABOUT THE SITE (explain only when it helps):",
    "- Explore homes: search by neighbourhood, city or property name; filters for Buy/Rent, type (House, Apartment, Villa, Townhouse, Penthouse), min/max price, bedrooms, bathrooms, furnishing, status, amenities, minimum area and featured-only; sorting by newest, price and largest area.",
    "- Saved homes: tap the heart on any card; the Saved link in the navbar keeps the shortlist.",
    "- Compare: add up to four homes with the Compare button and open the Compare page for a side-by-side table.",
    "- Property page: photo gallery, full details, amenities, agent contact, plus two actions — send an inquiry, or 'Request a viewing' (pick a date and one of that day's time slots). Submissions reach the property team, who follow up personally.",
    "- Viewing time slots: weekdays 10:00 AM, 12:30 PM, 3:00 PM and 5:00 PM; Saturdays 10:00 AM, 12:00 PM and 2:00 PM; Sundays 11:00 AM and 1:30 PM.",
    "- Homepage neighbourhoods: DHA Lahore (space to grow), Gulberg (city at your doorstep), Bahria Town (room to breathe).",
    "- Contact: bashirahmad7576@gmail.com · +923258247569 · Lahore, Pakistan. The 'Our story' page explains the brand.",
    "",
    "RULES FOR ANSWERS:",
    "1. Recommend ONLY homes from the LIVE INVENTORY below — never invent a property, price, amenity or availability.",
    "2. When recommending, list 1-3 best matches, each on one line: **Exact Property Title** — location · price · beds/baths · a short hook based on its amenities or description.",
    "3. Use each property's EXACT title from the inventory so the widget can link it. Never paraphrase or shorten titles.",
    "4. If nothing matches, say so honestly, then offer the closest alternatives or suggest loosening one filter (area, bedrooms or budget).",
    "5. For 'how do I...' questions, give a short click-path (e.g. 'Open Explore homes → set Buy + 3 beds → tap the heart to save').",
    "6. Politely steer back to homes and the site if asked about unrelated topics (coding, news, personal advice).",
    "7. Never ask for or repeat personal data (CNIC, bank details, passwords). Viewing and inquiry forms live on each property page — do not collect information in chat.",
    "8. Only 'Available' homes can be visited or transacted; mention it if a match is Sold or Rented.",
    "",
    `LIVE INVENTORY (${properties.length} properties):`,
    inventoryBlock(properties) || "(no properties)",
  ].join("\n");
}

function adminPersona(properties: Property[], inquiries: InquiryLike[]): string {
  const inquiryLines = inquiries
    .slice(0, 25)
    .map(i => `- [${i.status}] ${i.name} <${i.email}> about ${i.propertyId}: ${i.message.replace(/\s+/g, " ").slice(0, 160)}`)
    .join("\n");
  return [
    "You are the Aura Estates admin assistant — an AI copilot for the internal admin portal of a Pakistani luxury real-estate marketplace (all prices in PKR).",
    "You can see the live inventory and inquiry inbox below. Tasks you handle well:",
    "- Inventory snapshots: totals, available vs sold/rented, featured count, price distribution and gaps (e.g. few family homes in one neighbourhood).",
    "- Listing copy: draft titles, blurbs (one hook line + three short bullets) and SEO-friendly descriptions grounded only in each property's real details.",
    "- Inquiries: summarise the inbox, prioritise by status and urgency, and draft short professional replies using [Name] placeholders — never invent customer details.",
    "- Operations advice: pricing sanity checks, and which listings to feature or prune.",
    "Always cite exact titles, IDs and figures from the data. Never invent properties, people or numbers. Be concise and practical.",
    "",
    `INVENTORY (${properties.length} properties):`,
    inventoryBlock(properties) || "(no properties)",
    "",
    `INQUIRIES (${inquiries.length} total):`,
    inquiryLines || "(none yet)",
  ].join("\n");
}

function mentionedProperties(text: string, properties: Property[]): Property[] {
  const lower = text.toLowerCase();
  return properties
    .filter(p => lower.includes(p.title.toLowerCase()) || lower.includes(p.id.toLowerCase()))
    .slice(0, 3);
}

export default function AiAssistant({ variant = "admin", properties, inquiries = [], onClose }: { variant?: Variant; properties: Property[]; inquiries?: InquiryLike[]; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy || !llmReady) return;
    if (variant === "public") {
      let used = 0;
      try { used = Number(sessionStorage.getItem(SESSION_MSG_KEY) || "0"); } catch { used = 0; }
      if (used >= PUBLIC_MSG_CAP) {
        setError("You've reached the assistant limit for this session. Please try again later, or contact us at bashirahmad7576@gmail.com.");
        return;
      }
      try { sessionStorage.setItem(SESSION_MSG_KEY, String(used + 1)); } catch { /* storage can be unavailable */ }
    }
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const system = variant === "public" ? publicPersona(properties) : adminPersona(properties, inquiries);
      let reply = "";

      if (llmProvider === "puter") {
        if (!window.puter?.ai?.chat) {
          setError(variant === "admin"
            ? "Puter.js failed to load. Check your internet connection and reload the page."
            : "The concierge is offline right now. Please check your connection and try again.");
          return;
        }
        const result = await window.puter.ai.chat(
          [{ role: "system", content: system }, ...history],
          { model: llmModel, temperature: 0.4, normalize: true },
        );
        const content =
          typeof result === "string" ? result : result?.message?.content;
        reply = typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content.map(part => part?.text ?? "").join("")
            : content ? String(content) : "";
      } else {
        const res = await fetch(llmEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(llmKey ? { Authorization: `Bearer ${llmKey}` } : {}),
          },
          body: JSON.stringify({
            model: llmModel,
            temperature: 0.4,
            messages: [{ role: "system", content: system }, ...history],
          }),
        });
        if (!res.ok) {
          let detail = "";
          try { detail = await res.text(); } catch { /* body may be unavailable */ }
          const outOfCredits = /insufficient_quota|credit_balance|exceeded your current quota/i.test(detail);
          if (variant === "admin") {
            if (res.status === 401) setError(`The ${llmProvider} API key was rejected. Check VITE_LLM_API_KEY / VITE_LLM_PROVIDER in your .env file.`);
            else if (res.status === 429 && outOfCredits) setError(`Your ${llmProvider} account is out of credits. Add billing, or switch VITE_LLM_PROVIDER in .env to the free "puter" option.`);
            else if (res.status === 429) setError(`Rate limit reached on ${llmProvider}. Try again shortly, or switch VITE_LLM_PROVIDER in .env.`);
            else setError(`LLM request failed (HTTP ${res.status}) via ${llmProvider}.`);
          } else {
            setError(res.status === 429 && outOfCredits
              ? "The concierge is temporarily out of capacity. Please try again later or contact us at bashirahmad7576@gmail.com."
              : "The concierge is unavailable right now. Please try again later or contact us at bashirahmad7576@gmail.com.");
          }
          return;
        }
        const data = await res.json();
        reply = data?.choices?.[0]?.message?.content ?? "";
      }

      if (reply?.trim()) setMessages([...history, { role: "assistant", content: reply.trim() }]);
      else setError("The assistant returned an empty response. Try rephrasing.");
    } catch {
      setError(variant === "admin" ? "Could not reach the LLM provider. Check your internet connection and try again." : "The concierge is offline right now. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const prompts = variant === "public" ? PUBLIC_PROMPTS : ADMIN_PROMPTS;
  const freeProvider = llmProvider === "puter" || llmProvider === "pollinations";

  return (
    <>
      <div className="assistant-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}/>
      <aside className="assistant-panel" role="dialog" aria-modal="true" aria-label={variant === "public" ? "Ask Aura concierge" : "AI assistant"}>
        <header className="assistant-header">
          <span className="assistant-avatar"><Bot size={18}/></span>
          <div>
            <h3>{variant === "public" ? "Ask Aura" : "Aura AI assistant"}</h3>
            <small>{variant === "public" ? "Homes, prices & viewings" : llmModel}{llmReady ? ` · ${freeProvider ? "free" : "connected"}` : " · not configured"}</small>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close assistant"><X size={17}/></button>
        </header>
        {variant === "admin" && !llmReady && (
          <div className="assistant-setup">
            <AlertTriangle size={18}/>
            <b>LLM not configured</b>
            <p>Set <code>VITE_LLM_PROVIDER=puter</code> (free, no key, no signup) in <code>.env</code>, or pick <code>openai</code> / <code>gemini</code> / <code>groq</code> with a key, then restart <code>npm run dev</code>.</p>
          </div>
        )}
        <div className="assistant-messages" ref={listRef}>
          {!messages.length && (
            <div className="assistant-empty">
              <span className="assistant-empty-icon"><Sparkles size={22}/></span>
              <b>{!llmReady ? "Aura is unavailable right now" : variant === "public" ? "How can Aura help today?" : "Ask anything about your portfolio"}</b>
              <p>{!llmReady
                ? "The concierge isn't configured yet. Please contact us at bashirahmad7576@gmail.com."
                : variant === "public"
                  ? "Ask about homes, prices, neighbourhoods or how to book a viewing — answers use our live collection."
                  : "The assistant sees your live inventory and inquiries, so answers stay specific to Aura Estates."}</p>
              {llmReady && <div className="assistant-chips">{prompts.map(p => <button key={p} disabled={busy} onClick={() => send(p)}>{p}</button>)}</div>}
            </div>
          )}
          {messages.map((m, i) => {
            const recs = m.role === "assistant" ? mentionedProperties(m.content, properties) : [];
            return (
              <div key={i} className={`assistant-msg ${m.role}`}>
                <span className="msg-avatar">{m.role === "assistant" ? <Bot size={14}/> : <User size={14}/>}</span>
                <div className="msg-body">
                  <p>{m.content}</p>
                  {recs.length > 0 && (
                    <div className="assistant-prop-links">
                      {recs.map(p => (
                        <Link key={p.id} to={`/property/${p.id}`} onClick={onClose}>
                          <img src={p.images[0]} alt=""/>
                          <span><b>{p.title}</b><small>{p.location} · {moneyShort(p.price, p.listing)}</small></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {busy && <div className="assistant-msg assistant"><span className="msg-avatar"><Bot size={14}/></span><p className="msg-typing"><i/><i/><i/></p></div>}
        </div>
        {error && <div className="assistant-error"><AlertTriangle size={14}/>{error}</div>}
        <form className="assistant-input" onSubmit={e => { e.preventDefault(); send(input); }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={!llmReady ? "Concierge unavailable" : variant === "public" ? "Ask about homes, prices, viewings…" : "Ask about your listings…"} disabled={!llmReady || busy} aria-label="Message the AI assistant"/>
          <button className="button button-dark" type="submit" disabled={!llmReady || busy || !input.trim()} aria-label="Send message"><Send size={15}/></button>
        </form>
      </aside>
    </>
  );
}
