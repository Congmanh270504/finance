# Finance UI — Tài liệu tham chiếu code

> **Mục đích:** Tài liệu này ghi lại cấu trúc, kiểu dữ liệu và quy ước thiết kế của module `app/(finance)/`. Dùng để tra cứu và hiểu codebase — KHÔNG dùng để tái tạo lại từ đầu.

---

## Quy tắc bắt buộc cho AI

> **ĐỌC KỸ TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ**

1. **Phải đọc code gốc trước.** Trước khi chỉnh sửa bất kỳ file nào trong `app/(finance)/` hoặc `components/finance/`, bắt buộc phải dùng tool `Read` để đọc file đó trực tiếp từ codebase. Không được viết code dựa chỉ vào tài liệu này — tài liệu có thể đã lỗi thời.

2. **Không được tạo lại từ đầu.** Tuyệt đối không xóa và viết lại các file UI đã tồn tại. Chỉ được chỉnh sửa (Edit) những gì cần thay đổi.

3. **Phải có sự cho phép của owner trước khi thực hiện.** Với mọi thay đổi đến module finance — dù nhỏ — phải mô tả rõ ý định và chờ owner xác nhận đồng ý trước khi chạy bất kỳ tool Edit/Write nào.

4. **Thứ tự làm việc bắt buộc:**
   - Bước 1: Đọc file thực tế trong repo (`Read`)
   - Bước 2: Trình bày kế hoạch thay đổi cho owner
   - Bước 3: Chờ owner gõ xác nhận ("ok", "đồng ý", "yes", v.v.)
   - Bước 4: Mới được thực hiện thay đổi

---

## Stack & Dependencies

```
Next.js 15 (App Router, Server Components)
TypeScript
Tailwind CSS v4 (oklch color space)
shadcn/ui components: Card, Badge, Button, Input, Select, Sheet, Sidebar, Separator, Tooltip, Skeleton
Lucide React (icons)
Recharts (biểu đồ)
Sonner (toast notifications)
```

---

## Cấu trúc thư mục

```
app/(finance)/
├── layout.tsx
├── error.tsx
├── _api/
│   ├── config.ts
│   └── server-data.ts
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx
├── history/
│   ├── page.tsx
│   └── loading.tsx
├── members/
│   ├── page.tsx
│   └── loading.tsx
├── insights/
│   ├── page.tsx
│   └── loading.tsx
└── new-expense/
    ├── page.tsx
    └── loading.tsx

components/finance/
├── layout/
│   ├── FinanceSidebarWrapper.tsx
│   ├── DesktopSidebar.tsx
│   ├── DesktopHeader.tsx
│   ├── MobileHeader.tsx
│   └── BottomNav.tsx
├── dashboard/
│   └── DashboardClient.tsx
├── history/
│   └── ExpenseHistoryClient.tsx
├── members/
│   ├── MembersClient.tsx
│   └── VietQrSheet.tsx
├── insights/
│   └── InsightsClient.tsx
├── new-expense/
│   └── NewExpenseForm.tsx
└── shared/
    ├── MemberAvatar.tsx
    ├── EmptyState.tsx
    └── expense-icon.tsx

types/finance/v1/
└── dto.ts

lib/finance/
└── mock-fixtures.ts
```

---

## CSS — globals.css (Finance-related classes)

Thêm vào `app/globals.css`. Dùng Tailwind v4 + oklch color space.

### Color tokens (`:root` & `.dark`)

```css
:root {
  --primary: oklch(0.5 0.22 170); /* cyan-teal */
  --primary-foreground: oklch(0.98 0 0);
  --background: oklch(0.985 0.002 260);
  --foreground: oklch(0.12 0.015 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.12 0.015 260);
  --muted: oklch(0.96 0.008 260);
  --muted-foreground: oklch(0.48 0.01 260);
  --border: oklch(0.92 0.008 260);
  --chart-1: oklch(0.5 0.22 170);
  --chart-2: oklch(0.5 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.728 0.189 84.429);
  --chart-5: oklch(0.669 0.188 70.08);
  --sidebar: var(--card);
  --sidebar-foreground: var(--card-foreground);
  --sidebar-primary: var(--primary);
  --sidebar-border: var(--border);
  --glow-color: oklch(0.5 0.22 170 / 0.15);
  --glow-color-strong: oklch(0.5 0.22 170 / 0.25);
}

.dark {
  --primary: oklch(0.72 0.2 170);
  --background: oklch(0.06 0.015 260);
  --card: oklch(0.1 0.015 260);
  --muted: oklch(0.16 0.015 260);
  --border: oklch(0.2 0.015 260);
  --glow-color: oklch(0.72 0.2 170 / 0.12);
  --glow-color-strong: oklch(0.72 0.2 170 / 0.22);
}
```

### Utility classes

```css
/* Scanlines overlay (dùng trên root layout) */
.scanlines::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    oklch(0 0 0 / 0.015) 3px,
    oklch(0 0 0 / 0.015) 6px
  );
  pointer-events: none;
  z-index: 100;
}

/* Glass morphism */
.glass {
  background: oklch(from var(--card) l c h / 0.6);
  backdrop-filter: blur(12px) saturate(1.5);
  -webkit-backdrop-filter: blur(12px) saturate(1.5);
}
.glass-strong {
  background: oklch(from var(--card) l c h / 0.8);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
}

/* Hover lift effect on cards */
.hover-lift {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px -8px oklch(0 0 0 / 0.12);
}
.dark .hover-lift:hover {
  box-shadow: 0 12px 40px -8px oklch(0 0 0 / 0.4);
}

/* Border gradient glow on hover */
.border-glow {
  position: relative;
}
.border-glow::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    transparent 40%,
    transparent 60%,
    var(--primary) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}
.border-glow:hover::before {
  opacity: 0.5;
}

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, var(--primary), oklch(0.65 0.18 200));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animated underline */
.underline-animate {
  position: relative;
}
.underline-animate::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.underline-animate:hover::after {
  width: 100%;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--glow-color);
  }
  50% {
    box-shadow: 0 0 20px 4px var(--glow-color);
  }
}
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-fade-in-down {
  animation: fade-in-down 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-fade-in {
  animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-pulse-glow {
  animation: pulse-glow 2.5s ease-in-out infinite;
}
.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    var(--glow-color),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

/* Stagger delays */
.stagger-1 {
  animation-delay: 0.1s;
}
.stagger-2 {
  animation-delay: 0.2s;
}
.stagger-3 {
  animation-delay: 0.3s;
}
.stagger-4 {
  animation-delay: 0.4s;
}
.stagger-5 {
  animation-delay: 0.5s;
}
.stagger-6 {
  animation-delay: 0.6s;
}
.stagger-7 {
  animation-delay: 0.7s;
}
.stagger-8 {
  animation-delay: 0.8s;
}
```

---

## TypeScript Types — `types/finance/v1/dto.ts`

