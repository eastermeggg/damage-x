import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import AlertDialog from '../AlertDialog';

// Destructive confirmation modal. Renders a list summary of what's about
// to be removed and an irreversibility warning. Same component drives both
// folder deletions (which may contain pieces) and piece deletions.

export default function DeleteWarningModal({
  open,
  onOpenChange,
  title,
  itemsSummary,        // string or array of strings to list
  warning,             // optional extra warning, e.g. "Le dossier contient 3 pièces qui seront aussi supprimées."
  onConfirm,
}) {
  const items = Array.isArray(itemsSummary) ? itemsSummary : (itemsSummary ? [itemsSummary] : []);

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={AlertTriangle}
      iconVariant="destructive"
      title={title}
      description="Cette action est irréversible."
      warning={warning}
      cancelLabel="Annuler"
      actionLabel="Supprimer"
      actionVariant="destructive"
      onAction={() => { onConfirm?.(); onOpenChange?.(false); }}
    >
      {items.length > 0 && (
        <ul style={{
          marginTop: 4,
          padding: 0,
          listStyle: 'none',
          maxHeight: 160,
          overflowY: 'auto',
          backgroundColor: colors.semantic.background,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 6,
        }}>
          {items.map((label, i) => (
            <li
              key={i}
              style={{
                padding: '6px 12px',
                fontFamily: typography.fontFamily.sans,
                fontSize: 13,
                color: colors.semantic.foregroundTertiary,
                borderBottom: i < items.length - 1 ? `1px solid ${colors.semantic.border}` : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </AlertDialog>
  );
}
