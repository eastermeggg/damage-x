import React from 'react';
import { FileText, Plus, Pencil, MoreVertical } from 'lucide-react';
import EmptyState from '../EmptyState';

const colHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };

const STATUS_LABELS = { brouillon: 'Brouillon', pret: 'Prêt', envoye: 'Envoyé' };
const STATUS_COLORS = {
  brouillon: 'bg-[#eeece6] text-[#44403c]',
  pret: 'bg-[#dcfce7] text-[#166534]',
  envoye: 'bg-[#dbeafe] text-[#1e3a8a]',
};

const ACT_TYPE_LABELS = {
  assignation: 'Assignation',
  conclusions: 'Conclusions',
  requete: 'Requête',
  dire: 'Dire',
  email: 'Courrier',
  protocole: 'Protocole',
  'note-delibere': 'Note en délibéré',
};

export default function ActesList({ actes = [], onOpen, onNewActe, onSendPrompt }) {
  if (actes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <EmptyState
          icon={Pencil}
          title="Rédigez votre premier acte"
          description="Assignation, référé, demande d'expertise, e-mails... demandez n'importe quel type d'acte à Plato."
          primaryAction={{
            label: 'Rédiger un acte',
            onClick: () => {
              if (onSendPrompt) onSendPrompt('Rédige une assignation');
              else if (onNewActe) onNewActe();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4 -mt-4">
      {/* Sub-header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e7e5e3]">
        <div />
        {onNewActe && (
          <button
            onClick={onNewActe}
            className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-white bg-[#292524] rounded-md hover:bg-[#44403c] shadow-[0px_1px_2px_0px_rgba(26,26,26,0.05)] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nouvel acte
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="border border-[#e7e5e3] rounded-md overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center bg-white border-b border-[#e7e5e3]">
            <div className="w-[38px] h-10 shrink-0" />
            <div className="flex-1 min-w-0 px-3 py-3" style={colHeaderStyle}>Titre</div>
            <div className="w-[140px] shrink-0 px-3 py-3" style={colHeaderStyle}>Type</div>
            <div className="w-[110px] shrink-0 px-3 py-3" style={colHeaderStyle}>Statut</div>
            <div className="w-[120px] shrink-0 px-3 py-3" style={colHeaderStyle}>Modifié</div>
            <div className="w-[44px] shrink-0" />
          </div>

          {/* Rows */}
          {actes.map(acte => (
            <div
              key={acte.id}
              className="flex items-center h-14 bg-white border-b border-[#e7e5e3] last:border-b-0 cursor-pointer hover:bg-[#fafaf9] transition-colors group"
              onClick={() => onOpen?.(acte.id)}
            >
              {/* Icon */}
              <div className="w-[38px] shrink-0 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#a8a29e]" strokeWidth={1.5} />
              </div>
              {/* Title */}
              <div className="flex-1 min-w-0 px-3">
                <span className="text-sm font-medium text-black truncate block">{acte.title}</span>
              </div>
              {/* Type */}
              <div className="w-[140px] shrink-0 px-3">
                <span className="text-sm text-[#292524]">{ACT_TYPE_LABELS[acte.actType] || acte.actType || '—'}</span>
              </div>
              {/* Status badge */}
              <div className="w-[110px] shrink-0 px-3">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${STATUS_COLORS[acte.status] || STATUS_COLORS.brouillon}`}>
                  {STATUS_LABELS[acte.status] || acte.status || 'Brouillon'}
                </span>
              </div>
              {/* Date */}
              <div className="w-[120px] shrink-0 px-3">
                <span className="text-sm text-[#292524]">{acte.lastUpdated || '—'}</span>
              </div>
              {/* Options */}
              <div className="w-[44px] shrink-0 flex items-center justify-end pr-4">
                <MoreVertical className="w-4 h-4 text-[#78716c] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