```typescript
export type ApiVersionV1 = "v1";
export type ShareStrategyV1 = "EQUAL" | "CUSTOM";
export type InsightBucketV1 = "day" | "week" | "month";

export type ExpenseShareInputV1 = { memberId: string; amount: number };

export type CreateExpenseV1Request = {
  groupId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  participantMemberIds: string[];
  shareStrategy?: ShareStrategyV1;
  shares?: ExpenseShareInputV1[];
  notes?: string;
  occurredAt?: string;
};

export type ExpenseShareV1 = {
  memberId: string;
  memberName: string;
  amount: number;
};

export type ExpenseHistoryItemV1 = {
  expenseId: string;
  groupId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  paidByMemberName: string;
  shareStrategy: ShareStrategyV1;
  shares: ExpenseShareV1[];
  notes?: string | null;
  occurredAt: string;
  createdAt: string;
};

export type BalanceLedgerEntryV1 = {
  ledgerId: string;
  groupId: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  sourceExpenseId?: string | null;
  updatedAt: string;
};

export type CreateExpenseV1Response = {
  expense: ExpenseHistoryItemV1;
  ledgerUpdates: BalanceLedgerEntryV1[];
};

export type ExpenseHistoryResponseV1 = {
  items: ExpenseHistoryItemV1[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type MemberBalanceV1 = {
  memberId: string;
  memberName: string;
  netAmount: number;
};

export type BalancesSummaryResponseV1 = {
  groupId: string;
  generatedAt: string;
  totalOutstanding: number;
  ledger: BalanceLedgerEntryV1[];
  memberBalances: MemberBalanceV1[];
};

export type InsightPointV1 = {
  bucketStart: string;
  totalAmount: number;
  expenseCount: number;
};
export type TopPayerInsightV1 = {
  memberId: string;
  memberName: string;
  totalAmount: number;
};

export type InsightsChartsResponseV1 = {
  groupId: string;
  fromDate: string;
  toDate: string;
  bucket: InsightBucketV1;
  totalAmount: number;
  expenseCount: number;
  trend: InsightPointV1[];
  topPayers: TopPayerInsightV1[];
};

export type GenerateVietQrRequestV1 = {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount: number;
  transferNote: string;
};

export type GenerateVietQrResponseV1 = {
  payload: string;
  qrImageUrl: string;
  amount: number;
  transferNote: string;
  bankBin: string;
  accountNumber: string;
};

export type FinanceV1Fixtures = {
  createExpenseRequest: CreateExpenseV1Request;
  expenseHistory: ExpenseHistoryResponseV1;
  balancesSummary: BalancesSummaryResponseV1;
  insightsCharts: InsightsChartsResponseV1;
  vietQrRequest: GenerateVietQrRequestV1;
};

export type ApiSuccessV1<T> = { version: ApiVersionV1; data: T };
export type ApiErrorV1 = {
  version: ApiVersionV1;
  error: { code: string; message: string; details?: unknown };
};
```

---

## Mock fixtures — `lib/finance/mock-fixtures.ts`

```typescript
import { FinanceV1Fixtures } from "@/types/finance/v1/dto";

export const financeV1Fixtures: FinanceV1Fixtures = {
  createExpenseRequest: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    title: "Cafe + snacks",
    amount: 120000,
    paidByMemberId: "65f1a4101ecf2c4dc9c5d201",
    participantMemberIds: [
      "65f1a4101ecf2c4dc9c5d201",
      "65f1a4101ecf2c4dc9c5d202",
      "65f1a4101ecf2c4dc9c5d203",
    ],
    shareStrategy: "EQUAL",
    notes: "Team retro snacks",
    occurredAt: "2026-03-28T07:30:00.000Z",
  },
  expenseHistory: {
    items: [
      {
        expenseId: "65f1a4101ecf2c4dc9c5d311",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        title: "Cafe + snacks",
        amount: 120000,
        paidByMemberId: "65f1a4101ecf2c4dc9c5d201",
        paidByMemberName: "An",
        shareStrategy: "EQUAL",
        shares: [
          {
            memberId: "65f1a4101ecf2c4dc9c5d201",
            memberName: "An",
            amount: 40000,
          },
          {
            memberId: "65f1a4101ecf2c4dc9c5d202",
            memberName: "Binh",
            amount: 40000,
          },
          {
            memberId: "65f1a4101ecf2c4dc9c5d203",
            memberName: "Chi",
            amount: 40000,
          },
        ],
        occurredAt: "2026-03-28T07:30:00.000Z",
        createdAt: "2026-03-28T07:30:05.000Z",
      },
    ],
    totalCount: 1,
    limit: 20,
    offset: 0,
    hasMore: false,
  },
  balancesSummary: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    generatedAt: "2026-03-28T07:35:00.000Z",
    totalOutstanding: 80000,
    ledger: [
      {
        ledgerId: "65f1a4101ecf2c4dc9c5d411",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        fromMemberId: "65f1a4101ecf2c4dc9c5d202",
        fromMemberName: "Binh",
        toMemberId: "65f1a4101ecf2c4dc9c5d201",
        toMemberName: "An",
        amount: 40000,
        sourceExpenseId: "65f1a4101ecf2c4dc9c5d311",
        updatedAt: "2026-03-28T07:30:05.000Z",
      },
      {
        ledgerId: "65f1a4101ecf2c4dc9c5d412",
        groupId: "65f1a4101ecf2c4dc9c5d111",
        fromMemberId: "65f1a4101ecf2c4dc9c5d203",
        fromMemberName: "Chi",
        toMemberId: "65f1a4101ecf2c4dc9c5d201",
        toMemberName: "An",
        amount: 40000,
        sourceExpenseId: "65f1a4101ecf2c4dc9c5d311",
        updatedAt: "2026-03-28T07:30:05.000Z",
      },
    ],
    memberBalances: [
      {
        memberId: "65f1a4101ecf2c4dc9c5d201",
        memberName: "An",
        netAmount: 80000,
      },
      {
        memberId: "65f1a4101ecf2c4dc9c5d202",
        memberName: "Binh",
        netAmount: -40000,
      },
      {
        memberId: "65f1a4101ecf2c4dc9c5d203",
        memberName: "Chi",
        netAmount: -40000,
      },
    ],
  },
  insightsCharts: {
    groupId: "65f1a4101ecf2c4dc9c5d111",
    fromDate: "2026-02-27T00:00:00.000Z",
    toDate: "2026-03-28T23:59:59.000Z",
    bucket: "day",
    totalAmount: 120000,
    expenseCount: 1,
    trend: [
      {
        bucketStart: "2026-03-28T00:00:00.000Z",
        totalAmount: 120000,
        expenseCount: 1,
      },
    ],
    topPayers: [
      {
        memberId: "65f1a4101ecf2c4dc9c5d201",
        memberName: "An",
        totalAmount: 120000,
      },
    ],
  },
  vietQrRequest: {
    bankBin: "970422",
    accountNumber: "0123456789",
    accountName: "AN NGUYEN",
    amount: 40000,
    transferNote: "Tra no cafe",
  },
};
```

---

## Config — `app/(finance)/_api/config.ts`

```typescript
export const DEMO_GROUP_ID = "65f1a4101ecf2c4dc9c5d111";
export const DEMO_CURRENT_MEMBER_ID = "65f1a4101ecf2c4dc9c5d201";
export const DEMO_GROUP_NAME = "Nhóm du lịch Đà Lạt";
```

---

## Server Data — `app/(finance)/_api/server-data.ts`

