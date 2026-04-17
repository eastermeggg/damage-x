import React from 'react';
import { Bookmark } from 'lucide-react';
import { formatDateShort } from '../../data/mockDecisions';

export default function JPPill({
  decision,
  saved = false,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!decision) return null;

  return (
    <span
      className="jp-pill"
      data-pill-id={decision.id}
      onClick={(e) => { e.stopPropagation(); onClick?.(decision); }}
      onMouseEnter={(e) => onMouseEnter?.(e, decision)}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 6,
        border: isSelected ? '1.5px solid #b9703f' : '1px solid #e7e5e3',
        backgroundColor: isSelected ? 'rgba(185, 112, 63, 0.06)' : '#fafaf9',
        cursor: 'pointer',
        verticalAlign: 'baseline',
        lineHeight: '16px',
        transition: 'border-color 0.15s, background-color 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = '#b9703f';
      }}
      onMouseOut={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = '#e7e5e3';
      }}
    >
      {saved && (
        <Bookmark
          className="flex-shrink-0"
          style={{ width: 12, height: 12, color: '#b9703f', fill: '#b9703f', position: 'relative', top: 1 }}
        />
      )}
      <span style={{ fontSize: 12, color: '#44403c' }}>
        {decision.jurisdiction}{decision.chambre ? ` · ${decision.chambre}` : ''}
      </span>
      <span style={{ fontSize: 12, color: '#a8a29e' }}>·</span>
      <span style={{ fontSize: 12, color: '#44403c' }}>
        {formatDateShort(decision.date)}
      </span>
      <span style={{ fontSize: 12, color: '#a8a29e' }}>›</span>
      <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: '#b9703f' }}>
        {decision.amounts?.[0]?.displayValue}
      </span>
    </span>
  );
}
