import React from 'react';

export const BuildingElevationWireframe: React.FC<{ className?: string }> = ({ className = '' }) => {
  const bayXPositions = [44, 98, 152, 206, 260, 314];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 380 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[340px] sm:max-w-[380px] h-auto drop-shadow-xs transition-colors"
      >
        {/* Architectural dimension lines on the left */}
        <g className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1]">
          <line x1="18" y1="40" x2="18" y2="340" strokeDasharray="3 3" />
          <line x1="13" y1="40" x2="23" y2="40" />
          <line x1="13" y1="105" x2="23" y2="105" />
          <line x1="13" y1="168" x2="23" y2="168" />
          <line x1="13" y1="233" x2="23" y2="233" />
          <line x1="13" y1="298" x2="23" y2="298" />
          <line x1="13" y1="340" x2="23" y2="340" />
        </g>

        {/* Height level text markers */}
        <g className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[8.5px]">
          <text x="3" y="43">+16m</text>
          <text x="3" y="108">+13m</text>
          <text x="3" y="171">+10m</text>
          <text x="5" y="236">+7m</text>
          <text x="5" y="301">+3m</text>
          <text x="5" y="343">±0m</text>
        </g>

        {/* Main Building Outer Shell */}
        <rect
          x="36"
          y="40"
          width="332"
          height="300"
          className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1.5] fill-zinc-50/40 dark:fill-zinc-900/40"
          rx="2"
        />

        {/* --- TIER 5: ROOFTOP TERRACE & UTILITIES (Y: 40 to 105) --- */}
        <line x1="36" y1="52" x2="368" y2="52" className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[1]" />
        <g className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1]">
          <line x1="56" y1="40" x2="56" y2="52" />
          <line x1="86" y1="40" x2="86" y2="52" />
          <line x1="116" y1="40" x2="116" y2="52" />
          <line x1="260" y1="40" x2="260" y2="52" />
          <line x1="290" y1="40" x2="290" y2="52" />
          <line x1="320" y1="40" x2="320" y2="52" />
          <line x1="350" y1="40" x2="350" y2="52" />
        </g>

        {/* Overhead Water Tank */}
        <rect
          x="142"
          y="15"
          width="94"
          height="25"
          rx="2"
          className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[1.5] fill-zinc-100 dark:fill-zinc-800"
        />
        <text x="156" y="31" className="fill-zinc-500 dark:fill-zinc-400 font-mono text-[8.5px] font-semibold">
          WATER TANK
        </text>

        {/* Solar PV panels */}
        <g className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[1]">
          <line x1="50" y1="28" x2="115" y2="28" />
          <line x1="50" y1="28" x2="60" y2="40" />
          <line x1="82" y1="28" x2="88" y2="40" />
          <line x1="115" y1="28" x2="115" y2="40" />
        </g>

        {/* Terrace Floor Slab */}
        <rect x="36" y="103" width="332" height="4" className="fill-zinc-300 dark:fill-zinc-700" />
        <text x="46" y="96" className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[7.5px] uppercase tracking-wider">
          ROOFTOP TERRACE • GARDEN & SOLAR ZONE
        </text>

        {/* --- TIER 4: 4TH FLOOR (Flats 401 - 406) --- */}
        {bayXPositions.map((bx, idx) => {
          const unit = 401 + idx;
          return (
            <g key={unit}>
              <rect
                x={bx}
                y="115"
                width="48"
                height="42"
                rx="2"
                className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1] fill-white dark:fill-zinc-850"
              />
              <rect
                x={bx + 7}
                y="121"
                width="34"
                height="18"
                rx="1"
                className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[0.8] fill-zinc-50 dark:fill-zinc-800"
              />
              <line x1={bx + 24} y1="121" x2={bx + 24} y2="139" className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[0.8]" />
              <text
                x={bx + 24}
                y="151"
                textAnchor="middle"
                className="fill-zinc-600 dark:fill-zinc-400 font-sans text-[8.5px] font-bold"
              >
                {unit}
              </text>
            </g>
          );
        })}

        {/* Floor 4 Slab */}
        <rect x="36" y="168" width="332" height="4" className="fill-zinc-300 dark:fill-zinc-700" />

        {/* --- TIER 3: 3RD FLOOR (Flats 301 - 306) --- */}
        {bayXPositions.map((bx, idx) => {
          const unit = 301 + idx;
          return (
            <g key={unit}>
              <rect
                x={bx}
                y="180"
                width="48"
                height="42"
                rx="2"
                className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1] fill-white dark:fill-zinc-850"
              />
              <rect
                x={bx + 7}
                y="186"
                width="34"
                height="18"
                rx="1"
                className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[0.8] fill-zinc-50 dark:fill-zinc-800"
              />
              <line x1={bx + 24} y1="186" x2={bx + 24} y2="204" className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[0.8]" />
              <text
                x={bx + 24}
                y="216"
                textAnchor="middle"
                className="fill-zinc-600 dark:fill-zinc-400 font-sans text-[8.5px] font-bold"
              >
                {unit}
              </text>
            </g>
          );
        })}

        {/* Floor 3 Slab */}
        <rect x="36" y="233" width="332" height="4" className="fill-zinc-300 dark:fill-zinc-700" />

        {/* --- TIER 2: 2ND FLOOR (Flats 201 - 206) --- */}
        {bayXPositions.map((bx, idx) => {
          const unit = 201 + idx;
          const isFeatured = unit === 203; // Highlight Flat 203
          return (
            <g key={unit}>
              <rect
                x={bx}
                y="245"
                width="48"
                height="42"
                rx="2"
                className={
                  isFeatured
                    ? 'stroke-zinc-900 dark:stroke-zinc-100 stroke-[1.5] fill-zinc-100 dark:fill-zinc-800'
                    : 'stroke-zinc-300 dark:stroke-zinc-700 stroke-[1] fill-white dark:fill-zinc-850'
                }
              />
              <rect
                x={bx + 7}
                y="251"
                width="34"
                height="18"
                rx="1"
                className={
                  isFeatured
                    ? 'stroke-zinc-600 dark:stroke-zinc-400 stroke-[1] fill-white dark:fill-zinc-700'
                    : 'stroke-zinc-400 dark:stroke-zinc-600 stroke-[0.8] fill-zinc-50 dark:fill-zinc-800'
                }
              />
              <line x1={bx + 24} y1="251" x2={bx + 24} y2="269" className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[0.8]" />
              <text
                x={bx + 24}
                y="281"
                textAnchor="middle"
                className={
                  isFeatured
                    ? 'fill-zinc-900 dark:fill-zinc-100 font-sans text-[8.5px] font-black'
                    : 'fill-zinc-600 dark:fill-zinc-400 font-sans text-[8.5px] font-bold'
                }
              >
                {unit}
              </text>
            </g>
          );
        })}

        {/* Floor 2 Slab */}
        <rect x="36" y="298" width="332" height="4" className="fill-zinc-300 dark:fill-zinc-700" />

        {/* --- TIER 1: 1ST FLOOR (Flats 101 - 106) --- */}
        {bayXPositions.map((bx, idx) => {
          const unit = 101 + idx;
          return (
            <g key={unit}>
              <rect
                x={bx}
                y="306"
                width="48"
                height="30"
                rx="2"
                className="stroke-zinc-300 dark:stroke-zinc-700 stroke-[1] fill-white dark:fill-zinc-850"
              />
              <text
                x={bx + 24}
                y="325"
                textAnchor="middle"
                className="fill-zinc-600 dark:fill-zinc-400 font-sans text-[8.5px] font-bold"
              >
                {unit}
              </text>
            </g>
          );
        })}

        {/* Plinth / Ground Beam Slab */}
        <rect x="36" y="340" width="332" height="6" className="fill-zinc-400 dark:fill-zinc-600" />

        {/* Ground Foundation Columns / Stilt Parking */}
        <g className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[2]">
          <line x1="46" y1="346" x2="46" y2="370" />
          <line x1="110" y1="346" x2="110" y2="370" />
          <line x1="174" y1="346" x2="174" y2="370" />
          <line x1="238" y1="346" x2="238" y2="370" />
          <line x1="302" y1="346" x2="302" y2="370" />
          <line x1="358" y1="346" x2="358" y2="370" />
        </g>

        {/* Ground Base Line */}
        <line x1="20" y1="370" x2="375" y2="370" className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[2]" />
        <text x="190" y="364" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[7.5px] uppercase tracking-wider">
          STILT PARKING • ENTRANCE LOBBY • 24 UNITS
        </text>
      </svg>
    </div>
  );
};
