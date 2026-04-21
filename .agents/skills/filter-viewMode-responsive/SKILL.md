---
name: Filter + view mode responsive
description: Add responsive filter toolbars and table/card view-mode toggles for list pages.
---

# Skill: Filter + view mode responsive

Use this skill when adding filters to list pages and supporting a mobile-friendly view mode toggle (table vs card).

## Goals

1. Keep filters consistent with existing URL param workflow.
2. On mobile, provide a view mode tab switch between table and card layouts.
3. Avoid duplicate query logic; all filters should update URL params and reset paging.

## Rules

- Filters must use shared UI components (`FloatingSelect`, `SearchInput`) if they exist in the project.
- Filter changes must update URL params and remove `page` to reset pagination.
- Mobile toolbar should include view mode tabs (table/card) plus a filter toggle button.
- On desktop, filters should be visible inline; view mode tabs can remain mobile-only.
- Card view should be a compact summary (title + key fields + actions) and support row actions.

## Implementation checklist

1. Add `viewMode` state with default `table`.
2. Add mobile view mode toggle (table/card) using `LayoutList` and `LayoutGrid` icons.
3. Render table when `viewMode === "table"`.
4. Render cards when `viewMode === "card"`:
    - Use `Card` components.
    - Show key fields.
    - Provide view/edit/delete actions and stop event propagation.
5. Wire filters to URL params:
    - Use `useSearchParams`, `usePathname`, `useRouter`.
    - Update param, remove `page`, and call `router.replace`.

## Example pattern (mobile toolbar)

```tsx
<div className="md:hidden flex justify-between gap-2 w-full">
    <div className="flex border border-border rounded-lg bg-muted/40 p-1 gap-1">
        <Button
            onClick={() => setViewMode("table")}
            className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all",
                viewMode === "table"
                    ? "bg-background text-primary shadow-sm"
                    : "bg-transparent text-muted-foreground hover:bg-muted",
            )}
            variant="ghost"
            size="sm"
        >
            <LayoutList className="w-3.5 h-3.5" />
        </Button>
        <Button
            onClick={() => setViewMode("card")}
            className={cn(
                "flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all",
                viewMode === "card"
                    ? "bg-background text-primary shadow-sm"
                    : "bg-transparent text-muted-foreground hover:bg-muted",
            )}
            variant="ghost"
            size="sm"
        >
            <LayoutGrid className="w-3.5 h-3.5" />
        </Button>
    </div>

    <Button
        onClick={() => setIsFilterSheetOpen(!isFilterSheetOpen)}
        className={cn(
            "border border-border rounded-lg transition-colors shadow-sm p-4.5",
            isFilterSheetOpen
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted text-muted-foreground",
        )}
        title="Bộ lọc"
    >
        <SlidersHorizontal className="w-4 h-4" />
    </Button>
</div>
```
