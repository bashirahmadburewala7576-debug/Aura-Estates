# Aura Estates Real Estate Marketplace

A responsive React + TypeScript hackathon prototype for a premium real estate marketplace.

## Run locally

1. Install Node.js 20+.
2. Extract this folder.
3. Open a terminal inside `aura-estates`.
4. Run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

For a production build:

```bash
npm run build
npm run preview
```

## What's included

- Responsive public home page, property catalogue, property detail pages, About, Contact, Favorites, Comparison and Admin Portal.
- Login-protected admin portal (credentials come from `.env`, session kept per browser tab) with a Log out button.
- OpenAI-powered AI assistant inside the admin workspace, with live context of the inventory and inquiries.
- Public "Ask Aura" AI concierge on every public page, plus an admin-only "Ask AI" assistant inside the login-protected `/admin` portal — both with clickable property recommendations (free keyless LLM by default; swappable via `.env`).
- 30 structured demo properties, with three-image galleries and property/agent details.
- Combined catalogue filters for location/title, buy/rent, type, min/max price, bedrooms, bathrooms, furnishing, status, amenities, minimum area and featured status.
- Sorting by newest, price low-to-high, price high-to-low and largest area.
- Active filter chips, result counts, clear-all and no-results state.
- Favorites and up-to-four-property comparison.
- Viewing request flow with date-dependent mock availability, contact validation and confirmation.
- Inquiry form and admin inquiry management/status.
- Admin dashboard with computed property statistics, recent listings and status distribution.
- Add, edit, delete property, delete confirmation/cancel, feature toggle, admin search/status filtering.
- Shared property state between public/admin, persisted in localStorage.
- Responsive styling for desktop, tablet and mobile.

## Important prototype notes

- The application is frontend-only. `localStorage` persists data in the same browser profile; it is not a shared server database or multi-user authentication.
- The admin portal is gated by a lightweight login whose credentials live in `.env`. This protects the UI in a demo, but it is client-side only — not production-grade security. Do not use for sensitive production data.
- Contact details, agents, property listings and availability are fictional demo data.
- Property images use remote Unsplash URLs, so an internet connection is needed for those images.
- Viewing availability is mocked: weekdays, Saturdays and Sundays have predefined time slots. A real booking backend would need conflict checking.
- Price display is in PKR. Demo property values are representative, not live listings.

## Admin login

Visiting `/admin` now shows a sign-in screen. Credentials are read from environment variables in a `.env` file at the project root (`.env` is git-ignored; `.env.example` is a template):

```bash
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=aura2026
```

If unset, the demo defaults above are used and the login screen shows a hint. Change them before sharing a deployed site. The session is stored in `sessionStorage`, so it lasts until the browser tab is closed; the admin sidebar has a **Log out** button.

## AI assistant & public concierge (configurable LLM)

Both the admin **Ask AI** assistant and the public **Ask Aura** concierge run on a pluggable LLM configured in `.env`:

```bash
VITE_LLM_PROVIDER=puter   # default — free, keyless, no signup, no credits needed
VITE_LLM_MODEL=gpt-5.4-nano
VITE_LLM_API_KEY=
```

| Provider | Key needed? | Notes |
|---|---|---|
| `puter` (default) | No | Free & keyless via [Puter.js](https://developer.puter.com). Loads the SDK from `js.puter.com`; each visitor's own free Puter account covers usage ("User-Pays"). No signup, no credits, no server. |
| `gemini` | Free key from aistudio.google.com/api-key | Google's free daily tier, model `gemini-2.5-flash`. |
| `groq` | Free key from console.groq.com | Fast free tier, Llama 3.3 70B. |
| `openrouter` | Free key from openrouter.ai | Use a `:free` model id. |
| `openai` | Paid key (needs credits) | Model `gpt-4o-mini`. |

Change `VITE_LLM_PROVIDER` (and key/model if required), then restart `npm run dev`. The admin assistant receives the live inventory + inquiry inbox; it can summarise stock, draft listing copy, prioritise leads and draft reply templates.

## AI concierge ("Ask Aura") & admin assistant

- **Public:** the **Ask Aura** button appears on every public page (Home, Explore, Property, About, Contact, Favorites, Compare and 404). It is brand-trained, answers only from the live inventory, keeps prices in PKR, supports Roman Urdu, and shows clickable property cards. It never sees inquiry data and is capped at 30 messages per browser session.
- **Admin:** inside `/admin`, the **Ask AI** sidebar assistant receives the live inventory **and** the inquiry inbox (summarise stock, draft listing copy, prioritise leads, draft reply templates).

Both run on the same configurable LLM. The **Admin** link/button in the site header and footer is shown only after you log in — public visitors never see a link to the admin portal (it stays reachable at `/admin` behind the login).

Note: on a frontend-only app any API key is bundled into the client JS. The default keyless provider avoids that risk; if you switch to a keyed provider, set a spending limit, and proxy calls through a backend for production traffic.

## Technical verification walkthrough

1. Open `/admin`, sign in with the admin credentials, and choose **Add property**.
2. Create a property with a title, location, price, area and description.
3. Edit that property's price or status.
4. Return to **Explore homes** and search for the title/location.
5. Open the detail page; test the gallery, favorite and compare controls.
6. Select at least two properties to compare.
7. Submit a valid inquiry and/or select a future viewing date/time.
8. Return to `/admin` and inspect **Inquiries**.
9. Open the **AI assistant** and ask e.g. "Summarize my inventory" (works out of the box with the default free provider).
10. Edit or delete the property; confirm deletion cancellation works.
11. Log out, confirm `/admin` requires sign-in again, then refresh the page and verify saved data persists after logging back in.

## Suggested deployment

- Push the project to GitHub.
- On Render, create a **Static Site** with build command `npm install && npm run build` and publish directory `dist`.
- Add a rewrite rule `/*` → `/index.html` with status `200` so React Router deep links work.
- Since this is a frontend-only demo, set `VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD` and (optionally) `VITE_LLM_PROVIDER` / `VITE_LLM_API_KEY` / `VITE_LLM_MODEL` in the Render service environment (build-time variables) rather than committing them. The default keyless provider needs no environment variables for the AI features.


## Theme customization

Aura Estates includes a luxury light/dark theme toggle in the public navbar and admin toolbar. The selected theme is saved in `localStorage` under `haven-theme`, and a small inline script in `index.html` applies the saved choice before React mounts to prevent a flash of the wrong theme. Shared theme variables and dark-mode component overrides live at the end of `src/styles.css`.

- Default for first-time visitors: light mode.
- Theme preference persists after refresh.
- The same selection applies to public pages and the admin workspace.
- Theme switching uses a subtle transition and respects reduced-motion preferences.

# Aura-Estates
