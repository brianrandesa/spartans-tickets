import type { VercelRequest, VercelResponse } from '@vercel/node';

// Exact Denver Coliseum seating configuration
const SECTION_CONFIG: Record<string, { rows: number; seatsPerRow: number; level: string }> = {
  // Lower Level - Standard sections (4 rows)
  '101': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '102': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '103': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '104': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '105': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '106': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '108': { rows: 4, seatsPerRow: 13, level: 'Lower' },
  '113': { rows: 4, seatsPerRow: 11, level: 'Lower' },
  '114': { rows: 4, seatsPerRow: 10, level: 'Lower' },
  '116': { rows: 4, seatsPerRow: 10, level: 'Lower' },
  '117': { rows: 4, seatsPerRow: 11, level: 'Lower' },
  '118': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '119': { rows: 4, seatsPerRow: 13, level: 'Lower' },
  '120': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '121': { rows: 4, seatsPerRow: 13, level: 'Lower' },
  '122': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '123': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '124': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '130': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '131': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '132': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '133': { rows: 4, seatsPerRow: 12, level: 'Lower' },
  '134': { rows: 4, seatsPerRow: 12, level: 'Lower' },

  // Lower Level - Floor sections (11 rows)
  '109': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '110': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '111': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '112': { rows: 11, seatsPerRow: 13, level: 'Floor' },
  '125': { rows: 11, seatsPerRow: 13, level: 'Floor' },
  '126': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '127': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '128': { rows: 11, seatsPerRow: 14, level: 'Floor' },
  '129': { rows: 11, seatsPerRow: 13, level: 'Floor' },

  // Upper Level - Corner sections (4 rows)
  '201': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '202': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '203': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '204': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '205': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '206': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '229': { rows: 4, seatsPerRow: 13, level: 'Upper' },
  '230': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '231': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '232': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '233': { rows: 4, seatsPerRow: 15, level: 'Upper' },
  '234': { rows: 4, seatsPerRow: 12, level: 'Upper' },

  // Upper Level - Floor sections (8 rows)
  '207': { rows: 8, seatsPerRow: 15, level: 'Upper' },
  '208': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '209': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '210': { rows: 8, seatsPerRow: 15, level: 'Upper' },
  '211': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '212': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '213': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '225': { rows: 8, seatsPerRow: 15, level: 'Upper' },
  '226': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '227': { rows: 8, seatsPerRow: 14, level: 'Upper' },
  '228': { rows: 8, seatsPerRow: 15, level: 'Upper' },

  // Upper Level - Side sections (4 rows)
  '214': { rows: 4, seatsPerRow: 11, level: 'Upper' },
  '215': { rows: 4, seatsPerRow: 12, level: 'Upper' },
  '216': { rows: 4, seatsPerRow: 11, level: 'Upper' },
  '217': { rows: 4, seatsPerRow: 12, level: 'Upper' },
  '218': { rows: 4, seatsPerRow: 12, level: 'Upper' },
  '219': { rows: 4, seatsPerRow: 13, level: 'Upper' },
  '220': { rows: 4, seatsPerRow: 12, level: 'Upper' },
  '221': { rows: 4, seatsPerRow: 11, level: 'Upper' },
  '222': { rows: 4, seatsPerRow: 10, level: 'Upper' },
  '223': { rows: 4, seatsPerRow: 10, level: 'Upper' },
  '224': { rows: 4, seatsPerRow: 10, level: 'Upper' },
};

// Generate sections with accurate seat counts
const SECTIONS = Object.entries(SECTION_CONFIG).map(([id, config]) => {
  const totalSeats = config.rows * config.seatsPerRow;
  return {
    id,
    name: id,
    level: config.level,
    price: 3500, // All tickets $35
    total_seats: totalSeats,
    available_seats: Math.floor(totalSeats * 0.85)
  };
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json(SECTIONS);
}
