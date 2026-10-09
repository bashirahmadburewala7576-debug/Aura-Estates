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
- Admin portal is a demo interface and is not protected by real authentication. Do not use for sensitive production data.
- Contact details, agents, property listings and availability are fictional demo data.
- Property images use remote Unsplash URLs, so an internet connection is needed for those images.
- Viewing availability is mocked: weekdays, Saturdays and Sundays have predefined time slots. A real booking backend would need conflict checking.
- Price display is in PKR. Demo property values are representative, not live listings.

## Technical verification walkthrough

1. Open `/admin` and choose **Add property**.
2. Create a property with a title, location, price, area and description.
3. Edit that property's price or status.
4. Return to **Explore homes** and search for the title/location.
5. Open the detail page; test the gallery, favorite and compare controls.
6. Select at least two properties to compare.
7. Submit a valid inquiry and/or select a future viewing date/time.
8. Return to `/admin` and inspect **Inquiries**.
9. Edit or delete the property; confirm deletion cancellation works.
10. Refresh the page and verify the saved state persists.

## Suggested deployment

- Push the project to GitHub.
- On Render, create a **Static Site** with build command `npm install && npm run build` and publish directory `dist`.
- Add a rewrite rule `/*` → `/index.html` with status `200` so React Router deep links work.
- Since this is a frontend-only demo, no environment variables are required.


## Theme customization

Aura Estates includes a luxury light/dark theme toggle in the public navbar and admin toolbar. The selected theme is saved in `localStorage` under `haven-theme`, and a small inline script in `index.html` applies the saved choice before React mounts to prevent a flash of the wrong theme. Shared theme variables and dark-mode component overrides live at the end of `src/styles.css`.

- Default for first-time visitors: light mode.
- Theme preference persists after refresh.
- The same selection applies to public pages and the admin workspace.
- Theme switching uses a subtle transition and respects reduced-motion preferences.

# Aura-Estates
