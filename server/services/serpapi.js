const fetch = require('node-fetch');

const SERPAPI_BASE = 'https://serpapi.com/search.json';

async function searchFlights({ origin, destination, outbound_date, return_date, travel_class }) {
  const key = process.env.SERPAPI_KEY;
  if (!key || key === 'your_key_here') {
    throw new Error('SERPAPI_KEY not configured. Add your key to the .env file (get one at serpapi.com)');
  }

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin.toUpperCase(),
    arrival_id: destination.toUpperCase(),
    outbound_date,
    currency: 'USD',
    hl: 'en',
    api_key: key,
  });

  if (return_date) {
    params.set('return_date', return_date);
  } else {
    params.set('type', '2');
  }

  if (travel_class && travel_class !== '1') {
    params.set('travel_class', travel_class);
  }

  const url = `${SERPAPI_BASE}?${params}`;
  const redactedUrl = url.replace(key, '***REDACTED***');
  console.log('[SerpApi] Request:', redactedUrl);

  let res;
  try {
    res = await fetch(url);
  } catch (fetchErr) {
    throw new Error(`Network error connecting to SerpApi: ${fetchErr.message}`);
  }

  const rawText = await res.text();
  console.log('[SerpApi] Status:', res.status, '| Response length:', rawText.length);

  if (!res.ok) {
    throw new Error(`SerpApi returned ${res.status}: ${rawText.slice(0, 200)}`);
  }

  let data;
  try { data = JSON.parse(rawText); } catch { throw new Error('SerpApi returned invalid JSON'); }
  if (data.error) throw new Error(data.error);

  const allFlights = [...(data.best_flights || []), ...(data.other_flights || [])];
  console.log('[SerpApi] Found', (data.best_flights || []).length, 'best,', (data.other_flights || []).length, 'other flights');

  return allFlights.slice(0, 20).map((flight, idx) => {
    const legs = flight.flights || [];
    const firstLeg = legs[0] || {};
    const lastLeg = legs[legs.length - 1] || {};

    return {
      id: `serp-${idx}`,
      price: flight.price || null,
      currency: 'USD',
      airline: firstLeg.airline || 'N/A',
      airlineLogo: firstLeg.airline_logo || null,
      flightNumber: firstLeg.flight_number || '',
      departure: firstLeg.departure_airport?.time || '',
      departureAirport: firstLeg.departure_airport?.id || origin,
      arrival: lastLeg.arrival_airport?.time || '',
      arrivalAirport: lastLeg.arrival_airport?.id || destination,
      duration: flight.total_duration ? `${Math.floor(flight.total_duration / 60)}h ${flight.total_duration % 60}m` : '',
      durationMinutes: flight.total_duration || 0,
      stops: legs.length - 1,
      segments: legs.map((leg) => ({
        airline: leg.airline || '',
        flightNumber: leg.flight_number || '',
        departure: leg.departure_airport?.time || '',
        departureAirport: leg.departure_airport?.id || '',
        arrival: leg.arrival_airport?.time || '',
        arrivalAirport: leg.arrival_airport?.id || '',
        duration: leg.duration || 0,
      })),
    };
  });
}

async function getLowestPrice(origin, destination, date) {
  try {
    const results = await searchFlights({ origin, destination, outbound_date: date });
    const prices = results.filter((r) => r.price).map((r) => r.price);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  } catch { return null; }
}

module.exports = { searchFlights, getLowestPrice };
