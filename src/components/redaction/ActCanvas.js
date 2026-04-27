import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FileText } from 'lucide-react';

// Simple markdown-aware line renderer (bold, italic, pièce badges)
const renderInlineMarkdown = (text) => {
  // Split on pièce references: [pièce:N:name:date]
  const parts = text.split(/(\[pièce:\d+:[^\]]+\])/g);
  return parts.map((part, i) => {
    // Pièce badge
    const pieceMatch = part.match(/^\[pièce:(\d+):([^:]+?)(?::([^\]]+))?\]$/);
    if (pieceMatch) {
      const num = pieceMatch[1];
      const name = pieceMatch[2];
      return (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#dfe8f5',
            borderRadius: 6,
            padding: '2px 8px',
            verticalAlign: 'middle',
            lineHeight: '16px',
            margin: '0 2px',
          }}
        >
          <FileText style={{ width: 12, height: 12, color: '#1e3a8a', flexShrink: 0 }} strokeWidth={1.5} />
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#1e3a8a',
            fontFamily: "'Inter', system-ui, sans-serif",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 260,
          }}>
            Pièce {num} - {name}
          </span>
        </span>
      );
    }
    // Bold / italic
    const mdParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return mdParts.map((md, j) => {
      if (md.startsWith('**') && md.endsWith('**')) {
        return <strong key={`${i}-${j}`} style={{ fontWeight: 600 }}>{md.slice(2, -2)}</strong>;
      }
      if (md.startsWith('*') && md.endsWith('*')) {
        return <em key={`${i}-${j}`}>{md.slice(1, -1)}</em>;
      }
      return md;
    });
  });
};

