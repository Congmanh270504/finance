---
name: create-new-feature
description: Kỹ năng tạo module/tính năng mới theo chuẩn Feature-based và Phân quyền của dự án LEA.
---

# Kỹ Năng / AI Skill: create-new-feature

Bạn được trang bị kỹ năng này để đảm bảo mỗi khi User yêu cầu "Tạo chức năng/module quản lý [Tên]", bạn sẽ tuân thủ tuyệt đối cấu trúc thư mục của dự án thay vì tự ý code theo kiểu Next.js truyền thống.

## MỤC TIÊU CỐT LÕI

1. **Kiến trúc Feature-Based**: Mọi dòng code liên quan đến một tính năng phải được gom vào 1 folder duy nhất trong `src/features/[tên-tính-năng]/`.
2. **Server Actions First**: Không dùng API Route (`/api/`). Database Fetch / Mutate phải làm bằng `Server Actions` kết hợp Prisma.
3. **Authorization Guard**: Toàn bộ UI (Trang và Nút) bắt buộc phải bọc bằng `<PermissionGuard>`.

## CẤU TRÚC THƯ MỤC THỰC TẾ

```
src/
├── features/[tên-tính-năng]/
│   ├── action.ts          ← Server Actions + Prisma logic
│   ├── schema.ts          ← Zod validation schema + exported types
│   ├── types.ts           ← Nơi lưu trữ toàn bộ type dùng trong feature
│   └── components/
│       ├── [Tên]Client.tsx    ← "use client", UI chính (Table + Filters)
│       ├── columns.tsx         ← Column Definitions cho DataTable của feature
│       └── [Tên]Dialog.tsx    ← Dialog Thêm/Sửa (nếu cần)
│
├── app/(dashboard)/[tên-tính-năng]/
│   └── page.tsx           ← Server Component, fetch data, render Client
│
├── components/sidebar/
│   └── AppSidebar.tsx     ← Khai báo navGroups để thêm menu
│
└── lib/
    └── permissions.ts     ← Khai báo MODULES[]
```

## QUY TRÌNH THỰC HIỆN TRỌN GÓI (6 BƯỚC)

Bất cứ khi nào tạo tính năng mới (VD: "Quản lý Đơn Hàng" `dat-hang`), hãy làm ĐÚNG thứ tự sau:

### Bước 1: Khai báo Module (Phân Quyền)

Mở `src/lib/permissions.ts` và THÊM tính năng đó vào mảng `MODULES`.
Interface **bắt buộc** có đủ 5 field (không thiếu `category`):

```typescript
{ key: 'dat-hang', label: 'Đặt mua hàng', href: '/dat-hang', group: 'main', category: 'Hàng hóa/Kho' }
```

- `key`: kebab-case, trùng với tên thư mục feature
- `group`: `'main'` hoặc `'system'`
- `category`: Nhóm hiển thị ở màn hình Phân quyền (`'Tổng quan'`, `'CRM'`, `'Đào tạo'`, `'Hàng hóa/Kho'`, `'Nhân sự'`, `'Tài chính'`, `'Hệ thống'`)

_(Admin tự động có toàn quyền nhờ `buildAdminPermissions()` duyệt qua MODULES)_

### Bước 2: Dựng kho Feature

Tạo thư mục `src/features/[tên-tính-năng]` và chia file:

**schema.ts** – Zod Model + Type export:

```typescript
import { z } from 'zod';
export const datHangSchema = z.object({ ... });
export type DatHangInput = z.infer<typeof datHangSchema>;
```

**action.ts** – Server Actions:

- Dòng đầu tiên BẮT BUỘC là `"use server";`
- Import `prisma`, `revalidatePath`, `getCurrentUser`, `ActionResponse`
- Mỗi hàm mutation (create/update/delete) BẮT BUỘC gọi `revalidatePath('/dat-hang')` ở cuối (path là URL thực, KHÔNG có `/dashboard/` prefix)

```typescript
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";

export async function getDatHangs(params?: { ... }): Promise<ActionResponse> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Chưa đăng nhập", data: [] };
    // ...
}

export async function createDatHangAction(data: unknown): Promise<ActionResponse> {
    // validate → prisma.create → revalidatePath('/dat-hang')
}
```

