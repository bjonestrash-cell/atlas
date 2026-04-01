const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { all } = require('../db/schema');

// In-memory cache: { key: { data, timestamp } }
const cache = {};
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

// Map program names to search-friendly brand names
const BRAND_MAP = {
  'Chase Sapphire Reserve (UR)': 'Chase Sapphire Reserve',
  'Chase Sapphire Preferred (UR)': 'Chase Sapphire Preferred',
  'Chase Freedom Unlimited (UR)': 'Chase Freedom Unlimited',
  'Amex Platinum (MR)': 'Amex Platinum card',
  'Amex Gold (MR)': 'Amex Gold card',
  'Amex Everyday (MR)': 'Amex Everyday card',
  'Citi Premier (ThankYou)': 'Citi Premier card',
  'Citi Prestige (ThankYou)': 'Citi Prestige card',
  'Capital One Venture X': 'Capital One Venture X',
  'Capital One Venture': 'Capital One Venture',
  'Bilt Mastercard': 'Bilt Mastercard rewards',
  'Wells Fargo Autograph': 'Wells Fargo Autograph card',
  'Delta SkyMiles': 'Delta SkyMiles',
  'United MileagePlus': 'United MileagePlus',
  'American AAdvantage': 'American Airlines AAdvantage',
  'Southwest Rapid Rewards': 'Southwest Rapid Rewards',
  'Alaska Mileage Plan': 'Alaska Airlines Mileage Plan',
  'JetBlue TrueBlue': 'JetBlue TrueBlue',
  'Air France/KLM Flying Blue': 'Flying Blue Air France KLM',
  'British Airways Avios': 'British Airways Avios',
  'Emirates Skywards': 'Emirates Skywards',
  'Lufthansa Miles & More': 'Lufthansa Miles and More',
  'Marriott Bonvoy': 'Marriott Bonvoy',
  'Hilton Honors': 'Hilton Honors',
  'World of Hyatt': 'World of Hyatt',
  'IHG One Rewards': 'IHG One Rewards',
  'Wyndham Rewards': 'Wyndham Rewards',
  'Choice Privileges': 'Choice Privileges',
  'Avis Preferred Points': 'Avis Preferred loyalty',
  'Enterprise Plus': 'Enterprise Plus rewards',
  'Hertz Gold Plus': 'Hertz Gold Plus Rewards',
  'National Emerald Club': 'National Emerald Club',
};

const CATEGORY_MAP = {
  'Chase Sapphire Reserve (UR)': 'credit_card', 'Chase Sapphire Preferred (UR)': 'credit_card',
  'Chase Freedom Unlimited (UR)': 'credit_card', 'Amex Platinum (MR)': 'credit_card',
  'Amex Gold (MR)': 'credit_card', 'Amex Everyday (MR)': 'credit_card',
  'Citi Premier (ThankYou)': 'credit_card', 'Citi Prestige (ThankYou)': 'credit_card',
  'Capital One Venture X': 'credit_card', 'Capital One Venture': 'credit_card',
  'Bilt Mastercard': 'credit_card', 'Wells Fargo Autograph': 'credit_card',
  'Delta SkyMiles': 'airline', 'United MileagePlus': 'airline',
  'American AAdvantage': 'airline', 'Southwest Rapid Rewards': 'airline',
  'Alaska Mileage Plan': 'airline', 'JetBlue TrueBlue': 'airline',
  'Air France/KLM Flying Blue': 'airline', 'British Airways Avios': 'airline',
  'Emirates Skywards': 'airline', 'Lufthansa Miles & More': 'airline',
  'Marriott Bonvoy': 'hotel', 'Hilton Honors': 'hotel',
  'World of Hyatt': 'hotel', 'IHG One Rewards': 'hotel',
  'Wyndham Rewards': 'hotel', 'Choice Privileges': 'hotel',
  'Avis Preferred Points': 'rental_car', 'Enterprise Plus': 'rental_car',
  'Hertz Gold Plus': 'rental_car', 'National Emerald Club': 'rental_car',
};

async function searchNews(query) {
  const key = process.env.SERPAPI_KEY;
  if (!key || key === 'your_key_here') return [];

  const cacheKey = query.toLowerCase();
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${query} promotion deal news 2026`,
      num: '3',
      api_key: key,
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const results = (data.organic_results || []).slice(0, 3).map((r) => ({
      title: r.title || '',
      snippet: r.snippet || '',
      link: r.link || '',
      source: r.source || r.displayed_link || '',
      date: r.date || '',
    }));
    cache[cacheKey] = { data: results, timestamp: Date.now() };
    return results;
  } catch (e) {
    console.error('Promo search failed:', e.message);
    return [];
  }
}

// GET /api/promotions — fetches news for all active user programs
// Optional ?tab=favorites|credit_card|airline|hotel|rental_car to filter
router.get('/', async (req, res) => {
  const tab = req.query.tab || 'all';

  const activePrograms = all('SELECT program_name, balance, favorite FROM points_balances WHERE balance > 0');
  const statusPrograms = all("SELECT program_name, category FROM loyalty_status WHERE status_level != '' AND status_level IS NOT NULL");

  const favoriteNames = new Set(activePrograms.filter((p) => p.favorite).map((p) => p.program_name));

  const allProgramNames = new Set();
  activePrograms.forEach((p) => allProgramNames.add(p.program_name));
  statusPrograms.forEach((p) => allProgramNames.add(p.program_name));

  // Build list of active program names per category
  const programsByCat = { credit_card: [], airline: [], hotel: [], rental_car: [] };
  allProgramNames.forEach((name) => {
    const cat = CATEGORY_MAP[name] || 'credit_card';
    programsByCat[cat].push(name);
  });

  // Determine which programs to fetch based on tab
  let namesToFetch = [];
  if (tab === 'favorites') {
    namesToFetch = [...favoriteNames];
  } else if (tab !== 'all' && programsByCat[tab]) {
    namesToFetch = programsByCat[tab];
  } else {
    namesToFetch = [...allProgramNames];
  }

  if (namesToFetch.length === 0) {
    return res.json({
      news: { credit_card: [], airline: [], hotel: [], rental_car: [] },
      favorites: [...favoriteNames],
      activeCats: Object.fromEntries(Object.entries(programsByCat).map(([k, v]) => [k, v.length])),
    });
  }

  const results = { credit_card: [], airline: [], hotel: [], rental_car: [] };
  const limited = namesToFetch.slice(0, 8);

  await Promise.all(limited.map(async (name) => {
    const brand = BRAND_MAP[name] || name;
    const cat = CATEGORY_MAP[name] || 'credit_card';
    const news = await searchNews(brand);
    if (news.length > 0) {
      results[cat].push({ program: name, items: news });
    }
  }));

  res.json({
    news: results,
    favorites: [...favoriteNames],
    activeCats: Object.fromEntries(Object.entries(programsByCat).map(([k, v]) => [k, v.length])),
  });
});

module.exports = router;
