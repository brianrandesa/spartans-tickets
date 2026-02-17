import { useState } from 'react';
import type { Section, Seat } from '../types';

interface SectionDetailProps {
  section: Section;
  seats: Seat[];
  selectedSeats: Set<string>;
  onSeatToggle: (seat: Seat) => void;
  onBack: () => void;
}

export function SectionDetail({ section, seats, selectedSeats, onSeatToggle, onBack }: SectionDetailProps) {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows numerically
  const rows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b));

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.has(seat.id)) return '#23a455'; // selected (green)
    if (seat.status === 'sold' || seat.status === 'reserved') return '#6b7280'; // sold (gray)
    return '#00b4d8'; // available (cyan)
  };

  const getSeatCursor = (seat: Seat) => {
    if (seat.status === 'sold' || seat.status === 'reserved') return 'not-allowed';
    return 'pointer';
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available' || selectedSeats.has(seat.id)) {
      onSeatToggle(seat);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
        >
          ← Back to Map
        </button>
        <h2 className="text-2xl font-heading text-spartans-cyan">
          Section {section.name}
        </h2>
        <span className="text-gray-400">
          ${(section.price / 100).toFixed(2)} per seat
        </span>
      </div>

      {/* Seat grid */}
      <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
        {/* Stage/Field indicator */}
        <div className="text-center mb-6 py-2 bg-green-600 rounded text-white font-bold">
          ↓ FIELD ↓
        </div>

        {/* Seats by row */}
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-8 text-gray-400 font-mono text-sm">
                {row}
              </span>
              <div className="flex gap-1 flex-wrap">
                {seatsByRow[row]
                  .sort((a, b) => a.number - b.number)
                  .map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      onMouseEnter={() => setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={seat.status === 'sold' || seat.status === 'reserved'}
                      className="w-8 h-8 rounded-full text-xs font-bold transition-transform hover:scale-110 disabled:hover:scale-100"
                      style={{
                        backgroundColor: getSeatColor(seat),
                        cursor: getSeatCursor(seat),
                      }}
                      title={`Row ${seat.row}, Seat ${seat.number}`}
                    >
                      {seat.number}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredSeat && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-center">
          <span className="text-white">
            Section {section.name}, Row {hoveredSeat.row}, Seat {hoveredSeat.number}
          </span>
          <span className="text-spartans-cyan ml-2">
            ${(section.price / 100).toFixed(2)}
          </span>
          {hoveredSeat.status === 'sold' && (
            <span className="text-red-400 ml-2">(Sold)</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00b4d8' }}></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#23a455' }}></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6b7280' }}></div>
          <span>Sold</span>
        </div>
      </div>
    </div>
  );
}
