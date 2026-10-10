const SESSION_KEY = "haven-admin-session";

const USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "adminlogin";
const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aura2026kiran@";

export const usingDefaultCredentials =
  !import.meta.env.VITE_ADMIN_USERNAME && !import.meta.env.VITE_ADMIN_PASSWORD;

export type LlmProvider = "puter" | "pollinations" | "openai" | "groq" | "gemini" | "openrouter" | "xai";

const PROVIDERS: Record<LlmProvider, { endpoint: string; needsKey: boolean; defaultModel: string }> = {
  puter: { endpoint: "", needsKey: false, defaultModel: "gpt-5.4-nano" },
  pollinations: { endpoint: "https://text.pollinations.ai/openai", needsKey: false, defaultModel: "openai" },
  openai: { endpoint: "https://api.openai.com/v1/chat/completions", needsKey: true, defaultModel: "gpt-4o-mini" },
  groq: { endpoint: "https://api.groq.com/openai/v1/chat/completions", needsKey: true, defaultModel: "llama-3.3-70b-versatile" },
  gemini: { endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", needsKey: true, defaultModel: "gemini-2.5-flash" },
  openrouter: { endpoint: "https://openrouter.ai/api/v1/chat/completions", needsKey: true, defaultModel: "meta-llama/llama-3.3-70b-instruct:free" },
  xai: { endpoint: "https://api.x.ai/v1/chat/completions", needsKey: true, defaultModel: "grok-beta" },
};

const requested = (import.meta.env.VITE_LLM_PROVIDER || "puter").toLowerCase() as LlmProvider;
export const llmProvider: LlmProvider = requested in PROVIDERS ? requested : "puter";
export const llmEndpoint = PROVIDERS[llmProvider].endpoint;
export const llmKey =
  import.meta.env.VITE_LLM_API_KEY ||
  import.meta.env.VITE_XAI_API_KEY ||
  (llmProvider === "openai" ? import.meta.env.VITE_OPENAI_API_KEY || "" : "");
export const llmModel =
  import.meta.env.VITE_LLM_MODEL ||
  (llmProvider === "openai" ? import.meta.env.VITE_OPENAI_MODEL || "" : "") ||
  PROVIDERS[llmProvider].defaultModel;
export const llmReady = !PROVIDERS[llmProvider].needsKey || Boolean(llmKey);

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function adminLogin(username: string, password: string): boolean {
  const ok =
    username.trim().toLowerCase() === USERNAME.toLowerCase() && password === PASSWORD;
  if (ok) {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage can be unavailable in private browsing */
    }
  }
  return ok;
}

export function adminLogout(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage can be unavailable in private browsing */
  }
}
