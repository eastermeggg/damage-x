import React, { useEffect, useRef, useState } from 'react';
import { Search, Building2 } from 'lucide-react';

const Checkmark = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function CheckRow({ checked, onClick, icon: Icon, label, sublabel }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 text-[12px] text-[#292524] hover:bg-[#fafaf9] transition-colors flex items-center gap-2"
      style={{
        borderBottom: '1px solid #f0efed',
        backgroundColor: checked ? '#fafaf9' : 'transparent',
      }}
    >
      <div
        className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
        style={{ borderColor: checked ? '#b9703f' : '#d6d3d1', backgroundColor: checked ? '#b9703f' : 'white' }}
      >
        {checked && <Checkmark />}
      </div>
      {Icon && <Icon className="w-3.5 h-3.5 text-[#a8a29e]" />}
      <span className="font-medium">{label}</span>
      {sublabel && <span className="text-[#a8a29e] ml-0.5">{sublabel}</span>}
    </button>
  );
}

/**
 * Shared "Save to..." popover used by JPSearchView and DecisionDrawer.
 *
 * Props (all optional unless noted):
 *   - isPinned                 — matter (transverse) checkbox state
 *   - assignedPosteIds[]       — checked poste ids in current matter
 *   - onSaveToDossier()        — toggle matter transverse
 *   - onTogglePoste(posteId)   — toggle matter+poste
 *   - posteOptions[]           — { id, acronym, label }
 *   - workspacePinned          — boolean (Cabinet/org level state)
 *   - onToggleWorkspace()      — toggle workspace-scope attachment
 *   - onClose()                — required: dismiss popover
 *   - className                — extra classes (positioning override)
 */
export default function SaveDestinationPopover({
  isPinned = false,
  assignedPosteIds = [],
  onSaveToDossier,
  onTogglePoste,
  posteOptions = [],
  workspacePinned = false,
  onToggleWorkspace,
  onClose,
  className = 'absolute top-full right-0 mt-1.5',
}) {
  const ref = useRef(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = posteOptions.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.acronym.toLowerCase().includes(q) || p.label.toLowerCase().includes(q);
  });

  return (
    <div
      ref={ref}
      className={`${className} w-[260px] bg-white border border-[#e7e5e3] rounded-lg shadow-lg overflow-hidden`}
      style={{ zIndex: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-[#f0efed]">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Sauvegarder à un poste
        </span>
      </div>

      {/* Postes search */}
      {posteOptions.length > 6 && (
        <div className="px-2.5 py-2 border-b border-[#f0efed]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#fafaf9] border border-[#e7e5e3]">
            <Search className="w-3 h-3 text-[#a8a29e] flex-shrink-0" />
            <input
              type="text"
              placeholder="Filtrer les postes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[11px] text-[#292524] placeholder-[#a8a29e] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Postes list */}
      {onTogglePoste && filtered.length > 0 && (
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map((p, i) => {
            const isChecked = assignedPosteIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onTogglePoste(p.id)}
                className="w-full text-left px-3 py-2 text-[12px] text-[#292524] hover:bg-[#fafaf9] transition-colors flex items-center gap-2"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0efed' : 'none' }}
              >
                <div
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: isChecked ? '#b9703f' : '#d6d3d1', backgroundColor: isChecked ? '#b9703f' : 'white' }}
                >
                  {isChecked && <Checkmark />}
                </div>
                <span className="badge badge-sm badge-secondary">{p.acronym}</span>
                <span className="text-[#78716c] truncate text-[12px]">{p.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {onTogglePoste && search && filtered.length === 0 && (
        <div className="px-3 py-3 text-[12px] text-[#a8a29e]">Aucun poste trouvé</div>
      )}

      {/* Footer note — cabinet save is automatic */}
      <div className="border-t border-[#f0efed] px-3 py-2 flex items-center gap-1.5" style={{ backgroundColor: '#fafaf9' }}>
        <Building2 className="w-3 h-3 text-[#a8a29e] flex-shrink-0" />
        <span className="text-[11px] text-[#78716c] leading-tight">
          Aussi ajoutée aux JP de référence (visible sur tous les dossiers).
        </span>
      </div>

    </div>
  );
}