**types.ts** – Type tập trung cho toàn feature:

- Tạo file `types.ts` trong `src/features/[tên-tính-năng]/` để lưu toàn bộ type/interface dùng chung trong feature đó.
- Khi cần dùng type ở `action.ts`, `schema.ts`, `components/*`, `page.tsx` phải import từ `@/features/[tên-tính-năng]/types`.
- Không khai báo type rải rác nhiều file nếu type đó được tái sử dụng.

```typescript
// src/features/dat-hang/types.ts
import { DonHang } from "@prisma/client";

export type DatHangItem = DonHang & {
    tongTien: number;
};
```

**components/[Tên]Client.tsx** – Giao diện Client chính:

- `"use client"` ở dòng đầu
- Nhận props data từ Server Page
- Filter/Search PHẢI dùng URL params (`useSearchParams` + `router.replace`)

**components/columns.tsx** – Column Definitions bắt buộc:

- Trong mỗi feature có data table, bắt buộc tạo `columns.tsx` để khai báo cột bằng `ColumnDef`.
- `columns` phải được truyền vào DataTable dùng lại của dự án tại `@/components/data-table`.
- Tất cả header của cột dữ liệu (trừ cột `actions`) phải hỗ trợ sort bằng `column.toggleSorting(...)` với `Button` + icon `ArrowUpDown`.
- Mỗi dòng dữ liệu bắt buộc có action `view`, `edit`, `delete` (thường đặt trong cột `actions`).
- Click vào row phải mở dialog `view` chi tiết (ngoại trừ click vào cụm action cần `stopPropagation`).
- Cột mã model (hoặc tên nếu không có mã) phải hiển thị gạch chân (`underline`) để tăng nhận diện và gợi ý có thể click xem chi tiết.

```tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Payment = {
    id: string;
    amount: number;
    status: "pending" | "processing" | "success" | "failed";
    email: string;
};

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: "actions",
        header: "Thao tác",
        cell: () => null, // thay bằng View/Edit/Delete actions theo chuẩn feature
    },
];
```

```tsx
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

<DataTable columns={columns} data={rows} />;
```

### Bước 3: Áp dụng Guard bảo vệ (Client Component)

Trong giao diện Client (`/components/`), bọc các thao tác:

```tsx
import { PermissionGuard } from "@/components/PermissionGuard";

// Bọc nút thao tác
<PermissionGuard moduleKey="dat-hang" level="add">
    <button>Thêm Mới</button>
</PermissionGuard>

<PermissionGuard moduleKey="dat-hang" level="edit">
    <button>Sửa</button>
</PermissionGuard>

<PermissionGuard moduleKey="dat-hang" level="delete">
    <button>Xóa</button>
</PermissionGuard>
```

Nếu cần check logic JS (ẩn/hiện phức tạp hơn):

```typescript
import { usePermissions } from "@/hooks/usePermissions";
const { canAdd, canEdit, canDelete } = usePermissions();
canAdd("dat-hang"); // → boolean
```

### Bước 4: Tạo App Route (Server Component)

Tạo `src/app/(dashboard)/[tên-tính-năng]/page.tsx`:

- TUYỆT ĐỐI không có `"use client"` – đây là Server Component
- Đọc `searchParams` (phải `await searchParams` vì Next.js 15 là async)
- Gọi Server Actions để fetch data trước khi render
- Bọc bằng `<PermissionGuard>` level `view` để chặn truy cập trực tiếp:

```tsx
import type { Metadata } from "next";
import { PermissionGuard } from "@/components/PermissionGuard";
import DatHangClient from "@/features/dat-hang/components/DatHangClient";
import { getDatHangs } from "@/features/dat-hang/action";

export const metadata: Metadata = { title: "Đặt hàng | LEA" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DatHangPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const result = await getDatHangs({ query: params.query, page });

    return (
        <PermissionGuard moduleKey="dat-hang" level="view" showNoAccess>
            <DatHangClient
                initialData={result.data ?? []}
                initialPagination={result.pagination}
                currentPage={page}
            />
        </PermissionGuard>
    );
}
```

