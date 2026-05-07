import React from 'react';
import { colors } from '../../design-system/tokens';

const STATUS_CONFIG = {
  pending:           { label: 'Pending',         bg: colors.semantic.cream,         fg: colors.semantic.foregroundTertiary },
  validated:         { label: 'Validated',       bg: colors.badge.success.bg,       fg: colors.badge.success.fg },
  'needs-revision':  { label: 'Needs revision',  bg: colors.badge.warning.bg,       fg: colors.badge.warning.fg },
  missing:           { label: 'Missing',         bg: colors.badge.destructiveSubtle.bg, fg: colors.badge.destructiveSubtle.fg },
};

export default function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}
