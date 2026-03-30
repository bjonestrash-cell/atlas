# Atlas — Personal Travel Planner

A full-stack travel command center for planning trips, tracking points & miles, searching flights, and optimizing travel spending.

## Features

- **Trip Dashboard** — Annual calendar view with all planned trips, quick stats, upcoming trip countdown
- **Destination Tracker** — Add/edit/delete trips with filters and sorting
- **Flight Search** — Live flight pricing via Amadeus API (origin, destination, dates, passengers)
- **Points & Miles Manager** — Track balances across 7+ loyalty programs with estimated cash values
- **Points vs. Cash Optimizer** — Side-by-side comparison to decide whether to use points or pay cash
- **Price Alerts** — Set target prices for routes; daily automated checks via Amadeus API
- **Financial Summary** — Monthly budget vs. actual tracking with bar and line charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| API | Amadeus Flight Offers |
| Charts | Recharts |
| Dates | date-fns |
| Cron | node-cron |

## Getting Amadeus API Keys

1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Create a free account (Self-Service tier)
3. Create a new app in your dashboard
4. Copy your **API Key** and **API Secret**
5. The free tier uses the test environment (`https://test.api.amadeus.com`)

## Setup

### 1. Clone and install dependencies

```bash
cd atlas
npm run install:all
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Amadeus credentials:

```
AMADEUS_CLIENT_ID=your_api_key_here
AMADEUS_CLIENT_SECRET=your_api_secret_here
AMADEUS_BASE_URL=https://test.api.amadeus.com
PORT=3001
```

### 3. Seed sample data

```bash
npm run seed
```

This loads sample trips, points balances, price alerts, and budget entries.

### 4. Run in development mode

```bash
npm run dev
```

This starts both:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173` (proxies API calls to backend)

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST/PUT/DELETE | `/api/trips` | Trip CRUD |
| GET/POST/PUT/DELETE | `/api/points` | Points program CRUD |
| GET/POST | `/api/points/transactions` | Points earned/redeemed |
| GET | `/api/flights/search` | Amadeus flight search |
| GET/POST/PUT/DELETE | `/api/alerts` | Price alert CRUD |
| GET/POST/PUT/DELETE | `/api/budget` | Budget entry CRUD |
| GET | `/api/budget/summary` | Aggregated budget data |

## Default CPP Values

| Program | Cents Per Point |
|---------|----------------|
| Chase Ultimate Rewards | 2.0 |
| Amex Membership Rewards | 2.0 |
| Delta SkyMiles | 1.2 |
| United MileagePlus | 1.3 |
| Southwest Rapid Rewards | 1.5 |
| Marriott Bonvoy | 0.8 |
| Hilton Honors | 0.6 |

All CPP values are configurable per program.

## Price Alert Cron

A daily cron job runs at 8:00 AM to check all active price alerts against the Amadeus API. If the current price drops below the target, it's flagged in the Alerts page.

## Design

- Dark mode (navy/slate base `#0f1117`)
- Electric blue accents (`#3b82f6`)
- IBM Plex Mono for labels, Inter for body text
- Data-dense dashboard aesthetic
- Mobile-responsive, optimized for desktop/tablet