```typescript
import { financeV1Fixtures } from "@/lib/finance/mock-fixtures";
import type {
  BalancesSummaryResponseV1,
  ExpenseHistoryResponseV1,
  InsightsChartsResponseV1,
} from "@/types/finance/v1/dto";

export async function fetchBalancesSummary(
  groupId: string,
): Promise<{ data: BalancesSummaryResponseV1; isDemo: boolean }> {
  try {
    const { getBalancesSummaryV1 } =
      await import("@/lib/finance/services/summary-service");
    const data = await getBalancesSummaryV1({ groupId });
    return { data, isDemo: false };
  } catch {
    return { data: financeV1Fixtures.balancesSummary, isDemo: true };
  }
}

export async function fetchExpenseHistory(
  groupId: string,
  limit = 20,
): Promise<{ data: ExpenseHistoryResponseV1; isDemo: boolean }> {
  try {
    const { listExpenseHistoryV1 } =
      await import("@/lib/finance/services/expense-service");
    const data = await listExpenseHistoryV1({ groupId, limit });
    return { data, isDemo: false };
  } catch {
    return {
      data: { ...financeV1Fixtures.expenseHistory, limit },
      isDemo: true,
    };
  }
}

export async function fetchInsightsCharts(
  groupId: string,
): Promise<{ data: InsightsChartsResponseV1; isDemo: boolean }> {
  try {
    const { getInsightsChartsV1 } =
      await import("@/lib/finance/services/insights-service");
    const data = await getInsightsChartsV1({ groupId });
    return { data, isDemo: false };
  } catch {
    return { data: financeV1Fixtures.insightsCharts, isDemo: true };
  }
}

export function extractMembersFromSummary(
  summary: BalancesSummaryResponseV1,
): Array<{ id: string; name: string }> {
  const map = new Map<string, string>();
  for (const mb of summary.memberBalances) map.set(mb.memberId, mb.memberName);
  for (const le of summary.ledger) {
    map.set(le.fromMemberId, le.fromMemberName);
    map.set(le.toMemberId, le.toMemberName);
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}
```

---

## Layout — `app/(finance)/layout.tsx`

```tsx
import { Toaster } from "sonner";
import { FinanceSidebarWrapper } from "@/components/finance/layout/FinanceSidebarWrapper";
import { CursorGlow } from "@/components/cursor-glow";
import { DEMO_GROUP_NAME, DEMO_GROUP_ID } from "@/app/(finance)/_api/config";
import {
  fetchBalancesSummary,
  extractMembersFromSummary,
} from "@/app/(finance)/_api/server-data";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: summary } = await fetchBalancesSummary(DEMO_GROUP_ID);
  const members = extractMembersFromSummary(summary);

  return (
    <div className="relative min-h-screen bg-background scanlines">
      <CursorGlow />
      {/* Ambient background glow mesh */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-64 w-64 rounded-full bg-primary/4 blur-3xl" />
        <div className="absolute -bottom-48 right-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <FinanceSidebarWrapper
        groupName={DEMO_GROUP_NAME}
        memberCount={members.length}
      >
        {children}
      </FinanceSidebarWrapper>
      <Toaster position="top-center" richColors />
    </div>
  );
}
```

---

## Sidebar Wrapper — `components/finance/layout/FinanceSidebarWrapper.tsx`

```tsx
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

interface FinanceSidebarWrapperProps {
  groupName: string;
  memberCount: number;
  children: React.ReactNode;
}

export function FinanceSidebarWrapper({
  groupName,
  memberCount,
  children,
}: FinanceSidebarWrapperProps) {
  return (
    <SidebarProvider>
      <DesktopSidebar groupName={groupName} memberCount={memberCount} />
      <SidebarInset className="flex flex-col">
        <DesktopHeader className="hidden md:flex" />
        <div className="md:hidden">
          <MobileHeader groupName={groupName} memberCount={memberCount} />
        </div>
        {/* pb-16 = bottom nav height on mobile */}
        <div className="relative flex-1 overflow-y-auto pb-16 md:pb-6 md:pt-2">
          <div className="md:max-w-7xl md:mx-auto">{children}</div>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## Desktop Sidebar — `components/finance/layout/DesktopSidebar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusCircleIcon,
  ClockIcon,
  UsersIcon,
  BarChart2Icon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: HomeIcon },
  { href: "/history", label: "Lịch sử", icon: ClockIcon },
  { href: "/members", label: "Thành viên", icon: UsersIcon },
  { href: "/insights", label: "Thống kê", icon: BarChart2Icon },
];

