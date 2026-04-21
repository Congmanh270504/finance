---
name: grouped-table
description: Use the GroupedAccordionTable component from src/components/grouped-accordion-table.tsx to display data grouped into collapsible accordion sections. Use this skill when the user asks to display a list grouped by category, status, department, date, or any other grouping key — especially when the phrase "nhóm theo", "gom nhóm", "grouped table", or "accordion table" is used.
version: 1.0.0
---

# TNT Grouped Accordion Table Skill

This skill guides usage of the `GroupedAccordionTable` component — a TanStack React Table wrapped in shadcn Accordion sections. Each group renders as a collapsible card with a count badge.

Source: [src/components/grouped-accordion-table.tsx](../../../src/components/grouped-accordion-table.tsx)

## When to use

- The data must be displayed grouped (e.g., grouped by `phong`, `trangThai`, `loai`, `ngay`, `khachHang`)
- Each group should be independently collapsible
- Each row inside a group is clickable to open a detail panel or dialog

## Step-by-Step Process

### 1. Define the row type

Create or reuse the TypeScript type for the data rows. The row type **must** include an `id: string` field — the table uses it for active-row highlighting and row identity.

```ts
type MyRow = {
  id: string
  // ...other fields
}
```

### 2. Define columns with `ColumnDef<MyRow>`

Import `ColumnDef` from `@tanstack/react-table`. See column patterns in [patterns.md](patterns.md#columns).

### 3. Group data into `GroupedSection<MyRow>[]`

Transform the flat array into groups. Each group needs:
- `key` — unique string identifier (used as accordion value)
- `label` — display string shown in the accordion trigger
- `items` — subset of rows belonging to this group

See grouping utility patterns in [patterns.md](patterns.md#grouping).

### 4. Render the component

```tsx
import { GroupedAccordionTable } from "@/components/grouped-accordion-table"

<GroupedAccordionTable
  columns={columns}
  groups={groups}
  onRowClick={(row) => setSelected(row)}
  activeRowId={selected?.id}
/>
```

See full prop reference in [patterns.md](patterns.md#props).

## Output Format

Produce a complete `data-table.tsx` (or inline in the page) with:
1. Row type definition
2. `columns` array
3. Grouping logic (usually a `useMemo` or standalone function)
4. `GroupedAccordionTable` JSX
