# TNT Project — GroupedAccordionTable Patterns

## Props

```ts
interface GroupedAccordionTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]   // TanStack column definitions
  groups: GroupedSection<TData>[]        // grouped data (see below)
  onRowClick?: (rowData: TData) => void  // optional row click handler
  activeRowId?: string | null            // highlights matching row (uses row.id)
  emptyMessage?: string                  // shown when groups is empty — default "Không có dữ liệu"
  tableHeaderClassName?: string          // default "bg-gradient-to-r from-blue-50 to-yellow-50"
  rowClassName?: string                  // default "border-gray-100 odd:bg-white even:bg-blue-50"
  activeRowClassName?: string            // default "bg-blue-100/70"
}

export type GroupedSection<TData> = {
  key: string    // unique id used as accordion value
  label: string  // display label in accordion trigger
  items: TData[] // rows belonging to this group
}
```

> **Row id requirement**: The component reads `(row.original as { id?: string }).id` for active-row detection. Your row type **must** include `id: string`.

---

## Columns

```tsx
import { ColumnDef } from "@tanstack/react-table"

type DonHangRow = {
  id: string
  maDon: string
  tenKhach: string
  tongTien: number
  trangThai: string
}

const columns: ColumnDef<DonHangRow>[] = [
  {
    accessorKey: "maDon",
    header: "Mã đơn",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-blue-700">{row.original.maDon}</span>
    ),
  },
  {
    accessorKey: "tenKhach",
    header: "Khách hàng",
  },
  {
    accessorKey: "tongTien",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <span className="font-semibold text-emerald-700">
        {row.original.tongTien.toLocaleString("vi-VN")}đ
      </span>
    ),
  },
  {
    accessorKey: "trangThai",
    header: "Trạng thái",
    cell: ({ row }) => <TrangThaiBadge value={row.original.trangThai} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div data-no-row-open="true">
        {/* Dropdown menu or action buttons */}
        {/* Use data-no-row-open="true" to prevent row click from firing */}
      </div>
    ),
  },
]
```

### Preventing row-click on interactive cells

Wrap action cells in a `div` with `data-no-row-open="true"`. The component also ignores clicks on `button`, `input`, `a`, `svg`, `[role='checkbox']`, `[role='menuitem']`, and `[data-radix-collection-item]` automatically.

---

## Grouping

### Group by a string field

```ts
import { useMemo } from "react"
import { GroupedSection } from "@/components/grouped-accordion-table"

const groups = useMemo<GroupedSection<DonHangRow>[]>(() => {
  const map = new Map<string, DonHangRow[]>()
  for (const row of data) {
    const key = row.trangThai
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key,          // or map to a display label
    items,
  }))
}, [data])
```

### Group by a lookup label

```ts
const TRANG_THAI_LABEL: Record<string, string> = {
  CHO_DUYET: "Chờ duyệt",
  DA_DUYET: "Đã duyệt",
  DA_HUY:   "Đã hủy",
}

const groups = useMemo<GroupedSection<DonHangRow>[]>(() => {
  const map = new Map<string, DonHangRow[]>()
  for (const row of data) {
    const key = row.trangThai
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: TRANG_THAI_LABEL[key] ?? key,
    items,
  }))
}, [data])
```

### Group by date (ngày)

```ts
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const groups = useMemo<GroupedSection<PhieuRow>[]>(() => {
  const map = new Map<string, PhieuRow[]>()
  for (const row of data) {
    const key = format(new Date(row.ngayTao), "yyyy-MM-dd")
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))  // newest first
    .map(([key, items]) => ({
      key,
      label: format(new Date(key), "EEEE, dd/MM/yyyy", { locale: vi }),
      items,
    }))
}, [data])
```

### Group by phòng/bộ phận

```ts
const groups = useMemo<GroupedSection<NhanVienRow>[]>(() => {
  const map = new Map<string, NhanVienRow[]>()
  for (const row of data) {
    const key = row.phong ?? "Khác"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key,
    items,
  }))
}, [data])
```

---

## Full Example

```tsx
"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { GroupedAccordionTable, GroupedSection } from "@/components/grouped-accordion-table"

type DonHangRow = {
  id: string
  maDon: string
  tenKhach: string
  tongTien: number
  trangThai: string
}

const LABEL: Record<string, string> = {
  CHO_DUYET: "Chờ duyệt",
  DA_DUYET:  "Đã duyệt",
  DA_HUY:    "Đã hủy",
}

const columns: ColumnDef<DonHangRow>[] = [
  { accessorKey: "maDon",    header: "Mã đơn" },
  { accessorKey: "tenKhach", header: "Khách hàng" },
  {
    accessorKey: "tongTien",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <span className="font-semibold text-emerald-700">
        {row.original.tongTien.toLocaleString("vi-VN")}đ
      </span>
    ),
  },
]

interface Props {
  data: DonHangRow[]
}

export function DonHangGroupedTable({ data }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const groups = useMemo<GroupedSection<DonHangRow>[]>(() => {
    const map = new Map<string, DonHangRow[]>()
    for (const row of data) {
      const key = row.trangThai
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: LABEL[key] ?? key,
      items,
    }))
  }, [data])

  return (
    <GroupedAccordionTable
      columns={columns}
      groups={groups}
      onRowClick={(row) => setSelectedId(row.id)}
      activeRowId={selectedId}
    />
  )
}
```

---

## Custom Styling

Override defaults by passing className props:

```tsx
<GroupedAccordionTable
  columns={columns}
  groups={groups}
  // Emerald-themed header for finance pages
  tableHeaderClassName="bg-gradient-to-r from-emerald-50 to-teal-50"
  rowClassName="border-gray-100 odd:bg-white even:bg-emerald-50"
  activeRowClassName="bg-emerald-100/70"
/>
```

Theme presets:

| Theme       | `tableHeaderClassName`                          | `even:bg-*`        | `activeRowClassName`    |
|-------------|--------------------------------------------------|--------------------|--------------------------|
| Blue (default) | `from-blue-50 to-yellow-50`                 | `even:bg-blue-50`  | `bg-blue-100/70`         |
| Emerald     | `from-emerald-50 to-teal-50`                    | `even:bg-emerald-50` | `bg-emerald-100/70`    |
| Violet      | `from-violet-50 to-purple-50`                   | `even:bg-violet-50/30` | `bg-violet-100/70`   |
| Amber       | `from-amber-50 to-orange-50`                    | `even:bg-amber-50` | `bg-amber-100/70`        |

---

## Import

```tsx
import {
  GroupedAccordionTable,
  GroupedSection,          // re-export the type
} from "@/components/grouped-accordion-table"
```
