# Plato UI primitives — usage rules

This folder holds the canonical reusable components for the Norma app.
Any agent (or human) working on this repo MUST consult this index before
creating new UI in this area of the codebase.

The catalog of every component (built or planned) lives at
`src/data/designSystemInventory.json`. The validation interface for it is
`/ui-kit/inventory`.

---

## Hard rules

1. **Always reuse from `src/components/ui/`.**
   Never re-roll a button, badge, input, modal, dropzone, etc. inline. If the
   primitive exists here, import it. If it doesn't but exists as an inline
   preview in `src/components/ui-kit/previews.jsx`, the answer is the same:
   open the inventory, validate it, build it into this folder, then import
   from here. Never copy the inline preview into a feature file.

2. **Before creating a new primitive, ASK THE USER.**
   First check `src/data/designSystemInventory.json` — the component may
   already be planned (`status: "missing"`) with a Figma reference. Building
   without confirming the Figma source is a bug. If the component genuinely
   doesn't exist anywhere, ask the user before scaffolding it: confirm the
   name, the Figma reference, and the variants needed. Don't invent.

3. **When updating an existing primitive, WARN THE USER FIRST.**
   Updates in this folder ripple across every feature that imports them. Post
   the intended diff in chat — what props change, what visuals change, which
   call sites are affected — and wait for approval before editing the file.
   Never silently bump an existing primitive's behavior.

4. **Prop names are stable.**
   Don't rename existing props without an explicit migration plan. Feature
   components import these — a rename is a breaking change.

5. **Use tokens, not hardcoded values.**
   Every color / spacing / radius / shadow / typography value MUST come from
   `src/design-system/tokens.js`. No raw hex, no raw px, no inline shadow
   strings. If a token doesn't exist for what you need, add it to tokens.js
   first and surface it in `/ui-kit/tokens` for validation.

6. **Each primitive has a sibling `.md` doc.**
   `Badge.js` ↔ `Badge.md`. Read it before using or modifying the component.
   Created and maintained by the validation flow at `/ui-kit/c/<id>`.

---

## Index of primitives

| Component | File | Doc | Figma node | Modes |
|-----------|------|-----|------------|-------|
| Badge | [Badge.js](./Badge.js) | [Badge.md](./Badge.md) | 136:1178 (Plato---System) | label · number · icon-only |

Other primitives planned but not yet built live as inline sketches in
`src/components/ui-kit/previews.jsx` — see the inventory for the full list and
their statuses.

---

## How to add or update a primitive

1. Open `/ui-kit/c/<ComponentId>` (or `/ui-kit/inventory` and pick one).
2. Paste the Figma URL. Add notes and Usage Rules.
3. Set status: `missing` (new), `needs-revision` (existing, drift), or
   `validated` (matches Figma).
4. Click "Copy prompt".
5. Paste back into Claude Code. The generated prompt will:
   - Update the inventory entry.
   - Build/sync the React file (matching Figma, using tokens).
   - Generate or update the sibling `.md` from your Usage Rules.
   - Update this CLAUDE.md index.
   - Verify routes + build, then commit.

If you're an agent reading this and the user has NOT gone through that flow,
do not start building — ask them to validate the entry at `/ui-kit/c/<id>`
first.
