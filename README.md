# Tài liệu quy chuẩn cho Framework Next.js

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Thông tin đăng nhập](#-thông-tin-đăng-nhập)
- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Nguyên tắc Kiến trúc cốt lõi](#-nguyên-tắc-kiến-trúc-cốt-lõi)
  - [1. Feature-Based Architecture](#1-feature-based-architecture)
  - [2. Quản lý Trạng thái & Data Fetching](#2-quản-lý-trạng-thái--data-fetching)
  - [3. Thao tác Dữ liệu (Mutations)](#3-thao-tác-dữ-liệu-mutations)
- [Quy tắc đặt tên](#-quy-tắc-đặt-tên)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)

---

## 🎯 Giới thiệu

**Demo Framework** là hệ thống quản lý nhân sự được xây dựng theo kiến trúc **Enterprise-grade**, tuân thủ các best practices của Next.js 16+ App Router. Dự án được thiết kế với mục tiêu:

- ✅ **Scalable**: Dễ dàng mở rộng với kiến trúc Feature-based
- ✅ **Maintainable**: Mã nguồn rõ ràng, dễ bảo trì và onboard thành viên mới
- ✅ **Type-safe**: 100% TypeScript với Prisma ORM và Zod validation
- ✅ **Modern Stack**: Sử dụng công nghệ mới nhất của Next.js (Server Components, Server Actions)

---

## 💻 Cài đặt và chạy dự án

### Thiết lập môi trường

```bash
ren .env.example .env
```

### Chạy production (render/compile mượt hơn)

```bash
npm run build
npm run start
```

> **Lưu ý**: `npm run build` sẽ compile toàn bộ ứng dụng, sau đó `npm run start` chạy server ở chế độ production.

---

## 🔑 Thông tin đăng nhập

> **ADMIN**  
> **Tài khoản:** `admin`  
> **Mật khẩu:** `1`

---

## 🛠 Tech Stack

| Công nghệ           | Phiên bản | Mục đích sử dụng                 |
| ------------------- | --------- | -------------------------------- |
| **Next.js**         | 16.1.6    | Framework chính (App Router)     |
| **React**           | 19.2.3    | UI Library                       |
| **TypeScript**      | 5.x       | Type safety                      |
| **Prisma**          | 6.19      | ORM & Database Management        |
| **MongoDB**         | -         | Database                         |
| **NextAuth.js**     | 5.0       | Authentication                   |
| **React Hook Form** | 7.71.2    | Form state management            |
| **Zod**             | 4.3.6     | Schema validation                |
| **Shadcn/ui**       | Latest    | Component library (Tailwind CSS) |
| **TanStack Table**  | 8.21.3    | Data table                       |

---

## 📂 Cấu trúc thư mục

```
demo-framework/
├── prisma/
│   └── schema.prisma          # Database schema (MongoDB)
│
├── public/                    # Static assets
│
├── src/
│   ├── app/                   # ⚡ ROUTING LAYER - Chỉ định nghĩa routes & layouts
│   │   ├── (dashboard)/       # Route group (không ảnh hưởng URL)
│   │   │   ├── layout.tsx     # Dashboard layout wrapper
│   │   │   ├── page.tsx       # Trang chủ dashboard
│   │   │   └── employees/
│   │   │       └── page.tsx   # Server Component - Fetch data & render
│   │   ├── api/               # API routes (chỉ dùng cho NextAuth, webhooks, external APIs)
│   │   ├── login/
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # 🎨 SHARED COMPONENTS
│   │   ├── layouts/           # Layout components (Sidebar, Taskbar, Header...)
│   │   └── ui/                # Shadcn UI components (Button, Input, Dialog...)
│   │
│   ├── features/              # 🏗️ FEATURE LAYER - CORE BUSINESS LOGIC
│   │   ├── auth/              # Feature: Authentication
│   │   │   ├── action.ts      # Server Actions ("use server")
│   │   │   ├── schema.ts      # Zod schemas
│   │   │   ├── type.ts        # TypeScript types
│   │   │   └── components/    # Feature-specific components
│   │   │
│   │   ├── employees/         # Feature: Employee Management
│   │   │   ├── action.ts      # CRUD Server Actions
│   │   │   ├── schema.ts      # Validation schemas
│   │   │   ├── type.d.ts      # TypeScript definitions
│   │   │   └── components/    # EmployeeBoard, AddEmployeeSheet, columns...
│   │   │
│   │   └── dashboard/         # Feature: Dashboard
│   │       ├── constants.ts
│   │       └── components/
│   │
│   ├── hooks/                 # Custom React hooks (use-mobile.ts...)
│   ├── lib/                   # 🔧 UTILITIES
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── auth.config.ts     # Auth callbacks & config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Helper functions (cn, formatDate...)
│   │
│   ├── types/                 # Global TypeScript types
│   │   ├── next-auth.d.ts     # NextAuth type extensions
│   │   └── response.ts        # ResultResponse<T> pattern
│   │
│   └── config/                # App configuration
│       └── navigation.ts      # Navigation menu config
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### 📌 Giải thích các thư mục chính

| Thư mục              | Vai trò                  | Quy tắc                                                                        |
| -------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `src/app/`           | **Routing Layer**        | Chỉ định nghĩa routes, layouts, loading states. **KHÔNG** chứa business logic. |
| `src/features/`      | **Business Logic Layer** | Mỗi feature là 1 folder độc lập chứa: actions, schemas, types, components.     |
| `src/components/ui/` | **UI Primitives**        | Components tái sử dụng từ Shadcn UI. **KHÔNG TỰ CUSTOM CSS** nếu có sẵn.       |
| `src/lib/`           | **Core Utilities**       | Prisma, Auth, Helper functions.                                                |

---

## 🏛 Nguyên tắc Kiến trúc cốt lõi

### 1. Feature-Based Architecture

#### 📐 Nguyên tắc "Co-location" (Gắn kết cục bộ)

> **"Mọi thứ thuộc về một feature phải nằm cùng một chỗ"**

**✅ ĐÚNG:**

```
src/features/employees/
├── action.ts              # Server Actions cho Employee
├── schema.ts              # Zod schemas cho Employee
├── type.d.ts              # Types cho Employee
└── components/
    ├── EmployeeBoard.tsx
    ├── AddEmployeeSheet.tsx
    ├── columns.tsx
    └── ActionCell.tsx
```

**❌ SAI:**

```
src/
├── actions/
│   └── employee-action.ts      # ❌ Tách rời khỏi feature
├── schemas/
│   └── employee-schema.ts      # ❌ Tách rời khỏi feature
└── components/
    └── EmployeeBoard.tsx        # ❌ Tách rời khỏi feature
```

#### 🎯 Phân biệt src/app vs src/features

| Layer               | Mục đích                                                           | Ví dụ                                         |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| **`src/app/`**      | Định nghĩa routes, fetch data từ Server Actions, render UI         | `page.tsx`, `layout.tsx`                      |
| **`src/features/`** | Chứa toàn bộ logic nghiệp vụ: CRUD actions, validation, components | `action.ts`, `schema.ts`, `EmployeeBoard.tsx` |

**Ví dụ thực tế:**

📄 **`src/app/(dashboard)/employees/page.tsx`** (Server Component)

```tsx
import { getAllEmployees } from "@/features/employees/action";
import { EmployeeBoard } from "@/features/employees/components/EmployeeBoard";

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "TAT_CA";

  // ✅ Fetch data trực tiếp trong Server Component
  const result = await getAllEmployees();

  if (!result.success) {
    return <ErrorDisplay message={result.error} />;
  }

  // ✅ Filter data dựa trên URL params
  const filteredEmployees = result.data.filter((e) => {
    return currentStatus === "TAT_CA" || e.TRANG_THAI === currentStatus;
  });

  return <EmployeeBoard initialData={filteredEmployees} />;
}
```

---

### 2. Quản lý Trạng thái & Data Fetching

#### ⛔ QUY TẮC BẮT BUỘC

```diff
- ❌ KHÔNG dùng useEffect + fetch trong Client Components
- ❌ KHÔNG dùng useState để lưu search/filter state

+ ✅ DÙNG Server Components để fetch data
+ ✅ DÙNG URL searchParams cho filter/search state
+ ✅ DÙNG Server Actions cho mutations
```

#### 📖 Pattern 1: Fetch Data (Read Operations)

**Server Component** (page.tsx) fetch trực tiếp:

📄 **`src/app/(dashboard)/employees/page.tsx`**

```tsx
export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const result = await getAllEmployees(); // ✅ Gọi Server Action trực tiếp

  if (!result.success) {
    return <ErrorDisplay message={result.error} />;
  }

  return <EmployeeBoard initialData={result.data} />;
}
```

📄 **`src/features/employees/action.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "@/types/response";

export const getAllEmployees = async (): Promise<
  ResultResponse<NHAN_VIEN[]>
> => {
  try {
    const employees = await prisma.nHAN_VIEN.findMany({
      orderBy: { MA_NV: "desc" },
    });
    return createSuccessResponse(employees);
  } catch (error) {
    return createErrorResponse("Lỗi khi lấy danh sách nhân viên", error);
  }
};
```

#### 🔍 Pattern 2: Filter & Search (URL-Driven State)

> **NGUYÊN TẮC**: Filter/Search state **PHẢI** được lưu trong URL, KHÔNG dùng `useState`

**✅ ĐÚNG - URL-Driven State:**

📄 **`src/features/employees/components/EmployeeBoard.tsx`**

```tsx
"use client";

export const EmployeeBoard = ({
  initialData,
  currentStatus,
}: EmployeeBoardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ✅ Đọc state từ URL
  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "TAT_CA") {
      params.delete("status");
    } else {
      params.set("status", value); // ✅ Đẩy state lên URL
    }

    // ✅ Trigger re-render Server Component
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <StatusFilterBar
      currentValue={currentStatus}
      onSelect={handleStatusChange}
    />
  );
};
```

**❌ SAI - useState:**

```tsx
// ❌ TUYỆT ĐỐI KHÔNG LÀM NHƯ NÀY
const [filter, setFilter] = useState("TAT_CA"); // ❌ State cục bộ, mất khi refresh

const handleFilter = (value: string) => {
  setFilter(value); // ❌ Không đồng bộ với URL
  fetchData(value); // ❌ Client-side fetching
};
```

### 3. Thao tác Dữ liệu (Mutations)

#### ⚡ QUY TẮC BẮT BUỘC

```diff
- ❌ KHÔNG dùng API Routes (src/app/api) cho các thao tác nội bộ
+ ✅ BẮT BUỘC dùng Server Actions (file action.ts với "use server")
```

#### 🔄 Pattern: Create/Update/Delete với Server Actions

📄 **`src/features/employees/action.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const createEmployee = async (
  employeeData: EmployeeFormData,
): Promise<ResultResponse<NHAN_VIEN>> => {
  try {
    const newEmployee = await prisma.nHAN_VIEN.create({
      data: employeeData,
    });

    // ✅ Revalidate cache để UI tự động cập nhật
    revalidatePath("/dashboard/employees");

    return createSuccessResponse(newEmployee);
  } catch (error) {
    return createErrorResponse("Lỗi khi tạo nhân viên mới", error);
  }
};

export const deleteEmployee = async (
  id: string,
): Promise<ResultResponse<null>> => {
  try {
    await prisma.nHAN_VIEN.delete({ where: { MA_NV: id } });

    // ✅ Revalidate để danh sách tự động cập nhật
    revalidatePath("/dashboard/employees");

    return createSuccessResponse(null);
  } catch (error) {
    return createErrorResponse("Lỗi khi xóa nhân viên", error);
  }
};
```

#### 📦 ResultResponse Pattern

📄 **`src/types/response.ts`**

```typescript
export type ResultResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export const createSuccessResponse = <T>(data: T): ResultResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = <T>(
  error: string,
  details?: unknown,
): ResultResponse<T> => ({
  success: false,
  error,
  details,
});
```

#### 🎨 Gọi Server Action từ Client Component

📄 **`src/features/employees/components/AddEmployeeSheet.tsx`**

```tsx
"use client";

import { useTransition } from "react";
import { createEmployee } from "../action";
import { toast } from "sonner";

export function AddEmployeeSheet() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(createNhanVienSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: EmployeeFormData) => {
    startTransition(async () => {
      // ✅ Gọi Server Action
      const result = await createEmployee(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Tạo nhân viên thành công!");
      form.reset();
      // ✅ Không cần fetch lại data, revalidatePath đã xử lý
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </form>
    </Form>
  );
}
```

#### 🔥 Tại sao dùng Server Actions thay vì API Routes?

| Tiêu chí          | Server Actions                | API Routes                                      |
| ----------------- | ----------------------------- | ----------------------------------------------- |
| **Type Safety**   | ✅ Full TypeScript end-to-end | ⚠️ Cần define types riêng                       |
| **Code Location** | ✅ Cùng folder với feature    | ❌ Phải vào `src/app/api`                       |
| **Boilerplate**   | ✅ Ít code hơn                | ❌ Nhiều boilerplate (req, res, error handling) |
| **Performance**   | ✅ Optimized by Next.js       | ⚠️ Thêm 1 network hop                           |
| **Use Cases**     | ✅ Internal mutations         | ✅ External APIs, Webhooks                      |

---

## 🧭 Quy tắc đặt tên

> **Mục tiêu**: nhất quán, dễ tìm kiếm, đồng nhất giữa DB - Prisma - TypeScript - UI.

### 1) Database & Prisma Schema

- **Model (Collection)**: `SNAKE_CASE` viết hoa theo chuẩn hiện tại của dự án.
  - Ví dụ thực tế: `NHAN_VIEN`, `NGUOI_DUNG` trong [prisma/schema.prisma](prisma/schema.prisma)
- **Field**: `SNAKE_CASE` viết hoa.
  - Ví dụ: `MA_NV`, `HO_VA_TEN`, `TRANG_THAI`
- **Enum**: `SNAKE_CASE` viết hoa.
  - Ví dụ: `TRANG_THAI_LAM_VIEC`, `HINH_THUC_LAM_VIEC`
- **Giá trị enum**: `SNAKE_CASE` viết hoa.
  - Ví dụ: `DANG_LAM_VIEC`, `THU_VIEC`, `NGHI_VIEC`
- **Prisma Client**: giữ theo chuẩn tự sinh của Prisma.
  - Ví dụ: `prisma.nHAN_VIEN.findMany()` trong [src/features/employees/action.ts](src/features/employees/action.ts)

### 2) File & Folder naming

- **Feature folder**: `kebab-case` (tên nghiệp vụ).
  - Ví dụ: `employees`, `auth`, `dashboard`
- **Server Actions**: `action.ts`
- **Zod Schema**: `schema.ts`
- **Types**: `type.ts` hoặc `type.d.ts`
- **Feature components**: `PascalCase.tsx`
  - Ví dụ: `EmployeeBoard.tsx`, `AddEmployeeSheet.tsx`
- **Shared UI**: giữ theo chuẩn Shadcn (`kebab-case.tsx`)
  - Ví dụ: `input.tsx`, `dialog.tsx`, `data-table.tsx`
- **Route files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

### 3) TypeScript & React naming

- **Component**: `PascalCase`
  - Ví dụ: `EmployeeBoard`, `AddEmployeeButton`
- **Hook**: `camelCase` bắt đầu bằng `use`
  - Ví dụ: `useMobile`, `useTransition`
- **Type/Interface**: `PascalCase` + hậu tố rõ nghĩa
  - Ví dụ: `EmployeeFormData`, `EmployeesPageProps`
- **Server Action**: `camelCase` với động từ đầu câu
  - Ví dụ: `getAllEmployees`, `createEmployee`, `deleteEmployee`

---
