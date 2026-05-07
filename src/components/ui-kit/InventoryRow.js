import React from 'react';
import StatusPill from './StatusPill';
import { colors } from '../../design-system/tokens';

/**
 * Single inventory row — used by both /ui-kit/tokens and /ui-kit/inventory.
 *
 * Props:
 * - preview: ReactNode — visual preview (color swatch, type sample, ruler, etc.)
 * - name: string — token or component identifier
 * - meta: ReactNode — secondary info (value, file path, etc.)
 * - status: 'pending' | 'validated' | 'needs-revision' | 'missing'
 * - figmaRef: string — current Figma URL (read-only display)
 * - notes: string — current notes (read-only display)
 * - id: string — entry id, used in the "tell Claude" snippet
 * - actions: ReactNode — extra actions (e.g., "Open in code")
 */
export default function InventoryRow({ preview, name, meta, status, figmaRef, notes, id, actions }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1fr auto',
        gap: 16,
        padding: '14px 16px',
        borderBottom: `1px solid ${colors.semantic.border}`,
        alignItems: 'flex-start',
      }}
    >
      {/* Preview cell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 40 }}>
        {preview}
      </div>

      {/* Body cell */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>
            {name}
          </span>
          <StatusPill status={status} />
        </div>
        {meta && (
          <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, lineHeight: '16px' }}>{meta}</div>
        )}
        {(figmaRef || notes) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            {figmaRef && (
              <div style={{ fontSize: 12, lineHeight: '16px', color: colors.semantic.foregroundSecondary }}>
                <span style={{ fontWeight: 500, color: colors.semantic.foregroundTertiary }}>Figma: </span>
                <a href={figmaRef} target="_blank" rel="noreferrer" style={{ color: colors.banner.info.accent, textDecoration: 'underline', wordBreak: 'break-all' }}>{figmaRef}</a>
              </div>
            )}
            {notes && (
              <div style={{ fontSize: 12, lineHeight: '16px', color: colors.semantic.foregroundSecondary, fontStyle: 'italic' }}>
                {notes}
              </div>
            )}
          </div>
        )}
        <details style={{ marginTop: 6 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            Tell Claude to update
          </summary>
          <code
            style={{
              display: 'block',
              marginTop: 6,
              padding: '8px 10px',
              backgroundColor: colors.semantic.backgroundSubtle,
              borderRadius: 6,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              lineHeight: '16px',
              color: colors.semantic.foregroundTertiary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {`id: ${id}\nfigmaRef: <paste Figma URL here>\nnotes: <your notes>\nstatus: validated | needs-revision | pending`}
          </code>
        </details>
      </div>

      {/* Actions cell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>
    </div>
  );
}
