import type { VercelRequest, VercelResponse } from '@vercel/node';

// Sold seats storage (shared with admin/sold-seats.ts in production, use DB)
// For now, we'll check localStorage or a simple in-memory store
let soldSeatsStore: Set<string> = new Set();

// Function to mark seats as sold (called from admin)
export function markSeatsSold(seatIds: string[]) {
  seatIds.forEach(id => soldSeatsStore.add(id));
}

export function getSoldSeats(): Set<string> {
  return soldSeatsStore;
}

// Exact Denver Coliseum seating configuration
const SECTION_CONFIG: Record<string, { rows: number; seatsPerRow: number }> = {
  // Lower Level - Standard sections (4 rows)
  '101': { rows: 4, seatsPerRow: 12 },
  '102': { rows: 4, seatsPerRow: 12 },
  '103': { rows: 4, seatsPerRow: 12 },
  '104': { rows: 4, seatsPerRow: 12 },
  '105': { rows: 4, seatsPerRow: 12 },
  '106': { rows: 4, seatsPerRow: 12 },
  '108': { rows: 4, seatsPerRow: 13 },
  '113': { rows: 4, seatsPerRow: 11 },
  '114': { rows: 4, seatsPerRow: 10 },
  '116': { rows: 4, seatsPerRow: 10 },
  '117': { rows: 4, seatsPerRow: 11 },
  '118': { rows: 4, seatsPerRow: 12 },
  '119': { rows: 4, seatsPerRow: 13 },
  '120': { rows: 4, seatsPerRow: 12 },
  '121': { rows: 4, seatsPerRow: 13 },
  '122': { rows: 4, seatsPerRow: 12 },
  '123': { rows: 4, seatsPerRow: 12 },
  '124': { rows: 4, seatsPerRow: 12 },
  '130': { rows: 4, seatsPerRow: 12 },
  '131': { rows: 4, seatsPerRow: 12 },
  '132': { rows: 4, seatsPerRow: 12 },
  '133': { rows: 4, seatsPerRow: 12 },
  '134': { rows: 4, seatsPerRow: 12 },

  // Lower Level - Floor sections (11 rows)
  '109': { rows: 11, seatsPerRow: 14 },
  '110': { rows: 11, seatsPerRow: 14 },
  '111': { rows: 11, seatsPerRow: 14 },
  '112': { rows: 11, seatsPerRow: 13 },
  '125': { rows: 11, seatsPerRow: 13 },
  '126': { rows: 11, seatsPerRow: 14 },
  '127': { rows: 11, seatsPerRow: 14 },
  '128': { rows: 11, seatsPerRow: 14 },
  '129': { rows: 11, seatsPerRow: 13 },

  // Upper Level - Corner sections (4 rows)
  '201': { rows: 4, seatsPerRow: 15 },
  '202': { rows: 4, seatsPerRow: 15 },
  '203': { rows: 4, seatsPerRow: 15 },
  '204': { rows: 4, seatsPerRow: 15 },
  '205': { rows: 4, seatsPerRow: 15 },
  '206': { rows: 4, seatsPerRow: 15 },
  '229': { rows: 4, seatsPerRow: 13 },
  '230': { rows: 4, seatsPerRow: 15 },
  '231': { rows: 4, seatsPerRow: 15 },
  '232': { rows: 4, seatsPerRow: 15 },
  '233': { rows: 4, seatsPerRow: 15 },
  '234': { rows: 4, seatsPerRow: 12 },

  // Upper Level - Floor sections (8 rows)
  '207': { rows: 8, seatsPerRow: 15 },
  '208': { rows: 8, seatsPerRow: 14 },
  '209': { rows: 8, seatsPerRow: 14 },
  '210': { rows: 8, seatsPerRow: 15 },
  '211': { rows: 8, seatsPerRow: 14 },
  '212': { rows: 8, seatsPerRow: 14 },
  '213': { rows: 8, seatsPerRow: 14 },
  '225': { rows: 8, seatsPerRow: 15 },
  '226': { rows: 8, seatsPerRow: 14 },
  '227': { rows: 8, seatsPerRow: 14 },
  '228': { rows: 8, seatsPerRow: 15 },

  // Upper Level - Side sections (4 rows)
  '214': { rows: 4, seatsPerRow: 11 },
  '215': { rows: 4, seatsPerRow: 12 },
  '216': { rows: 4, seatsPerRow: 11 },
  '217': { rows: 4, seatsPerRow: 12 },
  '218': { rows: 4, seatsPerRow: 12 },
  '219': { rows: 4, seatsPerRow: 13 },
  '220': { rows: 4, seatsPerRow: 12 },
  '221': { rows: 4, seatsPerRow: 11 },
  '222': { rows: 4, seatsPerRow: 10 },
  '223': { rows: 4, seatsPerRow: 10 },
  '224': { rows: 4, seatsPerRow: 10 },
};

// Sections that are sold out
const SOLD_OUT_SECTIONS = ['106', '108', '109', '110', '111', '112', '113', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126'];

// Generate seats for a section based on config
function generateSeats(sectionId: string, gameId: string = '1', soldSeats: Set<string> = new Set()) {
  const config = SECTION_CONFIG[sectionId];
  if (!config) return [];

  const isSoldOut = SOLD_OUT_SECTIONS.includes(sectionId);
  const seats: any[] = [];
  for (let row = 1; row <= config.rows; row++) {
    for (let num = 1; num <= config.seatsPerRow; num++) {
      const seatId = `${sectionId}-${row}-${num}`;
      const soldKey = `${gameId}-${seatId}`;
      const isManualSold = soldSeats.has(soldKey);

      seats.push({
        id: seatId,
        section_id: sectionId,
        row: row.toString(),
        number: num,
        status: isSoldOut || isManualSold ? 'sold' : 'available'
      });
    }
  }
  return seats;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gameId = (req.query.gameId as string) || '1';

  // Generate seats fresh each time (stateless)
  const SEATS: Record<string, any[]> = {};
  Object.keys(SECTION_CONFIG).forEach(sectionId => {
    SEATS[sectionId] = generateSeats(sectionId, gameId, soldSeatsStore);
  });

  return res.json(SEATS);
}