export function DesktopSidebar({
  groupName,
  memberCount,
}: {
  groupName: string;
  memberCount: number;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/10">
      {/* Brand header */}
      <SidebarHeader className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none select-none"
              tooltip={`${groupName} · ${memberCount} thành viên`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25 animate-pulse-glow">
                <WalletCardsIcon className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="truncate text-xs font-mono font-semibold text-gradient leading-tight">
                  {groupName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {memberCount} thành viên
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Nav links */}
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                  className={cn(
                    "transition-all duration-200",
                    isActive &&
                      "bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15",
                  )}
                >
                  <Link href={href}>
                    <Icon
                      className={cn("size-4", isActive && "text-primary")}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      {/* Add expense CTA */}
      <SidebarFooter className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Thêm chi tiêu"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium shadow-sm animate-pulse-glow"
            >
              <Link href="/new-expense">
                <PlusCircleIcon className="size-4" />
                <span>Thêm chi tiêu</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

---

## Desktop Header — `components/finance/layout/DesktopHeader.tsx`

```tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeChanger } from "@/components/theme-changer";
import { cn } from "@/lib/utils";

export function DesktopHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-primary/10 glass-strong px-4",
        className,
      )}
    >
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors duration-200 rounded-md" />
      <Separator orientation="vertical" className="h-4 opacity-30" />
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <ThemeChanger />
      </div>
    </header>
  );
}
```

---

## Mobile Header — `components/finance/layout/MobileHeader.tsx`

```tsx
"use client";

import Link from "next/link";
import { BellIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileHeader({
  groupName,
  memberCount,
  className,
}: {
  groupName: string;
  memberCount: number;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-primary/10 glass-strong px-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20 animate-pulse-glow">
          <UsersIcon className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight font-mono text-gradient">
            {groupName}
          </p>
          <p className="text-xs text-muted-foreground">
            {memberCount} thành viên
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="rounded-full" asChild>
          <Link href="/members">
            <BellIcon className="size-4" />
            <span className="sr-only">Thông báo</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon-sm" className="rounded-full">
          <SettingsIcon className="size-4" />
          <span className="sr-only">Cài đặt</span>
        </Button>
      </div>
    </header>
  );
}
```

---

## Bottom Nav — `components/finance/layout/BottomNav.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusCircleIcon,
  ClockIcon,
  UsersIcon,
  BarChart2Icon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: HomeIcon },
  { href: "/history", label: "Lịch sử", icon: ClockIcon },
  { href: "/new-expense", label: "Thêm", icon: PlusCircleIcon, primary: true },
  { href: "/members", label: "Thành viên", icon: UsersIcon },
  { href: "/insights", label: "Thống kê", icon: BarChart2Icon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-stretch border-t border-primary/10 glass-strong safe-area-inset-bottom">
      {NAV_ITEMS.map(({ href, label, icon: Icon, primary }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-200",
              primary
                ? "relative"
                : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {primary ? (
              <span
                className={cn(
                  "-mt-5 flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground scale-110 shadow-[0_0_20px_4px_var(--glow-color)]"
                    : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-[0_0_16px_2px_var(--glow-color)]",
                )}
              >
                <Icon className="size-5" />
              </span>
            ) : (
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
            )}
            <span className={primary ? "text-primary font-semibold" : ""}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
```

---

## Shared — `components/finance/shared/MemberAvatar.tsx`

```tsx
import { cn } from "@/lib/utils";

const COLOR_CLASSES: Record<string, string> = {
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};
const PALETTE = Object.keys(COLOR_CLASSES);
const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
function deriveColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function MemberAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = color ?? deriveColor(name);
  return (
    <div
      title={name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZE_CLASSES[size],
        COLOR_CLASSES[c] ?? COLOR_CLASSES.emerald,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
```

---

## Shared — `components/finance/shared/expense-icon.tsx`

```tsx
import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Gamepad2,
  Zap,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
}

function getCategory(title: string): CategoryConfig {
  const t = title.toLowerCase();
  if (/ăn|cơm|bữa|nhà hàng|quán|cafe|cà phê|bia|uống|snack/.test(t))
    return {
      icon: UtensilsCrossed,
      bg: "bg-orange-500/10",
      color: "text-orange-500",
    };
  if (/xe|xăng|taxi|grab|đi lại|giao thông|vé/.test(t))
    return { icon: Car, bg: "bg-sky-500/10", color: "text-sky-500" };
  if (/siêu thị|shop|mua|sắm/.test(t))
    return { icon: ShoppingCart, bg: "bg-pink-500/10", color: "text-pink-500" };
  if (/phim|game|giải trí|karaoke/.test(t))
    return { icon: Gamepad2, bg: "bg-violet-500/10", color: "text-violet-500" };
  if (/điện|nước|internet|wifi/.test(t))
    return { icon: Zap, bg: "bg-yellow-500/10", color: "text-yellow-500" };
  return { icon: Banknote, bg: "bg-primary/10", color: "text-primary" };
}

export function ExpenseCategoryIcon({
  title,
  size = "size-9",
  iconSize = "size-4",
  className,
}: {
  title: string;
  size?: string;
  iconSize?: string;
  className?: string;
}) {
  const { icon: Icon, bg, color } = getCategory(title);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 dark:ring-white/5",
        size,
        bg,
        className,
      )}
    >
      <Icon className={cn(iconSize, color)} />
    </div>
  );
}
```

---

## Shared — `components/finance/shared/EmptyState.tsx`

```tsx
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-3xl">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
```

---

## Pages

### `app/(finance)/dashboard/page.tsx`

```tsx
import { DashboardClient } from "@/components/finance/dashboard/DashboardClient";
import {
  fetchBalancesSummary,
  fetchExpenseHistory,
} from "@/app/(finance)/_api/server-data";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/app/(finance)/_api/config";

export const metadata = { title: "Tổng quan | Chi tiêu nhóm" };

export default async function DashboardPage() {
  const [summaryResult, historyResult] = await Promise.all([
    fetchBalancesSummary(DEMO_GROUP_ID),
    fetchExpenseHistory(DEMO_GROUP_ID, 5),
  ]);
  return (
    <DashboardClient
      summary={summaryResult.data}
      history={historyResult.data}
      currentMemberId={DEMO_CURRENT_MEMBER_ID}
      isDemo={summaryResult.isDemo}
    />
  );
}
```

### `app/(finance)/history/page.tsx`

```tsx
import { ExpenseHistoryClient } from "@/components/finance/history/ExpenseHistoryClient";
import { fetchExpenseHistory } from "@/app/(finance)/_api/server-data";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/app/(finance)/_api/config";

export const metadata = { title: "Lịch sử | Chi tiêu nhóm" };

export default async function HistoryPage() {
  const { data: history, isDemo } = await fetchExpenseHistory(
    DEMO_GROUP_ID,
    50,
  );
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Lịch sử chi tiêu</h1>
        <p className="text-xs text-muted-foreground">
          {history.totalCount} khoản chi đã ghi lại
        </p>
      </div>
      <ExpenseHistoryClient
        history={history}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        isDemo={isDemo}
      />
    </div>
  );
}
```

### `app/(finance)/members/page.tsx`

```tsx
import { MembersClient } from "@/components/finance/members/MembersClient";
import { fetchBalancesSummary } from "@/app/(finance)/_api/server-data";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/app/(finance)/_api/config";

export const metadata = { title: "Thành viên | Chi tiêu nhóm" };

export default async function MembersPage() {
  const { data: summary, isDemo } = await fetchBalancesSummary(DEMO_GROUP_ID);
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Thành viên</h1>
        <p className="text-xs text-muted-foreground">
          Số dư và công nợ từng người • tổng outstanding:{" "}
          {new Intl.NumberFormat("vi-VN").format(summary.totalOutstanding)} ₫
        </p>
      </div>
      <MembersClient
        summary={summary}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        isDemo={isDemo}
      />
    </div>
  );
}
```

### `app/(finance)/insights/page.tsx`

```tsx
import { InsightsClient } from "@/components/finance/insights/InsightsClient";
import { fetchInsightsCharts } from "@/app/(finance)/_api/server-data";
import { DEMO_GROUP_ID } from "@/app/(finance)/_api/config";

export const metadata = { title: "Thống kê | Chi tiêu nhóm" };

export default async function InsightsPage() {
  const { data: charts, isDemo } = await fetchInsightsCharts(DEMO_GROUP_ID);
  return (
    <div>
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold">Thống kê</h1>
        <p className="text-xs text-muted-foreground">
          Phân tích chi tiêu theo thời gian
        </p>
      </div>
      <InsightsClient charts={charts} isDemo={isDemo} />
    </div>
  );
}
```

### `app/(finance)/new-expense/page.tsx`

```tsx
import { NewExpenseForm } from "@/components/finance/new-expense/NewExpenseForm";
import {
  fetchBalancesSummary,
  extractMembersFromSummary,
} from "@/app/(finance)/_api/server-data";
import {
  DEMO_GROUP_ID,
  DEMO_CURRENT_MEMBER_ID,
} from "@/app/(finance)/_api/config";

export const metadata = { title: "Thêm chi tiêu | Chi tiêu nhóm" };

export default async function NewExpensePage() {
  const { data: summary } = await fetchBalancesSummary(DEMO_GROUP_ID);
  const members = extractMembersFromSummary(summary);
  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold">Thêm khoản chi</h1>
        <p className="text-xs text-muted-foreground">
          Nhập thông tin và chia đều cho nhóm
        </p>
      </div>
      <NewExpenseForm
        members={members}
        currentMemberId={DEMO_CURRENT_MEMBER_ID}
        groupId={DEMO_GROUP_ID}
      />
    </div>
  );
}
```

---

## Dashboard Client — `components/finance/dashboard/DashboardClient.tsx`

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlusIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/components/finance/shared/MemberAvatar";
import { ExpenseCategoryIcon } from "@/components/finance/shared/expense-icon";
import type {
  BalancesSummaryResponseV1,
  ExpenseHistoryResponseV1,
} from "@/types/finance/v1/dto";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function DashboardClient({
  summary,
  history,
  currentMemberId,
  isDemo,
}: {
  summary: BalancesSummaryResponseV1;
  history: ExpenseHistoryResponseV1;
  currentMemberId: string;
  isDemo?: boolean;
}) {
  const myBalance = summary.memberBalances.find(
    (m) => m.memberId === currentMemberId,
  );
  const netBalance = myBalance?.netAmount ?? 0;
  const totalOwedToMe = summary.ledger
    .filter((l) => l.toMemberId === currentMemberId)
    .reduce((s, l) => s + l.amount, 0);
  const totalIOwe = summary.ledger
    .filter((l) => l.fromMemberId === currentMemberId)
    .reduce((s, l) => s + l.amount, 0);
  const myLedger = summary.ledger.filter(
    (l) =>
      l.fromMemberId === currentMemberId || l.toMemberId === currentMemberId,
  );
  const recentExpenses = history.items.slice(0, 5);
  const totalGroupSpending = history.items.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4 pb-4">
      {isDemo && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
          Demo mode — hiển thị dữ liệu mẫu (DB chưa kết nối)
        </div>
      )}

      {/* Net balance hero */}
      <div className="px-4 pt-4 animate-fade-in-up">
        <Card className="overflow-hidden border border-primary/20 glass-strong py-0 shadow-lg hover-lift border-glow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Số dư của bạn
                </p>
                <p
                  className={[
                    "mt-1 text-3xl font-bold tabular-nums font-mono",
                    netBalance >= 0
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-red-500",
                  ].join(" ")}
                >
                  {netBalance >= 0 ? "+" : ""}
                  {formatVND(Math.abs(netBalance))}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {netBalance >= 0 ? "Bạn đang được nợ" : "Bạn đang nợ"}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25 animate-pulse-glow">
                <WalletIcon className="size-6 text-primary" />
              </div>
            </div>
            <Separator className="my-3 opacity-30" />
            <div className="grid grid-cols-2 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30 bg-emerald-50/80 dark:bg-emerald-950/20 px-3 py-2 cursor-default transition-all duration-200 hover:border-emerald-400/50 hover:scale-[1.02]">
                    <TrendingUpIcon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        Được nợ
                      </p>
                      <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(totalOwedToMe)}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Tổng tiền người khác nợ bạn</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 rounded-lg border border-red-200/40 dark:border-red-800/30 bg-red-50/80 dark:bg-red-950/20 px-3 py-2 cursor-default transition-all duration-200 hover:border-red-400/50 hover:scale-[1.02]">
                    <TrendingDownIcon className="size-4 text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        Bạn nợ
                      </p>
                      <p className="text-sm font-semibold font-mono text-red-500 tabular-nums">
                        {formatVND(totalIOwe)}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Tổng tiền bạn đang nợ</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 px-4 animate-fade-in-up stagger-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <CardHeader className="px-3 pb-0">
                <CardTitle className="text-xs text-muted-foreground font-medium">
                  Chi tiêu nhóm
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3">
                <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatVND(totalGroupSpending)}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Tổng chi tiêu cả nhóm đã ghi lại</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="gap-1 py-3 hover-lift border-glow cursor-default relative overflow-hidden group border border-violet-200/30 dark:border-violet-800/20 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20 dark:to-background">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <CardHeader className="px-3 pb-0">
                <CardTitle className="text-xs text-muted-foreground font-medium">
                  Giao dịch
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3">
                <p className="text-lg font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
                  {history.totalCount}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Tổng số khoản chi đã ghi</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Settlement ledger */}
      {myLedger.length > 0 && (
        <div className="px-4 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gradient">
              Cần thanh toán
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 underline-animate"
              asChild
            >
              <Link href="/members">
                Xem tất cả <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>
          <Card className="py-2 divide-y divide-border/50 border border-primary/10 glass hover-lift">
            {myLedger.map((entry) => {
              const iOwe = entry.fromMemberId === currentMemberId;
              const other = iOwe
                ? { id: entry.toMemberId, name: entry.toMemberName }
                : { id: entry.fromMemberId, name: entry.fromMemberName };
              return (
                <div
                  key={entry.ledgerId}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/30"
                >
                  <MemberAvatar name={other.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{other.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {iOwe ? "Bạn nợ" : "Nợ bạn"}
                    </p>
                  </div>
                  <Badge
                    variant={iOwe ? "destructive" : "success"}
                    className="tabular-nums shrink-0 font-mono"
                  >
                    {iOwe ? "-" : "+"}
                    {formatVND(entry.amount)}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Recent expenses */}
      <div className="px-4 animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gradient">
            Chi tiêu gần đây
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 underline-animate"
            asChild
          >
            <Link href="/history">
              Xem tất cả <ArrowRightIcon className="size-3" />
            </Link>
          </Button>
        </div>
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Chưa có khoản chi nào
          </p>
        ) : (
          <Card className="py-2 divide-y divide-border/50 border border-primary/10 glass hover-lift">
            {recentExpenses.map((expense) => {
              const myShare = expense.shares.find(
                (s) => s.memberId === currentMemberId,
              );
              return (
                <div
                  key={expense.expenseId}
                  className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30"
                >
                  <ExpenseCategoryIcon title={expense.title} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {expense.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.paidByMemberName} &middot;{" "}
                      {new Date(expense.occurredAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold font-mono tabular-nums">
                      {formatVND(expense.amount)}
                    </p>
                    {myShare && (
                      <p className="text-xs text-muted-foreground tabular-nums font-mono">
                        Bạn: {formatVND(myShare.amount)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Add CTA */}
      <div className="px-4 animate-fade-in-up stagger-5">
        <Button
          asChild
          className="w-full gap-2 shadow-lg animate-pulse-glow"
          size="lg"
        >
          <Link href="/new-expense">
            <PlusIcon className="size-5" />
            Thêm chi tiêu mới
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

---

## Expense History Client — `components/finance/history/ExpenseHistoryClient.tsx`

```tsx
"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/components/finance/shared/MemberAvatar";
import { EmptyState } from "@/components/finance/shared/EmptyState";
import { ExpenseCategoryIcon } from "@/components/finance/shared/expense-icon";
import type { ExpenseHistoryResponseV1 } from "@/types/finance/v1/dto";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ExpenseHistoryClient({
  history,
  currentMemberId,
  isDemo,
}: {
  history: ExpenseHistoryResponseV1;
  currentMemberId: string;
  isDemo?: boolean;
}) {
  const [search, setSearch] = React.useState("");

  const filtered = history.items.filter(
    (e) =>
      search === "" || e.title.toLowerCase().includes(search.toLowerCase()),
  );
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const key = e.occurredAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-3 pb-4">
      {isDemo && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
          Demo mode — dữ liệu mẫu
        </div>
      )}
      <div className="px-4 pt-3 animate-fade-in-down">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm khoản chi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 glass border-primary/15 focus:border-primary/40"
          />
        </div>
      </div>
      {filtered.length > 0 && (
        <div className="px-4 flex items-center justify-between animate-fade-in">
          <p className="text-xs text-muted-foreground">
            {filtered.length} khoản chi
          </p>
          <p className="text-xs font-semibold font-mono tabular-nums text-gradient">
            {formatVND(totalFiltered)}
          </p>
        </div>
      )}
      {grouped.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Không tìm thấy"
          description="Thử từ khóa khác"
          className="mt-6"
        />
      ) : (
        <div className="space-y-4 px-4">
          {grouped.map(([dateKey, dayExpenses], groupIdx) => (
            <div
              key={dateKey}
              className={`animate-fade-in-up stagger-${Math.min(groupIdx + 1, 8)}`}
            >
              <p className="text-xs text-muted-foreground mb-2 font-mono font-medium uppercase tracking-wide">
                {formatDate(dayExpenses[0].occurredAt)}
              </p>
              <Card className="py-0 divide-y divide-border/50 border border-primary/10 glass hover-lift">
                {dayExpenses.map((expense) => {
                  const myShare = expense.shares.find(
                    (s) => s.memberId === currentMemberId,
                  );
                  const iPaid = expense.paidByMemberId === currentMemberId;
                  return (
                    <div
                      key={expense.expenseId}
                      className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/30"
                    >
                      <ExpenseCategoryIcon
                        title={expense.title}
                        size="size-10"
                        iconSize="size-5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {expense.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MemberAvatar
                            name={expense.paidByMemberName}
                            size="sm"
                            className="size-4 text-[8px]"
                          />
                          <p className="text-xs text-muted-foreground truncate">
                            {iPaid
                              ? "Bạn đã trả"
                              : `${expense.paidByMemberName} trả`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold font-mono tabular-nums">
                          {formatVND(expense.amount)}
                        </p>
                        {myShare && !iPaid && (
                          <Badge
                            variant="warning"
                            className="text-[10px] mt-0.5 tabular-nums font-mono"
                          >
                            -{formatVND(myShare.amount)}
                          </Badge>
                        )}
                        {iPaid && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] mt-0.5"
                          >
                            Bạn trả
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Members Client — `components/finance/members/MembersClient.tsx`

```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Share2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  QrCodeIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/components/finance/shared/MemberAvatar";
import { VietQrSheet } from "./VietQrSheet";
import type { BalancesSummaryResponseV1 } from "@/types/finance/v1/dto";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

interface QrTarget {
  amount: number;
  debtorName: string;
  transferNote: string;
}

export function MembersClient({
  summary,
  currentMemberId,
  isDemo,
}: {
  summary: BalancesSummaryResponseV1;
  currentMemberId: string;
  isDemo?: boolean;
}) {
  const [qrTarget, setQrTarget] = React.useState<QrTarget | null>(null);

  function buildSettleText() {
    const lines = ["💳 Danh sách thanh toán nhóm", ""];
    for (const entry of summary.ledger)
      lines.push(
        `${entry.fromMemberName} → ${entry.toMemberName}: ${formatVND(entry.amount)}`,
      );
    return lines.join("\n");
  }

  return (
    <div className="space-y-4 pb-4 pt-4 px-4">
      {isDemo && (
        <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
          Demo mode — dữ liệu mẫu
        </div>
      )}
      <div className="flex items-center justify-between animate-fade-in-down">
        <h2 className="text-sm font-semibold font-mono text-gradient uppercase tracking-widest">
          Thành viên nhóm
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          onClick={() =>
            navigator.clipboard.writeText(buildSettleText()).then(
              () => toast.success("Đã copy danh sách thanh toán"),
              () => toast.error("Không thể copy"),
            )
          }
        >
          <Share2Icon className="size-3.5" /> Copy thanh toán
        </Button>
      </div>

      {summary.memberBalances.map((member, idx) => {
        const isMe = member.memberId === currentMemberId;
        const owes = summary.ledger.filter(
          (l) => l.fromMemberId === member.memberId,
        );
        const owedBy = summary.ledger.filter(
          (l) => l.toMemberId === member.memberId,
        );
        return (
          <Card
            key={member.memberId}
            className={[
              `py-0 overflow-hidden hover-lift border-glow animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`,
              isMe
                ? "border-primary/30 ring-1 ring-primary/20 glass-strong"
                : "border-border/50 glass",
            ].join(" ")}
          >
            <CardHeader className="px-4 pt-4 pb-3 flex-row items-center gap-3">
              <MemberAvatar name={member.memberName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{member.memberName}</CardTitle>
                  {isMe && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-primary/15 text-primary border border-primary/20"
                    >
                      Bạn
                    </Badge>
                  )}
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right">
                    <p
                      className={[
                        "text-base font-bold font-mono tabular-nums",
                        member.netAmount > 0
                          ? "text-emerald-500 dark:text-emerald-400"
                          : member.netAmount < 0
                            ? "text-red-500"
                            : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {member.netAmount > 0 ? "+" : ""}
                      {formatVND(Math.abs(member.netAmount))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {member.netAmount > 0
                        ? "được nợ"
                        : member.netAmount < 0
                          ? "đang nợ"
                          : "hòa"}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Số dư ròng của {member.memberName}</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            {(owes.length > 0 || owedBy.length > 0) && (
              <>
                <Separator className="opacity-40" />
                <CardContent className="px-4 py-3 space-y-2">
                  {owedBy.map((entry) => (
                    <div
                      key={entry.ledgerId}
                      className="flex items-center gap-2 text-xs"
                    >
                      <MemberAvatar
                        name={entry.fromMemberName}
                        size="sm"
                        className="size-5 text-[8px]"
                      />
                      <span className="text-muted-foreground flex items-center gap-1">
                        {entry.fromMemberName}
                        <ArrowRightIcon className="size-3 text-emerald-500" />
                        {member.memberName}
                      </span>
                      <span className="ml-auto font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(entry.amount)}
                      </span>
                      {entry.toMemberId === currentMemberId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 rounded-full text-primary hover:bg-primary/10"
                              onClick={() =>
                                setQrTarget({
                                  amount: entry.amount,
                                  debtorName: entry.fromMemberName,
                                  transferNote: `Tra no ${entry.fromMemberName}`,
                                })
                              }
                            >
                              <QrCodeIcon className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Tạo QR thanh toán</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                  {owes.map((entry) => (
                    <div
                      key={entry.ledgerId}
                      className="flex items-center gap-2 text-xs"
                    >
                      <MemberAvatar
                        name={member.memberName}
                        size="sm"
                        className="size-5 text-[8px]"
                      />
                      <span className="text-muted-foreground flex items-center gap-1">
                        {member.memberName}
                        <ArrowLeftIcon className="size-3 text-red-400" />
                        {entry.toMemberName}
                      </span>
                      <span className="ml-auto font-semibold font-mono text-red-500 tabular-nums">
                        {formatVND(entry.amount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </>
            )}
          </Card>
        );
      })}
      <VietQrSheet
        open={qrTarget !== null}
        onOpenChange={(v) => {
          if (!v) setQrTarget(null);
        }}
        amount={qrTarget?.amount ?? 0}
        debtorName={qrTarget?.debtorName ?? ""}
        transferNote={qrTarget?.transferNote ?? ""}
      />
    </div>
  );
}
```

---

## VietQR Sheet — `components/finance/members/VietQrSheet.tsx`

```tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { QrCodeIcon, LoaderIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GenerateVietQrRequestV1,
  GenerateVietQrResponseV1,
} from "@/types/finance/v1/dto";

const BANKS = [
  { bin: "970436", name: "Vietcombank" },
  { bin: "970415", name: "VietinBank" },
  { bin: "970418", name: "BIDV" },
  { bin: "970407", name: "Techcombank" },
  { bin: "970422", name: "MB Bank" },
  { bin: "970405", name: "Agribank" },
  { bin: "970432", name: "VPBank" },
  { bin: "970423", name: "TPBank" },
  { bin: "970441", name: "VIB" },
  { bin: "970448", name: "OCB" },
];

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function VietQrSheet({
  open,
  onOpenChange,
  amount,
  transferNote,
  debtorName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  transferNote: string;
  debtorName: string;
}) {
  const [bankBin, setBankBin] = React.useState(BANKS[0].bin);
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<GenerateVietQrResponseV1 | null>(
    null,
  );

  async function handleGenerate() {
    if (!accountNumber.trim()) {
      toast.error("Nhập số tài khoản");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const body: GenerateVietQrRequestV1 = {
        bankBin,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        amount,
        transferNote: transferNote.slice(0, 60),
      };
      const res = await fetch("/api/v1/vietqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const json = await res.json();
      setResult(json.data as GenerateVietQrResponseV1);
    } catch (err) {
      toast.error("Không thể tạo QR", {
        description: err instanceof Error ? err.message : "Thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!open) {
      setResult(null);
      setAccountNumber("");
      setAccountName("");
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[92dvh] overflow-y-auto"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="flex items-center gap-2">
            <QrCodeIcon className="size-5 text-primary" /> Tạo QR thanh toán
          </SheetTitle>
          <SheetDescription>
            {debtorName} thanh toán {formatVND(amount)} qua VietQR
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ngân hàng</label>
            <Select value={bankBin} onValueChange={setBankBin}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((b) => (
                  <SelectItem key={b.bin} value={b.bin}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Số tài khoản</label>
            <Input
              placeholder="0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tên tài khoản{" "}
              <span className="text-muted-foreground">(tuỳ chọn)</span>
            </label>
            <Input
              placeholder="NGUYEN VAN A"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              className="h-10"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">Số tiền</span>
            <span className="text-sm font-bold tabular-nums">
              {formatVND(amount)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2">
            <span className="text-sm text-muted-foreground">Nội dung</span>
            <span className="text-xs font-medium truncate max-w-[55%] text-right">
              {transferNote.slice(0, 60)}
            </span>
          </div>
          <Button
            type="button"
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <QrCodeIcon className="size-4" />
            )}
            {loading ? "Đang tạo QR..." : "Tạo mã QR"}
          </Button>
          {result && (
            <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
              <Image
                src={result.qrImageUrl}
                alt="VietQR code"
                width={200}
                height={200}
                className="rounded-lg"
                unoptimized
              />
              <p className="text-xs text-muted-foreground text-center">
                Quét bằng app ngân hàng để chuyển khoản
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() =>
                  navigator.clipboard.writeText(result.payload).then(
                    () => toast.success("Đã copy QR payload"),
                    () => toast.error("Không thể copy"),
                  )
                }
              >
                <CopyIcon className="size-3" /> Copy QR payload
              </Button>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Insights Client — `components/finance/insights/InsightsClient.tsx`

```tsx
"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/finance/shared/MemberAvatar";
import type { InsightsChartsResponseV1 } from "@/types/finance/v1/dto";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}
function formatBucketLabel(iso: string, bucket: string) {
  const d = new Date(iso);
  if (bucket === "month")
    return d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}
const PAYER_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  borderRadius: "0.5rem",
  border: "1px solid var(--border)",
  background: "oklch(from var(--popover) l c h / 0.85)",
  backdropFilter: "blur(12px)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export function InsightsClient({
  charts,
  isDemo,
}: {
  charts: InsightsChartsResponseV1;
  isDemo?: boolean;
}) {
  const trendData = charts.trend.map((p) => ({
    label: formatBucketLabel(p.bucketStart, charts.bucket),
    total: p.totalAmount,
    count: p.expenseCount,
  }));
  const payerData = charts.topPayers.map((p) => ({
    name: p.memberName,
    total: p.totalAmount,
    id: p.memberId,
  }));
  const avg =
    charts.expenseCount > 0
      ? Math.round(charts.totalAmount / charts.expenseCount)
      : 0;

  return (
    <div className="space-y-4 pb-4 pt-4 px-4">
      {isDemo && (
        <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 backdrop-blur-sm">
          Demo mode — dữ liệu mẫu
        </div>
      )}
      <div className="flex items-start justify-between animate-fade-in-down">
        <div>
          <h2 className="text-sm font-semibold text-gradient">
            Thống kê chi tiêu
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {new Date(charts.fromDate).toLocaleDateString("vi-VN")} →{" "}
            {new Date(charts.toDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border border-primary/20 font-mono"
        >
          {charts.bucket === "day"
            ? "Ngày"
            : charts.bucket === "week"
              ? "Tuần"
              : "Tháng"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up stagger-1">
        <Card className="gap-1 py-3 hover-lift border-glow border border-blue-200/30 dark:border-blue-800/20 bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="text-xs text-muted-foreground font-medium">
              Tổng chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <p className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              {formatVND(charts.totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-1 py-3 hover-lift border-glow border border-violet-200/30 dark:border-violet-800/20 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20 dark:to-background">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="text-xs text-muted-foreground font-medium">
              TB/khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <p className="text-base font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
              {formatVND(avg)}
            </p>
          </CardContent>
        </Card>
      </div>
      {trendData.length > 0 && (
        <Card className="py-4 border border-primary/10 glass hover-lift animate-fade-in-up stagger-2">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-sm text-gradient">
              Xu hướng chi tiêu
            </CardTitle>
            <CardDescription className="text-xs font-mono">
              {charts.expenseCount} khoản chi
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={trendData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  formatter={(
                    value: number,
                    _: string,
                    entry: { payload?: { count?: number } },
                  ) => [
                    `${formatVND(value)} (${entry?.payload?.count ?? 0} khoản)`,
                    "Chi tiêu",
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Bar
                  dataKey="total"
                  radius={[4, 4, 0, 0]}
                  fill="var(--primary)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      {payerData.length > 0 && (
        <Card className="py-4 border border-primary/10 glass hover-lift animate-fade-in-up stagger-3">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-sm text-gradient">
              Người trả nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer
              width="100%"
              height={Math.max(120, payerData.length * 48)}
            >
              <BarChart
                data={payerData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <RechartsTooltip
                  formatter={(value: number) => [formatVND(value), "Đã trả"]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {payerData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PAYER_COLORS[i % PAYER_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2 px-2">
              {payerData.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 py-1 rounded-md transition-colors duration-150 hover:bg-muted/30 px-1"
                >
                  <MemberAvatar
                    name={p.name}
                    size="sm"
                    className="size-6 text-[9px]"
                  />
                  <span className="text-xs flex-1 font-medium">{p.name}</span>
                  <span className="text-xs font-semibold font-mono tabular-nums text-right">
                    {formatVND(p.total)}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono w-9 text-right tabular-nums">
                    {charts.totalAmount > 0
                      ? Math.round((p.total / charts.totalAmount) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## New Expense Form — `components/finance/new-expense/NewExpenseForm.tsx`

```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DivideIcon,
  Share2Icon,
  CheckCircle2Icon,
  CircleIcon,
  LoaderIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberAvatar } from "@/components/finance/shared/MemberAvatar";
import type {
  CreateExpenseV1Request,
  CreateExpenseV1Response,
} from "@/types/finance/v1/dto";

interface Member {
  id: string;
  name: string;
}
interface SharePreview {
  memberId: string;
  memberName: string;
  amount: number;
}
function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function NewExpenseForm({
  members,
  currentMemberId,
  groupId,
}: {
  members: Member[];
  currentMemberId: string;
  groupId: string;
}) {
  const [title, setTitle] = React.useState("");
  const [amountStr, setAmountStr] = React.useState("");
  const [payerId, setPayerId] = React.useState(
    currentMemberId || members[0]?.id || "",
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(members.map((m) => m.id)),
  );
  const [shares, setShares] = React.useState<SharePreview[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [lastResult, setLastResult] =
    React.useState<CreateExpenseV1Response | null>(null);

  const amount = React.useMemo(() => {
    const raw = amountStr.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(raw);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  }, [amountStr]);

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else next.add(id);
      return next;
    });
    setShares([]);
  }

  function handleSplitEqually() {
    if (amount <= 0) {
      toast.error("Nhập số tiền trước khi chia đều");
      return;
    }
    const ids = Array.from(selectedIds);
    const base = Math.floor(amount / ids.length);
    const remainder = amount - base * ids.length;
    setShares(
      ids.map((id, i) => ({
        memberId: id,
        memberName: members.find((m) => m.id === id)?.name ?? id,
        amount: i === 0 ? base + remainder : base,
      })),
    );
    toast.success("Đã chia đều", { description: formatVND(base) + "/người" });
  }

  function handleShare() {
    if (shares.length === 0) {
      toast.error("Nhấn Chia đều trước khi chia sẻ");
      return;
    }
    const payer = members.find((m) => m.id === payerId);
    const perPerson = shares[0] ? Math.floor(amount / selectedIds.size) : 0;
    const text = [
      `💸 ${title || "(Chưa đặt tên)"} — ${formatVND(amount)}`,
      `Người trả: ${payer?.name ?? "?"}`,
      `Chia đều: ${formatVND(perPerson)}/người`,
      "",
      ...shares.map(
        (s) =>
          `• ${s.memberName}: ${s.memberId === payerId ? "✓ đã trả" : formatVND(s.amount)}`,
      ),
    ].join("\n");
    navigator.clipboard.writeText(text).then(
      () =>
        toast.success("Đã copy nội dung chia tiền", {
          description: "Dán vào chat nhóm nhé!",
        }),
      () => toast.error("Không thể copy. Vui lòng thử lại."),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Nhập tên khoản chi");
      return;
    }
    if (amount <= 0) {
      toast.error("Nhập số tiền hợp lệ");
      return;
    }
    if (shares.length === 0) {
      toast.error("Nhấn Chia đều để phân bổ trước khi lưu");
      return;
    }
    setSubmitting(true);
    try {
      const body: CreateExpenseV1Request = {
        groupId,
        title: title.trim(),
        amount,
        paidByMemberId: payerId,
        participantMemberIds: Array.from(selectedIds),
        shareStrategy: "EQUAL",
      };
      const res = await fetch("/api/v1/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Lỗi ${res.status}`);
      }
      const json = await res.json();
      setLastResult(json.data as CreateExpenseV1Response);
      setSubmitted(true);
      toast.success("Đã lưu khoản chi!", {
        description: `${title} — ${formatVND(amount)}`,
      });
    } catch (err) {
      toast.error("Không thể lưu khoản chi", {
        description: err instanceof Error ? err.message : "Thử lại sau",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setTitle("");
    setAmountStr("");
    setShares([]);
    setLastResult(null);
    setSelectedIds(new Set(members.map((m) => m.id)));
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2Icon className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-bold">Đã lưu!</p>
          <p className="text-sm text-muted-foreground">
            {title} — {formatVND(amount)}
          </p>
          {lastResult && (
            <p className="text-xs text-muted-foreground mt-1">
              Cập nhật {lastResult.ledgerUpdates.length} ghi nợ
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="outline" onClick={handleReset}>
            Thêm khoản khác
          </Button>
          {shares.length > 0 && (
            <Button variant="outline" onClick={handleShare}>
              <Share2Icon className="size-4 mr-1" /> Copy chia tiền
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4 px-4 pt-2">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tên khoản chi</label>
        <Input
          placeholder="Ví dụ: Bữa tối nhà hàng"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Số tiền (₫)</label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountStr}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setAmountStr(raw ? Number(raw).toLocaleString("vi-VN") : "");
            setShares([]);
          }}
          className="h-11 text-lg font-semibold tabular-nums"
        />
        {amount > 0 && (
          <p className="text-xs text-muted-foreground">{formatVND(amount)}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Người trả</label>
        <Select value={payerId} onValueChange={setPayerId}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder="Chọn người trả" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Chia cho ai?</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = selectedIds.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMember(m.id)}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50",
                ].join(" ")}
              >
                {active ? (
                  <CheckCircle2Icon className="size-3.5 shrink-0" />
                ) : (
                  <CircleIcon className="size-3.5 shrink-0" />
                )}
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 border-dashed"
        onClick={handleSplitEqually}
      >
        <DivideIcon className="size-4" />
        Chia đều ({selectedIds.size} người)
        {amount > 0 && selectedIds.size > 0 && (
          <Badge variant="secondary" className="ml-auto tabular-nums">
            {formatVND(Math.floor(amount / selectedIds.size))}/người
          </Badge>
        )}
      </Button>
      {shares.length > 0 && (
        <Card className="py-0">
          <CardHeader className="px-4 pt-3 pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Phân bổ chi tiêu</span>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-primary font-normal hover:underline"
              >
                <Share2Icon className="size-3" /> Copy chia sẻ
              </button>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="px-0 py-0">
            {shares.map((s, i) => {
              const isPayer = s.memberId === payerId;
              return (
                <div
                  key={s.memberId}
                  className={[
                    "flex items-center gap-3 px-4 py-2.5",
                    i < shares.length - 1 ? "border-b" : "",
                  ].join(" ")}
                >
                  <MemberAvatar name={s.memberName} size="sm" />
                  <span className="flex-1 text-sm font-medium">
                    {s.memberName}
                  </span>
                  {isPayer && (
                    <Badge variant="secondary" className="text-xs">
                      Người trả
                    </Badge>
                  )}
                  <span
                    className={[
                      "text-sm font-semibold tabular-nums",
                      isPayer
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    {formatVND(s.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      <Button
        type="submit"
        className="w-full h-12 text-base gap-2"
        disabled={amount <= 0 || !title.trim() || submitting}
      >
        {submitting && <LoaderIcon className="size-4 animate-spin" />}
        {submitting ? "Đang lưu..." : "Lưu khoản chi"}
      </Button>
    </form>
  );
}
```

---

## Loading Skeletons

### `app/(finance)/dashboard/loading.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 pb-4 px-4 pt-4">
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-6 w-36" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

Các trang còn lại (`history`, `members`, `insights`, `new-expense`) đều có pattern tương tự: `Skeleton` blocks khớp với layout của page client tương ứng.

---

## Quy ước quan trọng

| Quy ước       | Giá trị                                                               |
| ------------- | --------------------------------------------------------------------- |
| Tiền tệ       | VND, format: `Intl.NumberFormat("vi-VN")` + ` ₫`                      |
| Ngôn ngữ UI   | Tiếng Việt toàn bộ                                                    |
| Màu nợ        | `text-red-500` (bạn nợ) / `text-emerald-500` (được nợ)                |
| Font số       | `font-mono tabular-nums`                                              |
| Demo banner   | amber, chỉ show khi `isDemo === true`                                 |
| Active nav    | `bg-primary/10 text-primary border border-primary/15` + dot indicator |
| Glass card    | `.glass` (60% opacity) hoặc `.glass-strong` (80%)                     |
| Animation     | Dùng `animate-fade-in-up` + `stagger-N` cho danh sách                 |
| Sidebar       | `collapsible="icon"` — thu gọn thành icon khi nhỏ                     |
| Mobile nav    | Bottom nav cố định h-16, center item là floating circle               |
| API calls     | `POST /api/v1/expenses`, `POST /api/v1/vietqr`                        |
| Data strategy | Server fetch → fallback mock khi lỗi DB                               |
