---
name: edited-table
description: Build editable data tables with TanStack Table (react-table) and shadcn/ui Table primitives. Use when Codex needs to add inline cell editing, row editing, typed inputs, save/cancel actions, or reusable editable table abstractions in React or Next.js codebases, especially when the UI should use shadcn table markup instead of a bundled grid component.
---

# Edited Table

## Overview

Build a reusable editable table by combining TanStack Table state/modeling with shadcn/ui table markup and form controls. Follow the referenced pattern of rendering editable cells through column definitions and updating row state through table `meta`.

## Quick Start

1. Identify whether the request needs cell editing, full-row edit mode, or both.
2. Keep data state in the table owner component.
3. Define TanStack columns with `cell` renderers that switch between read and edit UI.
4. Expose row mutation helpers through `table.options.meta`, especially `updateData`.
5. Render with shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell`.
6. Use shadcn inputs like `Input`, `Select`, `Checkbox`, or `Textarea` inside editable cells.
7. Add explicit save and cancel behavior when edits should not commit on blur.

## Core Pattern

Use TanStack Table as the headless engine and let shadcn handle presentation. Keep the table generic:

- Store `data` in React state in the table wrapper component.
- Pass `data` and `columns` to `useReactTable`.
- Define `meta.updateData(rowIndex, columnId, value)` to patch the source row.
- In editable cells, initialize local input state from `getValue()`.
- Commit on `blur`, Enter, or an explicit save button depending on UX needs.
- Sync local cell state when external data changes.
- Prefer stable row IDs if rows can be sorted, paginated, inserted, or deleted.

## Focus Stability Rules

Prevent input/select losing focus while typing:

- Keep `columns` memoized with `useMemo` and only include stable dependencies.
- Do not create editor components/functions inline that change identity on each keystroke.
- Store draft/editing state in the table owner component, then pass handlers via `table.options.meta`.
- Provide `getRowId` with a stable row key (for example `row.ID`) so rows are not remounted during edits.
- Avoid replacing the entire `data` array on every character unless required; patch only the target draft cell.
- In row-edit mode, prefer reading current editable value from `meta.drafts[rowId]` to keep editor state stable.

## Cell Editing Workflow

For simple inline editing:

- Create a reusable editable cell component that receives the TanStack cell context.
- Read the current value with `getValue()`.
- Infer or read the input type from `column.columnDef.meta`, for example `text`, `number`, `date`, or `select`.
- Keep a local `value` state so typing feels responsive.
- Call `table.options.meta?.updateData(row.index, column.id, nextValue)` when committing.

For dynamic inputs:

- Put input configuration on the column definition, not in ad hoc `if` statements across the JSX.
- Use column metadata such as `meta.editor`, `meta.options`, `meta.placeholder`, and `meta.readOnly`.
- Prefer narrow editor components per type when logic diverges.

## Row Editing Workflow

When the request is "edit a row then save" rather than "edit every cell immediately":

- Track `editingRowId` or a `draftRows` map in the parent.
- Render plain text for non-editing rows and controls for the active row.
- Keep row drafts separate from committed data so cancel is trivial.
- Add an actions column with `Edit`, `Save`, and `Cancel` buttons.
- Validate draft values before persisting.
- If persistence is remote, optimistically update local rows only when the product already uses optimistic UX.

## shadcn Integration Rules

- Use shadcn table primitives for structure, not raw HTML, unless the codebase already uses raw table tags.
- Match existing project components for controls and toasts.
- Keep styling minimal and composable with Tailwind utility classes.
- Use sticky action columns and muted placeholders only if the surrounding design system already supports them.
- For editors, use standard shadcn controls (`Input`, `Select`, `Checkbox`, `Textarea`) by default.
- When searchable selection is required, use [search-select.tsx](src/components/floating-input/search-select.tsx).
- Do not use `floating-input` editor components inside edited-table cells unless the user explicitly requests that style.

## Implementation Notes

- Prefer `ColumnDef<TData>` with strongly typed row models.
- Add `meta` typing via TanStack module augmentation when a shared `updateData` contract is needed.
- Avoid mutating rows in place; always return copied objects.
- If the table supports sorting or filtering, use `row.original` IDs for persistence, not `row.index`.
- For server-backed pages, keep fetches and saves aligned with the host app architecture.

## Reference

Read [references/editable-table-pattern.md](references/editable-table-pattern.md) when you need the underlying article pattern, a suggested component split, or example metadata fields for dynamic editors.

## Deliverables

When using this skill, aim to produce:

- One reusable table wrapper or feature-local table component.
- One clear column definition module when the codebase separates table structure from rendering.
- Strongly typed editor metadata.
- Save/cancel behavior that matches the product request.
- Brief verification notes covering edit, cancel, and persistence behavior.
