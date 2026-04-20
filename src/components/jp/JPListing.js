import React from 'react';
import { ChevronRight, Plus, Landmark } from 'lucide-react';
import { getDecisionById, getDecisionsByIds, getPrimaryAmount, formatDateShort, getStats } from '../../data/mockDecisions';

export default function JPListing({
  pinnedJP = [],
  selectedDecisionId = null,
  showStats = false,
  onOpenDrawer,
  onAddClick,
  compact = false,
}) {
  const decisionIds = pinnedJP.map(p => p.decisionId);
  const decisions = getDecisionsByIds(decisionIds);
  const stats = showStats && decisions.length > 0 ? getStats(decisions) : null;

  if (decisions.length === 0) {
    return (
      <div className={compact ? '' : 'p-4'} style={compact ? {} : { backgroundColor: '#F8F7F5' }}>
        {!compact && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            JURISPRUDENCES
          </div>
        )}
        <div className="bg-white border border-[#e7e5e3] rounded-[4px] flex flex-col items-center justify-center" style={{ minHeight: compact ? 58 : 120, padding: compact ? 0 : '24px 16px' }}>
          {!compact && <Landmark className="w-8 h-8 text-stone-300 mb-3" strokeWidth={1.5} />}
          <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
          {onAddClick && !compact && (
            <button
              onClick={onAddClick}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#44403c] border border-[#e7e5e3] hover:bg-[#fafaf9] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter une décision
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'p-4'} style={compact ? {} : { backgroundColor: '#F8F7F5' }}>
      {!compact && (
        <div className="flex items-center justify-between mb-[17px]">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            JURISPRUDENCES
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#a8a29e]">{decisions.length} décision{decisions.length > 1 ? 's' : ''} épinglée{decisions.length > 1 ? 's' : ''}</span>
            {onAddClick && (
              <button
                onClick={onAddClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium text-[#44403c] border border-[#e7e5e3] hover:bg-[#fafaf9] transition-colors"
              >
                <Plus className="w-3 h-3" />
                Ajouter une
              </button>
            )}
          </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-[#a8a29e]">{decisions.length} décision{decisions.length > 1 ? 's' : ''}</span>
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#78716c] hover:text-[#292524] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
        {/* Header */}
        <div className="grid gap-0 px-3 py-2 border-b border-[#e7e5e3]" style={{ gridTemplateColumns: '110px 72px 1fr 90px 24px', backgroundColor: '#fafaf9' }}>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e', textTransform: 'uppercase' }}>Juridiction</span>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e', textTransform: 'uppercase' }}>Date</span>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e', textTransform: 'uppercase' }}>Contexte</span>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e', textTransform: 'uppercase', textAlign: 'right' }}>Montant</span>
          <span />
        </div>

        {/* Rows */}
        {decisions.map((d, i) => {
          const isSelected = d.id === selectedDecisionId;
          const resultSet = decisionIds;
          return (
            <div
              key={d.id}
              onClick={() => onOpenDrawer?.(d.id, resultSet)}
              className="grid gap-0 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#fafaf9]"
              style={{
                gridTemplateColumns: '110px 72px 1fr 90px 24px',
                backgroundColor: isSelected ? '#fafaf9' : 'transparent',
                borderLeft: isSelected ? '3px solid #b9703f' : '3px solid transparent',
                borderBottom: i < decisions.length - 1 ? '1px solid #f0efed' : 'none',
              }}
            >
              <span style={{ fontSize: 14, color: '#292524' }}>{d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}</span>
              <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#78716c' }}>{formatDateShort(d.date)}</span>
              <span style={{ fontSize: 14, color: '#44403c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.category}</span>
              <span style={{ fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#b9703f', textAlign: 'right' }}>{getPrimaryAmount(d)?.displayValue}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#d6d3d1] self-center" />
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      {stats && (
        <div className="mt-3 flex items-center gap-3 text-[12px] text-[#78716c]">
          <span>Médiane <strong style={{ color: '#292524' }}>{stats.mediane}</strong></span>
          <span>·</span>
          <span>Fourchette <strong style={{ color: '#292524' }}>{stats.fourchette}</strong></span>
        </div>
      )}
    </div>
  );
}
