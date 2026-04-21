---
name: tnt-dialog
description: Create dialogs and tabs following the TNT project's design system. Use this skill when the user asks to create a dialog, modal, tab, form dialog, or any UI component using shadcn Dialog or Tabs in this Vietnamese enterprise management system. Also use when the user says "tạo dialog", "tạo tab", "tạo form", or "thêm dialog".
version: 1.0.0
---

# TNT Dialog & Tabs Skill

This skill guides creation of dialogs and tabs that match the TNT project's design system exactly. All components must follow the patterns documented in [patterns.md](patterns.md).

## Goal

When the user asks to create a dialog or tab component, produce code that:
1. Uses the correct gradient header matching the feature's color theme
2. Follows the exact className structure used project-wide
3. Integrates React Hook Form + Zod for forms
4. Matches input, label, and button styling from the project's shadcn primitives

## Step-by-Step Process

### 1. Determine the color theme

Ask or infer which color gradient the dialog header should use based on the feature domain:
- **Blue/Indigo** (`from-blue-600 to-indigo-600`) — general/neutral features, inventory
- **Emerald/Teal** (`from-emerald-500 to-teal-500`) — financial, payments, success states
- **Purple/Pink** (`from-purple-400 to-pink-400`) — categories, groups, classification
- **Amber/Orange** (`from-amber-400 via-orange-400 to-yellow-400`) — warnings, stock alerts
- **Cyan/Blue** (`from-cyan-400 via-blue-400 to-indigo-400`) — reports, analytics
- **Violet/Fuchsia** (`from-violet-500 to-fuchsia-500`) — customers, contacts
- **Sky/Indigo** (gradient text) — light-themed headers (text uses `bg-clip-text text-transparent`)

### 2. Determine dialog size

- **Standard form** (`sm:max-w-[700px]`) — single entity create/edit with ~5 fields
- **Wide form** (`max-w-3xl`) — forms with sections or moderate table
- **Large** (`max-w-5xl max-h-[85vh] flex flex-col`) — dialogs with tables or complex layouts
- **XL** (`sm:max-w-[1260px] max-h-[95dvh] flex flex-col`) — full data management dialogs

### 3. Determine if tabs are needed

Use tabs when a dialog covers multiple logical sections (e.g., thông tin + lịch sử, or multiple entity types). See tab pattern in [patterns.md](patterns.md#tabs).

### 4. Generate the code

Follow the templates in [patterns.md](patterns.md). Always:
- Import from the correct paths (`@/components/ui/...`)
- Use `React Hook Form` + `Zod` for all form dialogs
- Include `getServerSession` check reminders for API routes
- Add `no-scrollbar` class on scrollable DialogContent
- Use `p-0 gap-0` on DialogContent to control padding manually

## Output Format

Produce a complete `.tsx` file ready to drop into `src/app/(main)/<feature>/` or `src/components/`. Include all imports at the top. If a matching API route is also needed, mention its structure.
