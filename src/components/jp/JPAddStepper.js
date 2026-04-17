import React, { useState } from 'react';
import { X, Link, FileText, Tag, ChevronRight, Check } from 'lucide-react';

export default function JPAddStepper({ onClose, onSubmit, posteOptions = [] }) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [impact, setImpact] = useState('');
  const [selectedPoste, setSelectedPoste] = useState(null);

  const canProceed = step === 1 ? url.trim().length > 0 : step === 2 ? impact.trim().length > 0 : true;

  const handleSubmit = () => {
    onSubmit?.({
      url,
      impact,
      posteId: selectedPoste,
    });
    onClose?.();
  };

  const steps = [
    { num: 1, label: 'Source', icon: Link },
    { num: 2, label: 'Impact', icon: FileText },
    { num: 3, label: 'Poste', icon: Tag },
  ];

  return (
    <div className="w-full" style={{ paddingRight: 16 }}>
      <div
        className="bg-white rounded-lg border border-[#e7e5e3] overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0efed]" style={{ backgroundColor: '#fafaf9' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase' }}>
              Ajouter une décision
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#eeece6] rounded transition-colors">
            <X className="w-3.5 h-3.5 text-[#a8a29e]" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 px-4 py-2.5 border-b border-[#f0efed]">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                {i > 0 && <div className="w-6 h-px mx-1" style={{ backgroundColor: isDone ? '#b9703f' : '#e7e5e3' }} />}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isDone ? '#b9703f' : isActive ? '#292524' : '#eeece6',
                    }}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    ) : (
                      <StepIcon className="w-2.5 h-2.5" style={{ color: isActive ? 'white' : '#a8a29e' }} />
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, color: isActive ? '#292524' : isDone ? '#b9703f' : '#a8a29e' }}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <div className="px-4 py-4">
          {step === 1 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                URL Légifrance ou autre source
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.legifrance.gouv.fr/juri/id/..."
                className="w-full px-3 py-2 text-[14px] rounded-md border border-[#e7e5e3] bg-white text-[#292524] placeholder-[#a8a29e] focus:outline-none focus:border-[#aabcd5]"
              />
              <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 6 }}>
                Collez le lien Légifrance. Les métadonnées seront extraites automatiquement.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                Pourquoi cette décision est pertinente ?
              </label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="Ex: Taux horaire d'ATPT à 28€ dans le cas d'une étudiante vivant à Paris"
                className="w-full px-3 py-2 text-[14px] rounded-md border border-[#e7e5e3] bg-white text-[#292524] placeholder-[#a8a29e] focus:outline-none focus:border-[#aabcd5] resize-none"
                rows={3}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#44403c', display: 'block', marginBottom: 6 }}>
                Assigner à un poste (optionnel)
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedPoste(null)}
                  className="w-full text-left px-3 py-2 rounded-md text-[14px] transition-colors"
                  style={{
                    backgroundColor: selectedPoste === null ? '#fafaf9' : 'transparent',
                    border: selectedPoste === null ? '1px solid #b9703f' : '1px solid #e7e5e3',
                    color: '#44403c',
                  }}
                >
                  Aucun poste (transverse au dossier)
                </button>
                {posteOptions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPoste(p.id)}
                    className="w-full text-left px-3 py-2 rounded-md text-[14px] transition-colors"
                    style={{
                      backgroundColor: selectedPoste === p.id ? '#fafaf9' : 'transparent',
                      border: selectedPoste === p.id ? '1px solid #b9703f' : '1px solid #e7e5e3',
                      color: '#44403c',
                    }}
                  >
                    <span className="font-medium">{p.acronym}</span>
                    <span className="text-[#78716c] ml-1.5">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0efed]">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose?.()}
            className="text-[14px] text-[#78716c] hover:text-[#292524] transition-colors"
          >
            {step > 1 ? '← Retour' : 'Annuler'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium transition-all"
              style={{
                backgroundColor: canProceed ? '#292524' : '#eeece6',
                color: canProceed ? 'white' : '#a8a29e',
                cursor: canProceed ? 'pointer' : 'not-allowed',
              }}
            >
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#292524', color: 'white' }}
            >
              <Check className="w-3.5 h-3.5" />
              Ajouter au dossier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
