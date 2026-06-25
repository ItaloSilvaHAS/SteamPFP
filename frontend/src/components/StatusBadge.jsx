import React from 'react';

const STATUS_MAP = {
  0: { label: 'Offline', color: '#6b7280', dot: '#6b7280' },
  1: { label: 'Online', color: '#22c55e', dot: '#22c55e', pulse: true },
  2: { label: 'Ocupado', color: '#ef4444', dot: '#ef4444', pulse: true },
  3: { label: 'Ausente', color: '#f59e0b', dot: '#f59e0b' },
  4: { label: 'Soneca', color: '#94a3b8', dot: '#94a3b8' },
  5: { label: 'Quer Trocar', color: '#3b82f6', dot: '#3b82f6', pulse: true },
  6: { label: 'Quer Jogar', color: '#8b5cf6', dot: '#8b5cf6', pulse: true },
};

export default function StatusBadge({ personastate = 0, gameextrainfo, accentColor }) {
  const status = STATUS_MAP[personastate] || STATUS_MAP[0];
  const isPlaying = !!gameextrainfo;
  const displayColor = isPlaying ? (accentColor || '#22c55e') : status.dot;
  const label = isPlaying ? `Jogando ${gameextrainfo}` : status.label;
  const shouldPulse = isPlaying || status.pulse;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-3 h-3">
        {shouldPulse && (
          <span
            className="status-ping absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: displayColor, opacity: 0.5 }}
          />
        )}
        <span
          className="relative inline-flex rounded-full w-2.5 h-2.5"
          style={{ backgroundColor: displayColor }}
        />
      </div>
      <span
        className="text-xs font-mono font-medium truncate max-w-[200px]"
        style={{ color: displayColor }}
        title={label}
      >
        {label}
      </span>
    </div>
  );
}
