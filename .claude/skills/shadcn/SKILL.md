---
name: shadcn
description: "Add or manage shadcn/ui components in this project via the real shadcn CLI"
argument-hint: "[add <component> | list]"
user-invocable: true
---

This project already has shadcn/ui configured (`components.json` at the repo root, style `radix-nova`,
base color `neutral`, icon library `lucide`, dark-mode via CSS variables in `src/index.css`). Existing
generated components live in `src/components/ui/` — check that folder first so you don't re-add a component
that's already there.

## Behavior

- **No argument, or "list"**: list the components already present in `src/components/ui/`, and note that
  more are available from the shadcn registry (https://ui.shadcn.com/docs/components) if the user wants to
  browse.
- **"add <component>" (one or more names)**: for each requested component not already in
  `src/components/ui/`, run:

  ```
  npx shadcn@latest add <component> --yes
  ```

  from the project root. This is the real, official shadcn CLI — it reads `components.json` and writes
  directly into `src/components/ui/`, respecting this project's existing style/alias configuration. Do not
  hand-write a component that mimics shadcn's output; always go through the real CLI so the file matches
  upstream exactly and stays updatable the normal way.
- After adding, run `npx tsc -b` and `npx eslint .` to confirm the new component doesn't introduce type or
  lint errors, and skim the generated file once so you know what props/variants it exposes before wiring it
  into a page.
- If the user names a component that isn't in the shadcn registry, say so plainly rather than guessing or
  installing something unrelated.

## Out of scope

This skill only manages shadcn/ui component installation. For layout, spacing, color, typography, or
overall visual-craft decisions once a component is in place, use `/impeccable` — that's the project's
design-quality skill and already understands this app's design system (dark navy/purple identity, gamified
product register). This skill exists purely so "add the `<x>` shadcn component" has a direct, low-ceremony
shortcut instead of going through a general-purpose request.
