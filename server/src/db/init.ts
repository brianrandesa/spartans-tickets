import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/arena.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(join(__dirname, '../../data'), { recursive: true });

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log('Database schema created successfully');

// Seed sections
const sections = [
  // Lower level (100s)
  ...['101', '102', '103', '104', '105', '106', '108', '109', '110', '111', '112', '113', '114', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131'].map(id => ({
    id,
    name: id,
    level: 'lower',
    price: 3500
  })),
  // Upper level (200s)
  ...Array.from({ length: 34 }, (_, i) => ({
    id: String(201 + i),
    name: String(201 + i),
    level: 'upper',
    price: 3500
  })),
  // Field level boxes (North)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `N${i + 1}`,
    name: `Box N${i + 1}`,
    level: 'field',
    price: 3500
  })),
  // Field level boxes (South)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `S${i + 1}`,
    name: `Box S${i + 1}`,
    level: 'field',
    price: 3500
  }))
];

const insertSection = db.prepare(`
  INSERT OR REPLACE INTO sections (id, name, level, price) VALUES (?, ?, ?, ?)
`);

for (const section of sections) {
  insertSection.run(section.id, section.name, section.level, section.price);
}

console.log(`Created ${sections.length} sections`);

// Seed seats - using numeric rows 1-15
const insertSeat = db.prepare(`
  INSERT OR REPLACE INTO seats (id, section_id, row, number, status) VALUES (?, ?, ?, ?, ?)
`);

let totalSeats = 0;

for (const section of sections) {
  const rows = section.level === 'field' ? 2 : 15; // All bowl sections have 15 rows
  const seatsPerRow = section.level === 'field' ? 3 : 12;

  for (let r = 1; r <= rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      const seatId = `${section.id}-${r}-${s}`;
      // Randomly mark ~15% of seats as sold for demo purposes
      const status = Math.random() < 0.15 ? 'sold' : 'available';
      insertSeat.run(seatId, section.id, String(r), s, status);
      totalSeats++;
    }
  }
}

console.log(`Created ${totalSeats} seats`);
console.log('Database initialization complete!');

db.close();
