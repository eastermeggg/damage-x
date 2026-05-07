import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import StatusPill from './StatusPill';

const STATUS_OPTIONS = ['pending', 'validated', 'needs-revision', 'missing'];

/**
 * Fillable form that pre-fills with the current inventory entry's values and
 * generates a copy-pasteable prompt for Claude Code.
 *
 * Props:
 * - entry: { id, figmaRef, notes, usageRules, status, ... }
 * - kind: 'component' | 'token'
 */
export default function UpdateEntryForm({ entry, kind = 'component' }) {
  const [figmaRef, setFigmaRef] = useState(entry.figmaRef || '');
  const [notes, setNotes] = useState(entry.notes || '');
  const [usageRules, setUsageRules] = useState(entry.usageRules || '');
  const [status, setStatus] = useState(entry.status || 'pending');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildPrompt({ entry, kind, figmaRef, notes, usageRules, status }),
    [entry, kind, figmaRef, notes, usageRules, status],
  );

  const dirty =
    figmaRef !== (entry.figmaRef || '') ||
    notes !== (entry.notes || '') ||
    usageRules !== (entry.usageRules || '') ||
    status !== (entry.status || 'pending');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.prompt('Copy this prompt:', prompt);
    }
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        background: '#fff',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: typography.fontFamily.mono, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>
            Validate / update entry
          </div>
          <div style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, marginTop: 2 }}>
            Fill in the fields below, then copy the generated prompt and paste it back into Claude Code.
          </div>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <Field label="Figma URL">
        <input
          type="url"
          value={figmaRef}
          onChange={e => setFigmaRef(e.target.value)}
          placeholder="https://www.figma.com/design/…?node-id=…"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            color: colors.semantic.foreground,
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 6,
            background: '#fff',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </Field>

      <Field
        label="Notes"
        hint="Quick context — what looks off, missing variants, links to other refs. Shown in the inventory."
      >
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="What looks off, what variants are needed, links to other refs…"
          style={textareaStyle()}
        />
      </Field>

      <Field
        label="Usage rules"
        hint="When to use, when NOT to use, props that matter. Becomes the sibling .md doc that future agents read before importing or modifying this component."
      >
        <textarea
          value={usageRules}
          onChange={e => setUsageRules(e.target.value)}
          rows={5}
          placeholder={`Use this for: status pills, counts, category tags…\nDon't use for: filter chips (use Tabs), interactive elements (use Button)…\nKey props: variant=success/warning/destructive…, size=sm/md…`}
          style={textareaStyle()}
        />
      </Field>

      <Field label="Status">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                  backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontFamily: typography.fontFamily.mono, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>
            Generated prompt {dirty ? <span style={{ color: colors.banner.warning.accent, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>· unsaved</span> : null}
          </span>
          <button
            onClick={onCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13, fontWeight: 600,
              color: copied ? colors.semantic.white : colors.semantic.foreground,
              background: copied ? colors.banner.success.accent : colors.semantic.cream,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
          >
            {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            background: colors.semantic.backgroundSubtle,
            borderRadius: 8,
            fontFamily: typography.fontFamily.mono,
            fontSize: 12,
            lineHeight: '18px',
            color: colors.semantic.foregroundTertiary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: `1px solid ${colors.semantic.border}`,
          }}
        >
          {prompt}
        </pre>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary, marginBottom: 4 }}>
        {label}
      </label>
      {hint && (
        <div style={{ fontSize: 11, color: colors.semantic.foregroundMuted, marginBottom: 6, lineHeight: '15px' }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

function textareaStyle() {
  return {
    width: '100%',
    resize: 'vertical',
    padding: '8px 12px',
    fontSize: 13, lineHeight: '20px',
    color: colors.semantic.foreground,
    border: `1px solid ${colors.semantic.border}`,
    borderRadius: 6,
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };
}

function buildPrompt({ entry, kind, figmaRef, notes, usageRules, status }) {
  if (kind === 'token') {
    return [
      'Update the design-system inventory.',
      '',
      `In src/data/designSystemInventory.json, find the token entry with id "${entry.id}" inside tokens (look in colors / typography / spacing / radius / shadows / motion arrays).`,
      'Set the following fields exactly:',
      `- figmaRef: ${JSON.stringify(figmaRef || '')}`,
      `- notes: ${JSON.stringify(notes || '')}`,
      `- status: "${status}"`,
      '',
      `Leave all other fields unchanged. Then verify curl /ui-kit/tokens returns 200 and commit with message:`,
      `chore(ds): validate ${entry.id}`,
    ].join('\n');
  }

  // Components — include build/sync + doc generation when we have a Figma URL
  // and the component either doesn't exist (status: missing) or needs to be
  // re-aligned (status: needs-revision).
  const shouldBuild = !!figmaRef && (status === 'missing' || status === 'needs-revision');
  const componentExists = !!entry.filePath;
  const newFilePath = `src/components/ui/${entry.id}.js`;
  const docPath = `src/components/ui/${entry.id}.md`;
  const indexPath = `src/components/ui/CLAUDE.md`;
  const today = new Date().toISOString().slice(0, 10);

  const out = [];
  out.push('Update the design-system inventory and (where applicable) the component code + docs.');
  out.push('');
  out.push(`Read ${indexPath} first — it contains the hard rules for this folder (always reuse, ask before creating, warn before updating). Follow them.`);
  out.push('');

  // STEP 1 — inventory metadata
  out.push('STEP 1 — Update inventory entry.');
  out.push(`In src/data/designSystemInventory.json, find the component entry with id "${entry.id}" inside the components array.`);
  out.push('Set the following fields exactly:');
  out.push(`- figmaRef: ${JSON.stringify(figmaRef || '')}`);
  out.push(`- notes: ${JSON.stringify(notes || '')}`);
  out.push(`- usageRules: ${JSON.stringify(usageRules || '')}`);
  out.push(`- status: "${status}"`);
  out.push('Leave all other fields unchanged.');

  // STEP 2 — build / sync the React component
  if (shouldBuild) {
    out.push('');
    out.push('STEP 2 — Integrate the component as a real React wrapper that matches the Figma exactly.');
    if (!componentExists) {
      out.push(`The component "${entry.id}" does not yet exist as a reusable file. An inline preview lives in src/components/ui-kit/previews.jsx (function ${entry.id}).`);
      out.push('Do the following:');
      out.push(`1. Open the Figma node above and inspect every variant, default state, and design token (colors, spacing, radius, typography, shadows). Use mcp__figma__get_design_context (or mcp__figma__get_screenshot for a visual reference) on the URL.`);
      out.push(`2. Create ${newFilePath} as a real React wrapper that renders the component pixel-accurate to Figma. Reference src/design-system/tokens.js for any color, spacing, radius, typography, or shadow value — do not hardcode hex / px / shadow strings. Cover every variant shown in the Figma.`);
      out.push(`3. Replace the inline implementation in src/components/ui-kit/previews.jsx so the existing /ui-kit/c/${entry.id} sandbox keeps working. Use a default-import alias pattern (e.g. \`import ${entry.id}Real from '../ui/${entry.id}'; export const ${entry.id} = ${entry.id}Real;\`) so the local PREVIEWS map at the bottom of the file still resolves.`);
      out.push(`4. On the same inventory entry, set filePath: "${newFilePath}" and exists: true.`);
    } else {
      out.push(`The component already exists at ${entry.filePath}. Per ${indexPath} rule #3, BEFORE editing the file: post the intended diff to chat (props added/removed, visual changes, affected call sites) and wait for explicit user confirmation. Then:`);
      out.push(`1. Open the Figma node above and diff visually against the current implementation.`);
      out.push(`2. Apply changes to make the React component match the Figma. Reference src/design-system/tokens.js for tokens — do not hardcode values.`);
      out.push(`3. Preserve the existing public API (prop names, exported component) unless the Figma demands a new variant — in that case add the prop and update the demo controls in src/components/ui-kit/componentDemos.jsx.`);
    }

    // STEP 3 — co-located doc
    out.push('');
    out.push(`STEP 3 — Write or update the sibling doc at ${docPath}.`);
    out.push('Use this exact template (fill in the parts in <angle brackets> from the Usage rules above and the Figma reference):');
    out.push('');
    out.push('```markdown');
    out.push(`# ${entry.id}`);
    out.push('');
    out.push('<one-line description from the Figma>.');
    out.push('');
    out.push(`- **File:** \`${newFilePath}\``);
    out.push(`- **Inventory id:** \`${entry.id}\``);
    out.push(`- **Figma:** ${figmaRef || '<paste URL>'}`);
    out.push(`- **Status:** ${status} (last validated ${today})`);
    out.push('');
    out.push('## When to use');
    out.push('<bullet list — taken from the Usage rules above>');
    out.push('');
    out.push('## When NOT to use');
    out.push('<bullet list — taken from the Usage rules above; if not provided, infer sensible boundaries from the Figma>');
    out.push('');
    out.push('## Variants');
    out.push('<list every variant from the Figma>');
    out.push('');
    out.push('## Examples');
    out.push('```jsx');
    out.push(`import ${entry.id} from 'src/components/ui/${entry.id}';`);
    out.push('// 2-3 example call sites covering the main variants/modes');
    out.push('```');
    out.push('');
    out.push('## Tokens used');
    out.push('<list the tokens from src/design-system/tokens.js this component reads>');
    out.push('');
    out.push('## Sandbox');
    out.push(`\`/ui-kit/c/${entry.id}\` — live controls.`);
    out.push('```');
    out.push('');
    out.push('Use the Usage rules text above verbatim where it fits. If the user did not provide Usage rules, write a first draft based on the Figma + your judgment, then ask the user to refine it.');

    // STEP 4 — update the index
    out.push('');
    out.push(`STEP 4 — Update the primitives index at ${indexPath}.`);
    out.push(`Add (or update) a row in the "Index of primitives" table for ${entry.id} with: file link, doc link, Figma node id, and the modes/variants in one short cell. Keep the table sorted alphabetically by component name.`);
  }

  // STEP 5 — verify and commit
  out.push('');
  out.push('STEP 5 — Verify.');
  out.push(`- curl http://localhost:3000/ui-kit/c/${entry.id} returns 200 and the sandbox renders correctly.`);
  out.push('- curl http://localhost:3000/ui-kit/inventory returns 200.');
  out.push('- npm run build succeeds with no new warnings in the new code.');
  out.push(`- ${docPath} exists and reflects the Usage rules.`);
  out.push(`- ${indexPath} index has a row for ${entry.id}.`);

  out.push('');
  if (shouldBuild && !componentExists) {
    out.push(`Commit with message: feat(ui): build ${entry.id} from Figma`);
  } else if (shouldBuild) {
    out.push(`Commit with message: fix(ui): align ${entry.id} with Figma`);
  } else {
    out.push(`Commit with message: chore(ds): validate ${entry.id}${status === 'validated' ? '' : ' (' + status + ')'}`);
  }

  return out.join('\n');
}