// Bordereau table renderer — matches Figma RowBordereau (36448:16485)
const renderBordereau = (rows) => {
  const font = "'Inter', system-ui, sans-serif";
  const mono = "'IBM Plex Mono', monospace";
  return (
    <div style={{ width: '100%', marginTop: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', height: 40, borderBottom: '1px solid #e7e5e3' }}>
        <div style={{ width: 46, textAlign: 'center', fontFamily: mono, fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', flexShrink: 0 }}>N°</div>
        <div style={{ flex: 1, padding: '0 12px', fontFamily: mono, fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase' }}>Nom de la pièce</div>
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 52,
            borderBottom: i < rows.length - 1 ? '1px solid #e7e5e3' : 'none',
            backgroundColor: i % 2 === 1 ? '#f8f7f5' : 'white',
          }}
        >
          {/* Numbered badge */}
          <div style={{ width: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: '#eeece6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: font,
              fontSize: 12,
              fontWeight: 600,
              color: '#78716c',
            }}>
              {row.num}
            </div>
          </div>
          {/* Piece name + date */}
          <div style={{ flex: 1, padding: '0 12px', fontFamily: font, fontSize: 14, color: '#292524', lineHeight: '20px', minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {row.name} [{row.date}]
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ActCanvas({ content, streaming, onZoneSelect, hasActiveZone }) {
  const scrollRef = useRef(null);
  const pageRef = useRef(null);
  const [highlightRects, setHighlightRects] = useState([]);

  // Auto-scroll while streaming
  useEffect(() => {
    if (streaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, streaming]);

  // Clear highlight overlay when zone is deselected
  useEffect(() => {
    if (!hasActiveZone) setHighlightRects([]);
  }, [hasActiveZone]);

  // Capture native text selection → overlay highlight + send to context bar
  const handleMouseUp = useCallback(() => {
    if (!onZoneSelect) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 0 && pageRef.current) {
      const range = sel.getRangeAt(0);
      if (!pageRef.current.contains(range.commonAncestorContainer)) return;

      // Compute highlight rects relative to the page container
      const pageRect = pageRef.current.getBoundingClientRect();
      const rects = Array.from(range.getClientRects()).map(r => ({
        top: r.top - pageRect.top,
        left: r.left - pageRect.left,
        width: r.width,
        height: r.height,
      }));
      setHighlightRects(rects);

      // Truncate for context bar label
      const truncated = text.length > 60 ? text.slice(0, 60).replace(/\s\S*$/, '') + '…' : text;
      sel.removeAllRanges();
      onZoneSelect(truncated);
    }
  }, [onZoneSelect]);

  // Parse content into styled paragraphs
  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b9703f] animate-pulse" />
            <span style={{ fontSize: 13, color: '#a8a29e' }}>Rédaction en cours...</span>
          </div>
        </div>
      );
    }

    const font = "'Inter', system-ui, sans-serif";

    // Extract bordereau block if present
    const bordereauMatch = content.match(/\[bordereau\]\n([\s\S]*?)\n\[\/bordereau\]/);
    let bordereauRows = null;
    let mainContent = content;
    if (bordereauMatch) {
      mainContent = content.replace(/\[bordereau\]\n[\s\S]*?\n\[\/bordereau\]/, '').trimEnd();
      bordereauRows = bordereauMatch[1].split('\n').filter(l => l.trim()).map(line => {
        const [num, name, type, date] = line.split('|');
        return { num: num.trim(), name: name.trim(), type: type.trim(), date: date.trim() };
      });
    }

    const lines = mainContent.split('\n');

    const elements = lines.map((line, i) => {
      const trimmed = line.trim();

      if (!trimmed) return <div key={i} style={{ height: 8 }} />;

      // H1 — first few all-caps lines
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-') && i < 3) {
        return <h1 key={i} style={{ fontFamily: font, fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', lineHeight: '32px' }}>{trimmed}</h1>;
      }

      // H2 — all-caps section titles
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-')) {
        return <h2 key={i} style={{ fontFamily: font, fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '28px 0 8px', lineHeight: '26px' }}>{trimmed}</h2>;
      }

      // H3 — roman numeral sections (I. II. III.)
      if (/^[IVX]+\.\s/.test(trimmed)) {
        return <h3 key={i} style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '24px 0 6px', lineHeight: '24px' }}>{renderInlineMarkdown(trimmed)}</h3>;
      }

      // Numbered items (1° 2°)
      if (/^\d+°\s/.test(trimmed)) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '4px 0', paddingLeft: 24 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Numbered list (1. 2. 3.)
      if (/^\d+\.\s/.test(trimmed)) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '3px 0', paddingLeft: 24 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Bullet points
      if (trimmed.startsWith('- ')) {
        return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '2px 0', paddingLeft: 28, textIndent: -14 }}>{renderInlineMarkdown(trimmed)}</p>;
      }

      // Horizontal rule
      if (/^[—─\-]{3,}$/.test(trimmed)) {
        return <hr key={i} style={{ border: 'none', borderTop: '1px solid #e7e5e3', margin: '20px 0' }} />;
      }

      // Regular paragraph
      return <p key={i} style={{ fontFamily: font, fontSize: 14, lineHeight: '22px', color: '#37352f', margin: '3px 0' }}>{renderInlineMarkdown(trimmed)}</p>;
    });

    // Append bordereau table if present
    if (bordereauRows) {
      elements.push(
        <div key="bordereau">
          {renderBordereau(bordereauRows)}
        </div>
      );
    }

    return elements;
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{ backgroundColor: '#f8f7f5' }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px' }}>
        <div
          ref={pageRef}
          onMouseUp={handleMouseUp}
          className="relative"
          style={{
            backgroundColor: 'white',
            borderRadius: 3,
            border: '1px solid #e7e5e3',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.025)',
            padding: '48px 64px',
            minHeight: 600,
            cursor: 'text',
            userSelect: 'text',
            position: 'relative',
          }}
        >
          {/* Highlight overlays */}
          {highlightRects.map((r, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                backgroundColor: '#dbeafe',
                opacity: 0.5,
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
          ))}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
