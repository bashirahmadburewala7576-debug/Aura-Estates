/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_USERNAME?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_LLM_PROVIDER?: string;
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_LLM_MODEL?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type PuterChatRole = "system" | "user" | "assistant" | "tool";
type PuterContentPart = { type?: string; text?: string };
type PuterChatResult =
  | string
  | { message?: { content?: string | PuterContentPart[] }; text?: string };

interface PuterAi {
  chat(
    messages: { role: PuterChatRole; content: string }[],
    options?: { model?: string; temperature?: number; normalize?: boolean; stream?: boolean },
  ): Promise<PuterChatResult>;
}

interface Window {
  puter?: { ai: PuterAi };
}