### Bước 5: Cập nhật Sidebar

Mở `src/components/sidebar/AppSidebar.tsx` và thêm item vào group phù hợp trong `navGroups`:

```typescript
// Ví dụ thêm vào group "Hàng hóa & Kho vận"
{
    label: "Hàng hóa & Kho vận",
    icon: Package,
    items: [
        // ... items cũ ...
        { name: "Đặt mua hàng", href: "/dat-hang", icon: ShoppingCart, moduleKey: "dat-hang" },
    ],
},
```

- PHẢI có `moduleKey` để thuật toán ẩn/hiện tự động hoạt động (Staff không có quyền sẽ không thấy menu)
- Import icon từ `lucide-react` nếu chưa có

### Bước 6: Cập nhật Dashboard Grid

Mở `src/app/(dashboard)/dashboard/page.tsx` và thêm card vào `moduleGroups`:

```typescript
{
    name: "Đặt mua hàng",
    description: "Quản lý đơn đặt hàng từ nhà cung cấp",
    href: "/dat-hang",
    icon: ShoppingCart,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    available: true,
    moduleKey: "dat-hang",
}
```

---

## CHECKLIST HOÀN THÀNH

- [ ] `src/lib/permissions.ts` → MODULES có entry mới (đủ 5 field)
- [ ] `src/features/[tên]/schema.ts` → Zod schema + type export
- [ ] `src/features/[tên]/types.ts` → khai báo type dùng chung của feature
- [ ] `src/features/[tên]/action.ts` → `"use server"` + CRUD + `revalidatePath`
- [ ] `src/features/[tên]/components/columns.tsx` → `ColumnDef[]` + cột actions (view/edit/delete)
- [ ] `src/features/[tên]/components/[Tên]Client.tsx` → `"use client"` + PermissionGuard trên buttons
- [ ] `DataTable` của feature nhận `columns` từ `components/columns.tsx`
- [ ] Click row mở dialog `view`; cột mã/tên hiển thị `underline`
- [ ] `src/app/(dashboard)/[tên]/page.tsx` → Server Component + PermissionGuard view
- [ ] `src/components/sidebar/AppSidebar.tsx` → item mới với `moduleKey`
- [ ] `src/app/(dashboard)/dashboard/page.tsx` → card mới với `moduleKey`

---

## QUY TẮC TYPESCRIPT TYPES

**LUÔN LUÔN extend từ Prisma model** (`@prisma/client`) trước khi tự tạo type mới. Chỉ tạo type mới cho fields không tồn tại trong bất kỳ model nào.

```typescript
// ✅ ĐÚNG - Extend từ Prisma model
import { DanhMucHangHoa, GiaBan, GiaNhap } from "@prisma/client";

export type XNTKho = DanhMucHangHoa & {
    giaBan: GiaBan[];
    giaNhap: GiaNhap[];
    // Chỉ tạo type mới cho fields không có trong Prisma model
    tonCuoiKy: {
        soLuong: number;
        donGia: number;
        thanhTien: number;
    };
};

// ❌ SAI - Tự tạo toàn bộ type mới
export type XNTKho = {
    id: string;
    MA_HH: string;
    TEN_HH: string;
    // ... copy toàn bộ fields từ Prisma model
};
```

---

## CẤM KỴ TUYỆT ĐỐI

- CẤM dùng `src/components/[tên-tính-năng]/` để chứa logic riêng (chỉ dành cho component dùng chung toàn app)
- CẤM bỏ `<PermissionGuard>` trong bất kỳ trang/nút thao tác nào
- CẤM dùng API Route (`/api/`) thay vì Server Actions
- CẤM dùng `useState` để filter/search – phải gắn vào URL params
- CẤM quên `"use server"` ở đầu `action.ts`
- CẤM quên `await searchParams` trong page.tsx (Next.js 15: searchParams là Promise)
- CẀM dùng path `/dashboard/[tên]` trong `revalidatePath` – đường dẫn thực là `/[tên]`
- CẤM tự tạo type mới khi đã có Prisma model - phải dùng `type X = Model & { ... }`
