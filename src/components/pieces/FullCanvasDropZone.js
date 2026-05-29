import React from 'react';
import { Upload } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Shown while files are being dragged over the Pièces tab. Fills the
// whole canvas height (min 80vh) so the bottom of the viewport is
// always droppable. Replaces — never overlays — the content underneath.

export default function FullCanvasDropZone() {
  return (
    <div style={{
      flex: 1,
      minHeight: '80vh',
      padding: 24,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      pointerEvents: 'none',
    }}>
      <div style={{
        flex: 1,
        minHeight: 0,
        border: `2px dashed ${colors.semantic.foregroundMuted}`,
        borderRadius: 12,
        background: colors.semantic.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: colors.semantic.white,
          border: `1px solid ${colors.semantic.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Upload style={{ width: 28, height: 28, color: colors.semantic.foreground }} strokeWidth={1.5} />
        </div>
        <div style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: 20,
          fontWeight: 500,
          color: colors.semantic.foreground,
        }}>
          Déposez vos fichiers ici
        </div>
        <div style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          color: colors.semantic.foregroundSecondary,
        }}>
          Plato les classera automatiquement dans le bon dossier
        </div>
      </div>
    </div>
  );
}
