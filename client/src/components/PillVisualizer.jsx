import React from 'react';

const COLOR_MAP = {
  White: 'bg-white border-slate-300 text-slate-700 shadow-sm',
  Blue: 'bg-blue-500 border-blue-600 text-white shadow-blue-200',
  Red: 'bg-rose-500 border-rose-600 text-white shadow-rose-200',
  Yellow: 'bg-amber-400 border-amber-500 text-amber-950 shadow-amber-200',
  Green: 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200',
  Pink: 'bg-pink-400 border-pink-500 text-white shadow-pink-200',
  Orange: 'bg-orange-500 border-orange-600 text-white shadow-orange-200',
  Brown: 'bg-amber-800 border-amber-900 text-white shadow-amber-900',
  Other: 'bg-indigo-500 border-indigo-600 text-white',
};

export default function PillVisualizer({ shape = 'Round', color = 'White', size = 'normal' }) {
  const colorClass = COLOR_MAP[color] || COLOR_MAP.White;
  const isLarge = size === 'large';

  // Shapes tailored for elderly visual recognition
  if (shape === 'Capsule') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-md ${colorClass} ${
          isLarge ? 'w-24 h-12' : 'w-14 h-7'
        }`}
        title={`${color} Capsule`}
      >
        <div className="w-1/2 h-full border-r border-black/20 bg-black/10 rounded-l-full" />
        <div className="w-1/2 h-full rounded-r-full" />
      </div>
    );
  }

  if (shape === 'Oval' || shape === 'Oblong') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-md ${colorClass} ${
          isLarge ? 'w-24 h-12' : 'w-14 h-7'
        }`}
        title={`${color} Oval Pill`}
      >
        <div className="w-0.5 h-3/4 bg-black/15" />
      </div>
    );
  }

  if (shape === 'Square') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl border-2 shadow-md ${colorClass} ${
          isLarge ? 'w-16 h-16' : 'w-9 h-9'
        }`}
        title={`${color} Square Pill`}
      >
        <div className="w-full h-0.5 bg-black/15" />
      </div>
    );
  }

  if (shape === 'Liquid Bottle' || shape === 'Drop Bottle') {
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center rounded-md border-2 shadow-md ${colorClass} ${
          isLarge ? 'w-12 h-20' : 'w-8 h-12'
        }`}
        title={`${color} Medicine Bottle`}
      >
        <div className="w-4 h-2 bg-slate-400 rounded-t-sm -mt-2 mb-1" />
        <span className="text-[10px] font-bold">Rx</span>
      </div>
    );
  }

  // Default Round Pill
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border-2 shadow-md ${colorClass} ${
        isLarge ? 'w-16 h-16' : 'w-10 h-10'
      }`}
      title={`${color} Round Pill`}
    >
      <div className="w-full h-0.5 bg-black/15" />
    </div>
  );
}
