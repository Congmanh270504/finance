---
name: UI page + flow code
description: Skill tao page theo flow UI cua du an voi shadcn Card, shadcn Table, tooltip, va hieu ung hover gradient theo mau da quy dinh.
---

# Skill: UI page + flow code

Su dung skill nay khi User yeu cau tao page moi, dashboard page, board page, table page, summary cards, hoac giao dien co flow thao tac trong du an.

## Muc tieu cot loi

1. Giao dien phai dung dung component cua du an, uu tien `shadcn/ui`.
2. Page moi phai co bo cuc ro rang, doc duoc nhanh, de mo rong, va phu hop style hien co.
3. Khong dung table HTML thu cong nhu `table`, `thead`, `tbody`, `tr`, `th`, `td` neu du an da co shadcn Table components.
4. Card summary phai co tooltip, transition muot, va gradient hover theo pattern duoi day.
5. Neu page co filter, search, pagination thi phai di theo flow cua du an va uu tien URL params neu phu hop kien truc.

## Quy tac bat buoc khi tao page

### 1. Layout page

- Uu tien chia page thanh 3 vung:
    - Header page: title, description, action buttons.
    - Summary cards: thong ke nhanh, click de filter neu can.
    - Data area: table, filter bar, pagination, empty state.
- Uu tien dung `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`.
- Giu spacing gon gang, uu tien `gap-4`, `gap-6`, `space-y-4`, `space-y-6`.

### 2. Card rules

- Summary block phai dung `Card` cua shadcn, khong dung `div` gia lap card neu khong can thiet.
- Card co the click de dieu huong hoac filter.
- Card summary nen duoc boc boi `Tooltip`, `TooltipTrigger asChild`, `TooltipContent`.
- Phai co hover motion nhe:
    - `transition-all duration-300`
    - `hover:shadow-lg`
    - `hover:scale-105`
    - `hover:border-blue-500/50`
- Phai co gradient background, uu tien dang:
    - `bg-gradient-to-br from-blue-50 to-white`
    - dark mode: `dark:from-blue-950/20 dark:to-background`
- Co overlay shine effect khi hover neu phu hop:
    - lop absolute
    - `opacity-0 group-hover:opacity-100`
    - gradient sang ngang
    - translate animation

### 3. Table rules

- Bat buoc dung shadcn Table components cua du an.
- Khi tao table cho feature, bat buoc dung DataTable tai `src/components/data-table.tsx`.
- Luon tach columns definitions ra file `columns.tsx` va truyen vao DataTable.
- Khong viet truc tiep cac the HTML:
    - `table`
    - `thead`
    - `tbody`
    - `tr`
    - `th`
    - `td`
- Uu tien cac component:
    - `Table`
    - `TableHeader`
    - `TableBody`
    - `TableRow`
    - `TableHead`
    - `TableCell`
- Khi tao table cho feature, bat buoc co `Columns.tsx` trong feature do de dinh nghia columns.
- Neu page co data table lon, uu tien tach:
    - file `Columns.tsx` cho column definitions
    - file `DataTable.tsx` cho rendering va interactions
- Text trong `TableCell` uu tien can giua cho bang nghiep vu, dac biet voi cot ma, so lieu, ngay gio, va trang thai.
- So lieu phai co mau de nhin nhanh theo nghiep vu.
    - tong so / tich cuc: xanh la hoac xanh duong
    - canh bao / am / huy: do
    - tien / gia tri / doanh thu: dung mau nhan dien on dinh theo module
- Ngay gio phai format theo chuan Viet Nam.
    - Uu tien `dd/MM/yyyy`
    - Neu co thoi gian: `dd/MM/yyyy HH:mm`
    - Khong render raw date string hoac ISO string.
- Cot action phai dung tooltip cho tung icon action.
- Action row phai stop propagation neu row co click.

### 3.1. Action column pattern

Ap dung pattern nay cho cot thao tac:

```tsx
<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        // onView();
                    }}
                    className="h-8 w-8 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                />
            }
        >
            <Eye className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px] font-bold">
            aaa
        </TooltipContent>
    </Tooltip>
</div>
```

### 3.2. Column rules

- `Columns.tsx` chi nen chua column definitions, formatter.
- Dinh dang so, tien, ngay gio nen xu ly tai column de giao dien dong nhat.
- Cell text uu tien `text-center` neu la du lieu bang nghiep vu.
- Number cell nen co class mau theo y nghia nghiep vu, khong de mot mau trung tinh cho moi truong hop.

### 4. Tooltip rules

- Card thong ke, icon action, va thong tin can giai thich nen co tooltip.
- `TooltipContent` phai doc de hieu nhanh, ngan gon, khong viet dai dong.
- Style tooltip co the giu mau sang, de doc:

```tsx
<TooltipContent
    side="bottom"
    className="bg-white text-neutral-950 dark:bg-neutral-50 [&_svg]:bg-white [&_svg]:fill-white dark:[&_svg]:bg-white dark:[&_svg]:fill-white"
>
```

### 5. Visual direction

- Uu tien tone mau ro rang theo nghiep vu: xanh duong, xanh la, vang, do... tuy ngu canh.
- Khong tao UI phang va nhat.
- Hover va focus phai cho cam giac co phan hoi nhung khong qua lo.
- Neu card co icon, icon nen nam trong vung tron nho co background cung tone mau.

## Pattern uu tien cho summary card

Ap dung pattern nay khi tao card thong ke co tooltip va click action:

```tsx
<Tooltip>
    <TooltipTrigger asChild>
        <Card className="gap-1 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-500/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 px-4">
                <CardTitle className="flex gap-2 items-center text-sm font-medium text-blue-700 dark:text-blue-400">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        Tieu de
                    </h4>
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2">
                        {value}
                    </h2>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 px-4">
                {/* Noi dung thong ke */}
            </CardContent>
        </Card>
    </TooltipTrigger>

    <TooltipContent
        side="bottom"
        className="bg-white text-neutral-950 dark:bg-neutral-50 [&_svg]:bg-white [&_svg]:fill-white dark:[&_svg]:bg-white dark:[&_svg]:fill-white"
    >
        <p>Mo ta ngan gon</p>
    </TooltipContent>
</Tooltip>
```

## Quy trinh khi implement page moi

1. Xac dinh page co may khu: header, filter, summary cards, table, form/dialog.
2. Kiem tra du an da co component dung lai duoc chua.
3. Dung shadcn Card cho summary va khung noi dung.
4. Dung shadcn Table cho bang du lieu.
5. Them tooltip cho card va action quan trong.
6. Them hover/transition/gradient de UI song dong nhung van dung style du an.
7. Neu co filter theo card click, phai noi ro flow state va reset pagination neu can.

## Cac dieu can tranh

- Khong dung table HTML thu cong khi da co shadcn table.
- Khong tao giao dien chi toan `div` va utility classes neu da co component semantic cua shadcn.
- Khong bo qua tooltip cho summary card co y nghia nghiep vu.
- Khong dung hieu ung qua nang, qua nhieu animation, hoac gradient roi.
- Khong pha vo style hien co cua du an.

## Khi nao nen dung skill nay

- Tao dashboard page moi.
- Tao trang list co summary cards + data table.
- Tao trang workflow co card thong ke, click de loc du lieu.
- Refactor page cu de thong nhat UI pattern theo shadcn.
