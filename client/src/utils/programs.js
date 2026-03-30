// All loyalty programs with default CPP and transfer partners

export const PROGRAMS = {
  // Airlines
  'Delta SkyMiles': { category: 'airline', cpp: 1.2, partners: ['Virgin Atlantic', 'Air France/KLM', 'Korean Air'] },
  'United MileagePlus': { category: 'airline', cpp: 1.3, partners: ['Star Alliance', 'Lufthansa', 'ANA', 'Singapore'] },
  'American AAdvantage': { category: 'airline', cpp: 1.5, partners: ['Oneworld', 'British Airways', 'Japan Airlines', 'Cathay Pacific'] },
  'Southwest Rapid Rewards': { category: 'airline', cpp: 1.5, partners: [] },
  'Alaska Mileage Plan': { category: 'airline', cpp: 1.8, partners: ['Oneworld', 'Emirates', 'Singapore', 'Cathay Pacific'] },
  'JetBlue TrueBlue': { category: 'airline', cpp: 1.3, partners: ['Hawaiian', 'Icelandair'] },
  'Air France/KLM Flying Blue': { category: 'airline', cpp: 1.4, partners: ['SkyTeam', 'Delta', 'KLM'] },
  'British Airways Avios': { category: 'airline', cpp: 1.5, partners: ['Oneworld', 'American', 'Iberia', 'Aer Lingus'] },
  'Emirates Skywards': { category: 'airline', cpp: 1.2, partners: ['Qantas', 'flydubai'] },

  // Hotels
  'Marriott Bonvoy': { category: 'hotel', cpp: 0.8, partners: ['United', 'Delta', 'American', 'Alaska', 'Emirates'] },
  'Hilton Honors': { category: 'hotel', cpp: 0.6, partners: ['Amazon', 'Lyft'] },
  'World of Hyatt': { category: 'hotel', cpp: 1.7, partners: ['United', 'American', 'JetBlue', 'Small Luxury Hotels'] },
  'IHG One Rewards': { category: 'hotel', cpp: 0.5, partners: ['United'] },
  'Wyndham Rewards': { category: 'hotel', cpp: 1.1, partners: ['United'] },

  // Credit Card Transferable
  'Chase Ultimate Rewards': { category: 'credit_card', cpp: 2.0, partners: ['United', 'Hyatt', 'Southwest', 'British Airways', 'Air France/KLM', 'Singapore', 'JetBlue'] },
  'Amex Membership Rewards': { category: 'credit_card', cpp: 2.0, partners: ['Delta', 'ANA', 'Singapore', 'Hilton', 'Marriott', 'British Airways', 'Emirates'] },
  'Citi ThankYou Points': { category: 'credit_card', cpp: 1.7, partners: ['JetBlue', 'Singapore', 'Turkish', 'Air France/KLM', 'Etihad'] },
  'Capital One Miles': { category: 'credit_card', cpp: 1.7, partners: ['Turkish', 'Air France/KLM', 'British Airways', 'Emirates', 'Singapore'] },
  'Bilt Rewards': { category: 'credit_card', cpp: 2.0, partners: ['United', 'American', 'Hyatt', 'Turkish', 'Air France/KLM', 'Alaska'] },
};

export const PROGRAM_NAMES = Object.keys(PROGRAMS);

export const CATEGORY_LABELS = {
  airline: 'Airlines',
  hotel: 'Hotels',
  credit_card: 'Credit Cards',
};

export const CATEGORY_ORDER = ['credit_card', 'airline', 'hotel'];

export function getCpp(programName) {
  return PROGRAMS[programName]?.cpp || 1.0;
}

export function getPartners(programName) {
  return PROGRAMS[programName]?.partners || [];
}

export function getCategory(programName) {
  return PROGRAMS[programName]?.category || 'other';
}
