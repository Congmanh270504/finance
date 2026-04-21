---
name: searchable-customer-picker
description: "Use when replacing Select with searchable dropdown input for customer/supplier fields in React forms (khach hang, nha cung cap, maKH picker), especially React Hook Form + Next.js UI."
---

# Searchable Customer Picker

## Goal

Replace a basic Select field with a search-first picker that:

- Lets users type to filter by code/name.
- Shows selected item as a compact row with clear action.
- Keeps the same submitted form value as before (for API compatibility).

## Use When

- User asks for "tim kiem thay vi select".
- Existing field contains many customers/suppliers.
- Current form already uses React Hook Form and should keep schema unchanged.

## Inputs Expected

- List options: `Array<{ id: string; maKH: string; tenKH: string }>`
- Current field value key: usually `maKH`.
- Edit mode flag (optional): `isEdit`.

## Required UI Behavior

1. When value exists: show selected `maKH - tenKH` in a bordered row.
2. When no value: show input with search icon and placeholder.
3. On focus or typing: open dropdown list.
4. Filter by both `maKH` and `tenKH` (case-insensitive).
5. Click option: set field value and close dropdown.
6. Optional clear button: clear selected value and allow searching again.
7. Close dropdown on blur with a short delay (~150ms) to allow click.

## React Hook Form Pattern

Use `useWatch` so the selected item reacts to form changes:

```tsx
const [dropdownOpen, setDropdownOpen] = React.useState(false);
const [search, setSearch] = React.useState("");
const selectedMaKH = useWatch({ control: form.control, name: "maKH" });

const selectedCustomer = React.useMemo(
    () => khachHangList.find((kh) => kh.maKH === selectedMaKH) || null,
    [khachHangList, selectedMaKH],
);

const filteredCustomers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return khachHangList;
    return khachHangList.filter(
        (kh) =>
            kh.maKH.toLowerCase().includes(q) ||
            kh.tenKH.toLowerCase().includes(q),
    );
}, [khachHangList, search]);
```

Inside `Controller`, update value with `field.onChange(customer.maKH)`.

## Styling Notes

- Reuse existing classes from app dialogs:
    - `border rounded-md px-3 h-9`
    - `bg-background`
    - `focus-within:ring-1 focus-within:ring-ring`
    - Dropdown: `absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md`

## Validation and Data Contract

- Keep schema field type unchanged (`z.string().min(1)` for `maKH`).
- Do not switch to storing `id` if API currently expects `maKH`.
- Keep existing submit payload keys unchanged.

## Accessibility and UX Checks

- Input placeholder must describe action (example: "Tim kiem khach hang...").
- Clear button is `type="button"`.
- List shows empty state text when no match found.

## Done Checklist

- [ ] Select replaced with searchable picker.
- [ ] Existing API payload still works without backend changes.
- [ ] Edit mode disables changing selection when required.
- [ ] No TypeScript errors in edited file.
