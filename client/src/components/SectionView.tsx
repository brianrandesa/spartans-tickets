import { useState } from 'react';
import type { Section } from '../types';

interface SectionViewProps {
  section: Section;
  path: string;
  cx: number;
  cy: number;
  fillColor: string;
  onClick: () => void;
}

export function SectionView({ section, path, cx, cy, fillColor, onClick }: SectionViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      className="cursor-pointer transition-all"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        d={path}
        fill={isHovered ? '#0096c7' : fillColor}
        stroke={isHovered ? '#fff' : '#000'}
        strokeWidth={isHovered ? 2 : 1}
        className="transition-all duration-150"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fillColor === '#6b7280' ? '#9ca3af' : '#fff'}
        fontSize="10"
        fontWeight="bold"
        pointerEvents="none"
      >
        {section.id}
      </text>

      {/* Tooltip on hover */}
      {isHovered && (
        <g>
          <rect
            x={cx - 60}
            y={cy - 45}
            width="120"
            height="35"
            fill="#000"
            stroke="#00b4d8"
            strokeWidth="1"
            rx="4"
          />
          <text x={cx} y={cy - 32} textAnchor="middle" fill="#fff" fontSize="10">
            Section {section.name}
          </text>
          <text x={cx} y={cy - 18} textAnchor="middle" fill="#00b4d8" fontSize="10">
            ${(section.price / 100).toFixed(2)} • {section.availableSeats} available
          </text>
        </g>
      )}
    </g>
  );
}
