export type SeatStatus = 'available' | 'selected' | 'sold' | 'reserved';

export interface Seat {
  id: string;
  sectionId: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface Section {
  id: string;
  name: string;
  level: 'field' | 'lower' | 'upper' | 'Floor' | 'Lower' | 'Upper';
  price: number; // in cents
  totalSeats: number;
  availableSeats: number;
  isGroupOnly?: boolean; // 100 level sections are group tickets only
}

export interface Game {
  id: string;
  date: string;
  dateDisplay: string;
  opponent: string;
  time: string;
}

export interface CartItem {
  seat: Seat;
  section: Section;
  game: Game;
}

export interface Order {
  id: string;
  seats: string[]; // seat IDs
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  customerEmail?: string;
  createdAt: string;
}

// SVG coordinate data for sections (arena layout)
export interface SectionPath {
  id: string;
  path: string; // SVG path data
  labelX: number;
  labelY: number;
}
