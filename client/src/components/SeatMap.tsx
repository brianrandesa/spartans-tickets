import { useState } from 'react';
import type { Section, Seat } from '../types';
import { SectionDetail } from './SectionDetail';

interface SeatMapProps {
  sections: Section[];
  seats: Map<string, Seat[]>;
  selectedSeats: Set<string>;
  onSeatToggle: (seat: Seat, section: Section) => void;
  selectedGameId: string;
  onGameChange: (gameId: string) => void;
}

function formatGameDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const GAMES_RAW = [
  { id: '1', date: '2026-04-11', opponent: 'Amarillo Warbirds', time: '7:00 PM' },
  { id: '2', date: '2026-04-18', opponent: 'Omaha Beef', time: '7:00 PM' },
  { id: '3', date: '2026-05-02', opponent: 'Pueblo Punishers', time: '7:00 PM' },
  { id: '4', date: '2026-05-10', opponent: 'Dallas Bulls', time: '7:00 PM' },
  { id: '5', date: '2026-05-30', opponent: 'Salina Liberty', time: '7:00 PM' },
];

export const GAMES = GAMES_RAW.map(g => ({
  ...g,
  dateDisplay: formatGameDate(g.date),
}));

// Center point for the arena
const CX = 400, CY = 260;

// Stadium layout - sections wrap tightly around field
const sectionPositions: Record<string, { x: number; y: number }> = {};

// Upper level - outer ring
const upperIds = ['219','220','221','222','223','224','225','226','227','228','229','230','231','232','233','234','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217','218'];
upperIds.forEach((id, i) => {
  const angle = (i / upperIds.length) * Math.PI * 2 - Math.PI / 2;
  sectionPositions[id] = {
    x: CX + 310 * Math.cos(angle),
    y: CY + 215 * Math.sin(angle)
  };
});

// Lower level - inner ring, tight around field (includes 132, 133, 134)
const lowerIds = ['119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','101','102','103','104','105','106','108','109','110','111','112','113','114','116','117','118'];
lowerIds.forEach((id, i) => {
  const angle = (i / lowerIds.length) * Math.PI * 2 - Math.PI / 2;
  sectionPositions[id] = {
    x: CX + 220 * Math.cos(angle),
    y: CY + 148 * Math.sin(angle)
  };
});

