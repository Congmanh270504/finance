# TNT Project — Dialog & Tabs Patterns

## Dialog Structure

### Base shell (always start with this)

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  // add entity prop for edit mode: data?: EntityType | null
}

export function EntityDialog({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-lg p-0 gap-0">
        {/* HEADER — choose gradient color below */}
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-lg">
          <DialogTitle className="text-3xl font-bold text-white">
            Tiêu đề
          </DialogTitle>
          <DialogDescription className="text-white text-base">
            Mô tả ngắn
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-4 px-6 pt-6 pb-4">
          {/* form fields go here */}
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 pb-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Header Gradient Palette

Pick one based on feature domain. Always: `px-6 py-5 rounded-t-lg`

```
Blue/Indigo    → from-blue-600 to-indigo-600          (default/inventory)
Emerald/Teal   → from-emerald-500 to-teal-500          (payments/finance)
Purple/Pink    → from-purple-400 to-pink-400            (categories/groups)
Amber/Orange   → from-amber-400 via-orange-400 to-yellow-400  (alerts/stock)
Cyan/Blue/Ind  → from-cyan-400 via-blue-400 to-indigo-400     (reports)
Violet/Fuchsia → from-violet-500 to-fuchsia-500         (customers)
Indigo solid   → from-indigo-400 to-indigo-500          (settings)
```

### Light header variant (sky/indigo gradient TEXT, not background)

```tsx
<DialogHeader className="bg-gradient-to-r from-sky-50 to-indigo-50 p-4 rounded-t-lg pl-5">
  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
    Tiêu đề
  </DialogTitle>
  <DialogDescription className="text-sky-600/80">
    Mô tả
  </DialogDescription>
</DialogHeader>
```

---

## DialogContent Size Variants

```
Standard form:     "sm:max-w-[700px] rounded-lg p-0 gap-0"
Wide form:         "max-w-3xl overflow-y-auto no-scrollbar p-0 gap-0 rounded-lg"
Large with table:  "max-w-5xl max-h-[85vh] flex flex-col rounded-lg p-0 gap-0"
Full screen data:  "sm:max-w-[1260px] max-h-[95dvh] p-0 gap-0 overflow-hidden flex flex-col"
```

For scrollable content inside a flex dialog:
```tsx
<div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-4">
  {/* content */}
</div>
```

---

## Form Fields

### Standard field pattern

```tsx
<div className="space-y-2">
  <Label htmlFor="tenHang">Tên hàng <span className="text-red-500">*</span></Label>
  <Input
    id="tenHang"
    placeholder="Nhập tên hàng"
    {...register("tenHang")}
    aria-invalid={!!errors.tenHang}
  />
  {errors.tenHang && (
    <p className="text-sm text-destructive">{errors.tenHang.message}</p>
  )}
</div>
```

### Two-column grid

```tsx
<div className="grid grid-cols-2 gap-4">
  {/* fields */}
</div>
```

### Three-column grid

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* fields */}
</div>
```

---

## Tabs

### Inside a dialog body

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="thong-tin">
  <TabsList className="mb-4">
    <TabsTrigger
      value="thong-tin"
      className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm 
                 rounded-b-none border-b-2 border-transparent 
                 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-700"
    >
      Thông tin
    </TabsTrigger>
    <TabsTrigger
      value="lich-su"
      className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm 
                 rounded-b-none border-b-2 border-transparent 
                 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-700"
    >
      Lịch sử
    </TabsTrigger>
  </TabsList>

  <TabsContent value="thong-tin">
    {/* content */}
  </TabsContent>
  <TabsContent value="lich-su">
    {/* content */}
  </TabsContent>
</Tabs>
```

### Match tab accent to header gradient

For non-blue headers, swap `border-b-blue-500 text-blue-700` to match:
- Emerald: `border-b-emerald-500 text-emerald-700`
- Purple: `border-b-purple-500 text-purple-700`
- Violet: `border-b-violet-500 text-violet-700`

---

## Table Inside Dialog

```tsx
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"

<div className="rounded-md border border-gray-200">
  <Table>
    <TableHeader>
      <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <TableHead className="font-semibold text-gray-700 text-center">Cột 1</TableHead>
        <TableHead className="font-semibold text-gray-700 text-center">Cột 2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item, index) => (
        <TableRow key={index} className="border-gray-100 odd:bg-white even:bg-blue-50">
          <TableCell className="text-gray-900 text-center">{item.col1}</TableCell>
          <TableCell className="text-gray-900 text-center">{item.col2}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

For violet-themed dialogs swap even row: `even:bg-violet-50/30`

---

## Zod Schema + React Hook Form

```tsx
const schema = z.object({
  tenHang: z.string().min(1, "Vui lòng nhập tên hàng"),
  soLuong: z.coerce.number().min(0, "Số lượng không hợp lệ"),
  // add fields...
})
type FormData = z.infer<typeof schema>

// Inside component:
const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { tenHang: "", soLuong: 0 },
})

const onSubmit = async (data: FormData) => {
  setLoading(true)
  try {
    const res = await fetch("/api/entity/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    reset()
    onOpenChange(false)
    onSuccess?.()
  } catch {
    // handle error
  } finally {
    setLoading(false)
  }
}
```

---

## Section Dividers Inside Dialog Body

```tsx
<div className="border-t border-gray-100 pt-4 mt-2">
  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
    Tiêu đề section
  </h3>
  {/* section content */}
</div>
```

---

## Badges & Status Indicators

```tsx
import { Badge } from "@/components/ui/badge"

// Success/active
<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Hoạt động</Badge>
// Warning
<Badge className="bg-amber-100 text-amber-700 border-amber-200">Chờ duyệt</Badge>
// Destructive
<Badge variant="destructive">Đã hủy</Badge>
// Neutral
<Badge variant="outline">Tham khảo</Badge>
```

---

## Key Import Paths

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
```
