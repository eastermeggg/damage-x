import React, { useState, useRef, useEffect } from 'react';
import {
  X, ChevronRight, ChevronDown, ExternalLink, Download, Bookmark, Search, Tag,
  Landmark, Calendar, Hash, FileText, Heart, Scale, LinkIcon,
  User,
} from 'lucide-react';
import { getDecisionById, getPrimaryAmount, formatDateLong } from '../../data/mockDecisions';

const fmt = (v) => v.toLocaleString('fr-FR');

// ─── Subcomponents ────────────────────────────────────────────────────

function SidebarSectionHeader({ label, icon }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-[#a8a29e]">{icon}</span>}
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}
      </span>
    </div>
  );
}


export default function DecisionDrawer({
  decisionId,
  resultSet = [],
  resultIndex = 0,
  isPinned = false,
  onClose,
  onPrev,
  onNext,
  onPin,
  onUnpin,
  onAttachToPoste,
  posteOptions = [],
  pinnedPosteIds = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [showPosteDropdown, setShowPosteDropdown] = useState(false);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const textPanelRef = useRef(null);
  const sectionRefs = useRef({});

  const decision = getDecisionById(decisionId);

  const hasResultSet = resultSet.length > 1;
  const canPrev = resultIndex > 0;
  const canNext = resultIndex < resultSet.length - 1;

  const sections = decision?.textSections || [];
  const themes = decision?.themes || [];
  const med = decision?.donneesMedicales;
  const prejudices = decision?.prejudices;
  const victime = decision?.victimProfile;
  const primaryAmount = decision ? getPrimaryAmount(decision) : null;

  // Highlight search matches
  const highlightText = (text) => {
    if (!searchQuery.trim()) return text;
    try {
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ backgroundColor: '#fde68a', borderRadius: 2, padding: '0 2px', color: '#292524' }}>{part}</mark>
          : part
      );
    } catch { return text; }
  };

  // Count matches when search changes
  useEffect(() => {
    if (!decision || !searchQuery.trim()) { setSearchMatchCount(0); return; }
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const allText = (decision.fullText || '') + ' ' + sections.map(s => s.content).join(' ');
      const matches = allText.match(regex);
      setSearchMatchCount(matches ? matches.length : 0);
    } catch { setSearchMatchCount(0); }
  }, [searchQuery, decision, sections]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = sectionRefs.current[sectionId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Keyboard nav for drawer
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && canPrev) onPrev?.();
      if (e.key === 'ArrowRight' && canNext) onNext?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, canPrev, canNext]);

  if (!decision) return null;

  const tempTotal = prejudices?.temporaires?.reduce((s, p) => s + p.montant, 0) || 0;
  const permTotal = prejudices?.permanents?.reduce((s, p) => s + p.montant, 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 29, backgroundColor: 'rgba(41, 37, 36, 0.12)' }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-screen bg-white border-l border-[#e7e5e3] shadow-xl z-30 flex flex-col"
        style={{ width: 820, animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* ═══════════ TOP BAR ═══════════ */}
        <div className="px-4 py-2.5 border-b border-[#e7e5e3] flex items-center justify-between flex-shrink-0 bg-white">
          {/* Left: nav */}
          <div className="flex items-center gap-3">
            {hasResultSet && (
              <div className="flex items-center gap-1">
                <button onClick={onPrev} disabled={!canPrev}
                  className={`p-1 rounded-md transition-colors ${canPrev ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-[#d6d3d1] cursor-not-allowed'}`}>
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#a8a29e', minWidth: 36, textAlign: 'center' }}>
                  {resultIndex + 1}/{resultSet.length}
                </span>
                <button onClick={onNext} disabled={!canNext}
                  className={`p-1 rounded-md transition-colors ${canNext ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-[#d6d3d1] cursor-not-allowed'}`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#b9703f]" />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {decision.jurisdiction}{decision.chambre ? ` · ${decision.chambre}` : ''}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5">
            {decision.legifranceUrl && (
              <a href={decision.legifranceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6] transition-colors">
                <ExternalLink className="w-3 h-3" /> Légifrance
              </a>
            )}
            <button className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6] transition-colors">
              <Download className="w-3 h-3" /> PDF
            </button>
            <div className="w-px h-4 bg-[#e7e5e3] mx-1" />
            <button onClick={onClose} className="p-1.5 text-[#a8a29e] hover:text-[#78716c] hover:bg-[#eeece6] rounded-md transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══════════ HEADER ═══════════ */}
        <div className="px-5 pt-4 pb-3 border-b border-[#e7e5e3] flex-shrink-0" style={{ backgroundColor: '#fafaf9' }}>
          <div className="flex items-baseline gap-2 mb-1">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {decision.jurisdiction}{decision.chambre ? ` · ${decision.chambre}` : ''}
            </span>
          </div>
          <h2 style={{ fontFamily: "'EB Garamond', 'Georgia', serif", fontSize: 18, fontWeight: 400, color: '#292524', lineHeight: '24px', margin: 0 }}>
            Arrêt du {formatDateLong(decision.date)}
          </h2>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-[#a8a29e]" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>{decision.numero}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#a8a29e]" />
                <span style={{ fontSize: 12, color: '#78716c' }}>{formatDateLong(decision.date)}</span>
              </div>
            </div>

            {/* Actions — unified save */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowPosteDropdown(!showPosteDropdown)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all hover:opacity-90"
                  style={isPinned ? { backgroundColor: '#fdf8f4', color: '#b9703f' } : { backgroundColor: '#292524', color: 'white' }}>
                  <Bookmark className="w-3 h-3" style={isPinned ? { fill: 'currentColor' } : {}} />
                  {isPinned ? 'Sauvegardee' : 'Sauvegarder'}
                </button>
                {showPosteDropdown && (
                  <div className="absolute top-full mt-1.5 right-0 w-[260px] bg-white border border-[#e7e5e3] rounded-lg shadow-lg overflow-hidden" style={{ zIndex: 40 }}>
                    <div className="px-3 py-2 border-b border-[#f0efed]">
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Sauvegarder dans...
                      </span>
                    </div>
                    <button
                      onClick={() => { if (!isPinned) { onPin?.(decision.id); } setShowPosteDropdown(false); }}
                      className="w-full text-left px-3 py-2.5 text-[12px] text-[#292524] hover:bg-[#fafaf9] transition-colors flex items-center gap-2"
                      style={{ borderBottom: '1px solid #f0efed', backgroundColor: isPinned ? '#fafaf9' : 'transparent' }}>
                      <div className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isPinned ? '#b9703f' : '#d6d3d1', backgroundColor: isPinned ? '#b9703f' : 'white' }}>
                        {isPinned && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <Scale className="w-3.5 h-3.5 text-[#a8a29e]" />
                      <span className="font-medium">Dossier</span>
                      <span className="text-[#a8a29e] ml-0.5">(transverse)</span>
                    </button>
                    {posteOptions.length > 0 && (
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {posteOptions.map((p, i) => {
                          const isChecked = pinnedPosteIds.includes(p.id);
                          return (
                            <button key={p.id}
                              onClick={() => { onAttachToPoste?.(decision.id, p.id); }}
                              className="w-full text-left px-3 py-2 text-[12px] text-[#292524] hover:bg-[#fafaf9] transition-colors flex items-center gap-2"
                              style={{ borderBottom: i < posteOptions.length - 1 ? '1px solid #f0efed' : 'none' }}>
                              <div className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                                style={{ borderColor: isChecked ? '#b9703f' : '#d6d3d1', backgroundColor: isChecked ? '#b9703f' : 'white' }}>
                                {isChecked && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              </div>
                              <span className="badge badge-sm badge-secondary">{p.acronym}</span>
                              <span className="text-[#78716c] truncate text-[12px]">{p.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isPinned && (
                <button onClick={() => onUnpin?.(decision.id)}
                  className="p-1.5 rounded-md text-[#d6d3d1] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                  title="Retirer du dossier">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════ SEARCH BAR ═══════════ */}
        <div className="px-5 py-2.5 border-b border-[#e7e5e3] flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#fafaf9] border border-[#e7e5e3] transition-colors"
            style={searchQuery ? { borderColor: '#aabcd5', backgroundColor: '#f8fafd' } : {}}>
            <Search className="w-3.5 h-3.5 text-[#a8a29e] flex-shrink-0" />
            <input
              type="text" placeholder="Rechercher dans la décision…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#292524] placeholder-[#a8a29e] focus:outline-none"
            />
            {searchQuery && (
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#78716c' }}>
                  {searchMatchCount} résultat{searchMatchCount !== 1 ? 's' : ''}
                </span>
                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-[#eeece6] rounded transition-colors">
                  <X className="w-3 h-3 text-[#a8a29e]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ TWO-COLUMN BODY ═══════════ */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── LEFT: Résumé + themes + full text ─────────── */}
          <div ref={textPanelRef} className="flex-1 overflow-y-auto border-r border-[#f0efed]" style={{ minWidth: 0 }}>

            {/* Résumé */}
            <div className="px-5 pt-4 pb-3 border-b border-[#f0efed]">
              <SidebarSectionHeader label="Résumé" />
              <p style={{ fontSize: 14, lineHeight: '22px', color: '#44403c', margin: 0, marginTop: 8 }}>
                {highlightText(decision.resume)}
              </p>
            </div>

            {/* Themes */}
            {themes.length > 0 && (
              <div className="px-5 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Thèmes" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {themes.map((t, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[10.5px] font-medium"
                      style={{
                        backgroundColor: t.color === 'blue' ? '#eef3fa' : t.color === 'purple' ? '#f3eefa' : t.color === 'green' ? '#ecfdf5' : '#f5f5f4',
                        color: t.color === 'blue' ? '#1e3a8a' : t.color === 'purple' ? '#6b21a8' : t.color === 'green' ? '#065f46' : '#44403c',
                        border: `1px solid ${t.color === 'blue' ? '#c4d4eb' : t.color === 'purple' ? '#d4bfea' : t.color === 'green' ? '#a7f3d0' : '#e7e5e3'}`,
                        lineHeight: '14px',
                      }}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section nav tabs */}
            {sections.length > 0 && (
              <div className="sticky top-0 z-10 px-5 py-2 border-b border-[#f0efed] bg-white flex items-center gap-1 flex-wrap">
                {sections.map((s, i) => (
                  <button key={s.id} onClick={() => scrollToSection(s.id)}
                    className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor: activeSection === s.id ? '#292524' : 'transparent',
                      color: activeSection === s.id ? 'white' : '#78716c',
                    }}
                    onMouseOver={(e) => { if (activeSection !== s.id) e.currentTarget.style.backgroundColor = '#eeece6'; }}
                    onMouseOut={(e) => { if (activeSection !== s.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {/* Sections */}
            {sections.length > 0 ? (
              <div className="px-5 py-4">
                {sections.map((section, i) => (
                  <div key={section.id} ref={(el) => sectionRefs.current[section.id] = el} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#b9703f', opacity: 0.6 }} />
                      <h3 style={{ fontFamily: "'EB Garamond', 'Georgia', serif", fontSize: 16, fontWeight: 500, color: '#292524', margin: 0 }}>
                        {section.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: '23px', color: '#44403c', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {highlightText(section.content)}
                    </p>
                    {i < sections.length - 1 && <div className="mt-6 border-b border-[#f0efed]" />}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback: raw fullText */
              <div className="px-5 py-4">
                <p style={{ fontSize: 14, lineHeight: '23px', color: '#44403c', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {highlightText(decision.fullText || 'Texte intégral non disponible.')}
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ────────────── */}
          <div className="overflow-y-auto flex-shrink-0" style={{ width: 300, backgroundColor: '#fafaf9' }}>

            {/* Montants — hero section */}
            <div className="px-4 pt-4 pb-3 border-b border-[#f0efed]">
              <SidebarSectionHeader label="Montants" />
              <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                {decision.amounts.map((amt, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5"
                    style={{ borderBottom: i < decision.amounts.length - 1 ? '1px solid #f0efed' : 'none' }}>
                    <span className="badge badge-sm badge-secondary" title={amt.label}>
                      {amt.poste} : <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#b9703f' }}>{amt.displayValue}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil victime */}
            <div className="px-4 py-3 border-b border-[#f0efed]">
              <SidebarSectionHeader label="Profil victime" />
              {victime ? (
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #f0efed' }}>
                    <span style={{ fontSize: 12, color: '#78716c' }}>Victime</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{victime}</span>
                  </div>
                  {decision.category && (
                    <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: decision.status ? '1px solid #f0efed' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#78716c' }}>Catégorie</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{decision.category}</span>
                    </div>
                  )}
                  {decision.status && (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span style={{ fontSize: 12, color: '#78716c' }}>Statut</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{decision.status}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 8 }}>Données non disponibles.</p>
              )}
            </div>

            {/* Consolidation + données médicales */}
            {(med?.consolidation || med?.items?.length > 0) && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Données médicales" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {med?.consolidation && (
                    <div className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: med?.items?.length > 0 ? '1px solid #f0efed' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#78716c' }}>Consolidation</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{med.consolidation}</span>
                    </div>
                  )}
                  {med?.items?.map((item, i) => (
                    <div key={i} className="px-3 py-2"
                      style={{ borderBottom: i < med.items.length - 1 ? '1px solid #f0efed' : 'none' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#78716c', marginTop: 1 }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Préjudices temporaires */}
            {prejudices?.temporaires?.length > 0 && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Préjudices temporaires" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {prejudices.temporaires.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: '1px solid #f0efed' }}>
                      <span style={{ fontSize: 12, color: '#44403c', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                        {p.label}
                      </span>
                      <span className="flex-shrink-0" style={{ fontSize: 14, fontWeight: 600, color: p.highlighted ? '#b9703f' : '#292524' }}>
                        {fmt(p.montant)} €
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#fafaf9' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292524' }}>{fmt(tempTotal)} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Préjudices permanents */}
            {prejudices?.permanents?.length > 0 && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Préjudices permanents" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {prejudices.permanents.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: '1px solid #f0efed' }}>
                      <span style={{ fontSize: 12, color: '#44403c', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                        {p.label}
                      </span>
                      <span className="flex-shrink-0" style={{ fontSize: 14, fontWeight: 600, color: p.highlighted ? '#b9703f' : '#292524' }}>
                        {fmt(p.montant)} €
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#fafaf9' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292524' }}>{fmt(permTotal)} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>
        </div>

      </div>
    </>
  );
}
