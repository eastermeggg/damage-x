# Badge

Inline status / tag / count badge. Source of truth: Figma node `136:1178`
(Plato---System file).

- **File:** `src/components/ui/Badge.js`
- **Inventory id:** `Badge`
- **Figma:** https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=136-1178
- **Status:** validated (last validated 2026-05-07)

---

## When to use

- Status indicators on rows, cards, and table cells (`Validated`, `À revoir`,
  `Pending`, `Erreur`).
- Notification / unread counts on icons, tabs, sidebar items (`number` mode).
- Compact icon affordances inside dense toolbars (`icon-only` mode).
- Category / piece-type tags on dossier rows or chat artifacts.

## When NOT to use

- **Filter chips** — use `Tabs` (`variant="pills"`) instead.
- **Buttons** — Badges are non-interactive labels. If it should be clickable
  with an action, use `Button` (`variant="secondary"` or `"ghost"`).
- **Multi-line content** — Badge is single-line and ellipsis-truncates. Use a
  card or callout instead.
- **Form inputs / toggles** — use `Checkbox`, `Switch`, or `RadioGroup`.

## Variants (8)

`default` · `secondary` · `outline` · `destructive` · `ai` · `success` · `info` · `warning`

Note: `destructive-subtle` and `dot` from earlier prototypes are NOT in the
Figma library and are not part of the public API.

## Sizes

`sm` (default, 20 px tall) · `md` (24 px tall)

## Modes

| Mode | When | Trigger |
|------|------|---------|
| `label` | text + optional left/right icon | `<Badge label="…" leftIcon={X} rightIcon={Y} />` |
| `number` | a numeric count (full-radius pill) | `<Badge count={8} />` — caps at `99+` |
| `icon-only` | a single icon, no text (full-radius pill) | `<Badge iconOnly icon={Sparkles} />` |

## Examples

```jsx
import Badge from 'src/components/ui/Badge';
import { Sparkles, Trash2 } from 'lucide-react';

// Status pill in a table cell
<Badge variant="success" label="Validated" />

// AI tag with leading icon
<Badge variant="ai" label="AI" leftIcon={Sparkles} />

// Notification count
<Badge variant="destructive" count={12} />

// Icon-only chip in a toolbar
<Badge variant="ai" iconOnly icon={Sparkles} />
```

## Tokens used

- `colors.badge.*` (bg + fg per variant)
- `colors.semantic.foregroundSecondary` (outline number/icon-only fg)
- `radius.md` (label) / `radius.full` (number, icon-only)
- `typography.scale['caption-medium']`

## Sandbox

`/ui-kit/c/Badge` — live controls + presets covering every mode × variant of
interest.