export function SeatMap({ sections, seats, selectedSeats, onSeatToggle, selectedGameId, onGameChange }: SeatMapProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const currentSection = sections.find(s => s.id === selectedSection);
  const currentSeats = selectedSection ? seats.get(selectedSection) || [] : [];
  const currentGame = GAMES.find(g => g.id === selectedGameId)!;

  const getStatus = (id: string) => {
    const s = seats.get(id) || [];
    return {
      available: s.filter(x => x.status === 'available').length,
      hasSelected: s.some(x => selectedSeats.has(x.id))
    };
  };

  if (selectedSection && currentSection) {
    return (
      <SectionDetail
        section={currentSection}
        seats={currentSeats}
        selectedSeats={selectedSeats}
        onSeatToggle={(seat) => onSeatToggle(seat, currentSection)}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  const cx = CX, cy = CY;

  const SectionBox = ({ id, isLower = false }: { id: string; isLower?: boolean }) => {
    const pos = sectionPositions[id];
    if (!pos) return null;
    const section = sections.find(s => s.id === id);
    if (!section) return null;

    const { available, hasSelected } = getStatus(id);
    const sold = available === 0;
    const isHovered = hovered === id;

    let fill = '#00b4d8';
    if (sold) fill = '#4b5563';
    if (hasSelected) fill = '#22c55e';
    if (isHovered && !sold) fill = '#67e8f9';

    const w = isLower ? 38 : 44;
    const h = isLower ? 28 : 32;

    return (
      <g
        onClick={() => !sold && setSelectedSection(id)}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
        style={{ cursor: sold ? 'not-allowed' : 'pointer' }}
      >
        <rect
          x={pos.x - w/2} y={pos.y - h/2}
          width={w} height={h}
          rx={4}
          fill={fill}
          stroke={isHovered ? '#fff' : 'transparent'}
          strokeWidth={2}
        />
        <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={isLower ? 11 : 13} fontWeight="bold">
          {id}
        </text>
      </g>
    );
  };

  // Upper level sections
  const upperSections = ['218','219','220','221','222','223','224','225','226','227','228','229','230','231','232','233','234','201','202','203','204','205','206','207','208','209','210','211','212','213','214','215','216','217'];
  // Lower level sections (includes 132, 133, 134)
  const lowerSections = ['119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','101','102','103','104','105','106','108','109','110','111','112','113','114','116','117','118'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <img src="/spartans-logo.png" alt="Spartans" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-2xl font-black text-cyan-400 tracking-wide">COLORADO SPARTANS</h1>
            <p className="text-gray-500 text-sm">Denver Coliseum • 2026</p>
          </div>
        </div>
        <select
          value={selectedGameId}
          onChange={(e) => onGameChange(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded min-w-[260px]"
        >
          {GAMES.map(g => (
            <option key={g.id} value={g.id}>
              {g.dateDisplay} vs {g.opponent}
            </option>
          ))}
        </select>
      </div>

      <p className="text-center mb-4 text-lg">
        <span className="text-cyan-400 font-bold">{currentGame.opponent}</span>
        {' • '}{currentGame.dateDisplay}
        {' • '}<span className="text-cyan-400">{currentGame.time}</span>
      </p>

      {/* SVG Arena */}
      <svg viewBox="0 0 800 530" className="w-full bg-gray-950 rounded-xl border border-gray-800">
        {/* Outer guide line */}
        <ellipse cx={cx} cy={cy} rx={335} ry={235} fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Inner guide line */}
        <ellipse cx={cx} cy={cy} rx={245} ry={168} fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Upper level sections */}
        {upperSections.map(id => <SectionBox key={id} id={id} />)}

        {/* Lower level sections */}
        {lowerSections.map(id => <SectionBox key={id} id={id} isLower />)}

        {/* Field */}
        <rect x={cx - 130} y={cy - 55} width={260} height={110} rx={6} fill="#166534" stroke="#22c55e" strokeWidth={2} />

        {/* Field markings */}
        <line x1={cx - 65} y1={cy - 55} x2={cx - 65} y2={cy + 55} stroke="#22c55e" strokeWidth={1} opacity={0.4} />
        <line x1={cx} y1={cy - 55} x2={cx} y2={cy + 55} stroke="#fff" strokeWidth={2} opacity={0.6} />
        <line x1={cx + 65} y1={cy - 55} x2={cx + 65} y2={cy + 55} stroke="#22c55e" strokeWidth={1} opacity={0.4} />

        {/* Endzones */}
        <rect x={cx - 130} y={cy - 55} width={32} height={110} fill="#15803d" />
        <rect x={cx + 98} y={cy - 55} width={32} height={110} fill="#15803d" />


        {/* Center logo */}
        <image href="/spartans-logo.png" x={cx - 35} y={cy - 35} width={70} height={70} />

        {/* Hover tooltip */}
        {hovered && (() => {
          const { available } = getStatus(hovered);
          const section = sections.find(s => s.id === hovered);
          if (!section) return null;
          return (
            <g>
              <rect x={610} y={15} width={175} height={55} rx={6} fill="#000" stroke="#00b4d8" strokeWidth={2} />
              <text x={697} y={35} textAnchor="middle" fill="#00b4d8" fontSize={15} fontWeight="bold">Section {hovered}</text>
              <text x={697} y={55} textAnchor="middle" fill="#fff" fontSize={13}>{available} seats • $35</text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-5 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{backgroundColor:'#00b4d8'}}></div>
          <span className="text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{backgroundColor:'#22c55e'}}></div>
          <span className="text-gray-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{backgroundColor:'#4b5563'}}></div>
          <span className="text-gray-300">Sold Out</span>
        </div>
        <span className="text-cyan-400 font-bold">All Tickets $35</span>
      </div>

      {/* Season Tickets & Sponsorship Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <a
          href="https://www.tickettailor.com/events/coloradospartans/1934702"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Buy Season Tickets - $250
        </a>
        <a
          href="https://getspartanstickets.com/partners-page"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-transparent border-2 border-cyan-500 hover:bg-cyan-500 hover:text-black text-cyan-400 font-bold py-4 px-8 rounded-lg transition-colors text-lg"
        >
          Become a Sponsor
        </a>
      </div>

    </div>
  );
}
