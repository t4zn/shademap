# ShadeMap

**No login. No brand. Just shade — for every rider, everywhere.**

ShadeMap helps gig delivery riders (Swiggy, Zomato, Amazon, Blinkit, Porter, independent couriers) find the nearest verified shade, water, and rest point during extreme heat — regardless of which platform they ride for.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Zero-Config Deployment

Deploy to Vercel with **zero required environment variables**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/shademap)

1. Push to GitHub
2. Import to Vercel
3. Deploy — no configuration needed

The app uses:
- **OpenStreetMap tiles** (CartoDB Positron) — no API key required
- **Mock JSON data** — no database required
- **localStorage** for the partner dashboard — no backend required

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, stats, how it works |
| `/app` | Rider view — map, shelters, filters, heat tracker |
| `/partner` | Partner dashboard — submit & verify rest points |
| `/impact` | Impact metrics & sustainability model |

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + custom Apple-quality design system
- **Framer Motion** — scroll reveals, spring animations, micro-interactions
- **react-leaflet** + OpenStreetMap — zero-config map
- **lucide-react** — consistent line-weight icons

## Project Structure

```
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Design system
│   ├── app/page.tsx       # Rider view
│   ├── partner/page.tsx   # Partner dashboard
│   └── impact/page.tsx    # Impact page
├── components/
│   ├── navbar.tsx         # Frosted-glass navigation
│   ├── map-view.tsx       # Leaflet map with custom markers
│   ├── bottom-sheet.tsx   # Apple Maps-style bottom sheet
│   ├── filter-bar.tsx     # Filter chips + locate button
│   ├── shelter-card.tsx   # Shelter list cards
│   ├── shelter-detail.tsx # Shelter detail modal
│   ├── heat-debt-widget.tsx  # Radial heat exposure tracker
│   ├── route-comparison.tsx  # Route comparison card
│   └── animated-counter.tsx  # Scroll-triggered stat counter
├── data/
│   └── shelters.ts        # Mock shelter data (swap for API)
└── lib/
    └── utils.ts           # Utilities (cn, haversine, etc.)
```

## License

MIT
