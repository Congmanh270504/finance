"use client";

import {
    ColumnDef,
    FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    type Table as TanstackTable,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { type MouseEvent, useState } from "react";

import Pagination from "@/components/table/Pagination";
import StatePagination from "@/components/table/StatePagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { useTheme } from "next-themes";

type PaginationConfig = {
    total: number;
    page: number;
    limit: number;
    onPageChange?: (page: number) => void;
};

type DataTableButtonAction = Omit<
    React.ComponentProps<typeof Button>,
    "children"
> & {
    label: React.ReactNode;
    icon?: React.ReactNode;
    key?: React.Key;
};

type DataTableAction = DataTableButtonAction | React.ReactNode;
type DataTableActionContext<TData> = {
    table: TanstackTable<TData>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    className?: string;
    emptyMessage?: string;
    meta?: any;
    pagination?: PaginationConfig;
    onRowClick?: (row: TData) => void;
    rowClassName?: string | ((row: TData) => string);
    getRowId?: (originalRow: TData, index: number, parent?: any) => string;
    stickyColumns?: string[];
    stickyHeaderClassName?: string;
    stickyCellClassName?: string;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    actions?:
        | DataTableAction[]
        | ((context: DataTableActionContext<TData>) => DataTableAction[]);
}

function isDataTableButtonAction(
    action: DataTableAction,
): action is DataTableButtonAction {
    return (
        !!action &&
        typeof action === "object" &&
        !React.isValidElement(action) &&
        "label" in action
    );
}

const normalizeSearchValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(normalizeSearchValue).join(" ");
    }

    if (typeof value === "object") {
        return Object.values(value).map(normalizeSearchValue).join(" ");
    }

    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

export function DataTable<TData, TValue>({
    columns,
    data,
    className,
    emptyMessage = "No data",
    meta,
    pagination,
    onRowClick,
    rowClassName,
    getRowId,
    stickyColumns,
    stickyHeaderClassName,
    stickyCellClassName,
    enableSearch = true,
    searchPlaceholder = "Search...",
    actions = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const mounted = useMounted();

    const globalFilterFn = React.useCallback<FilterFn<TData>>(
        (row, _columnId, filterValue) => {
            const query = normalizeSearchValue(filterValue);

            if (!query) return true;

            return normalizeSearchValue(row.original).includes(query);
        },
        [],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        state: {
            sorting,
            globalFilter,
        },
        meta,
        getRowId,
    });

    const stickySet = new Set(stickyColumns ?? []);
    const stickyClampClass = "max-w-[200px] sm:max-w-none truncate";
    const resolvedActions =
        typeof actions === "function"
            ? actions({ table, globalFilter, setGlobalFilter })
            : actions;
    const { resolvedTheme } = useTheme();
    const isDark = mounted && resolvedTheme === "dark";

    const metaPagination = meta as PaginationConfig | undefined;
    const paginationConfig = pagination ?? metaPagination;
    const total = paginationConfig?.total ?? 0;
    const page = paginationConfig?.page ?? 1;
    const limit = paginationConfig?.limit ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const shouldIgnoreRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
        const target = event.target as HTMLElement;
        return !!target.closest(
            "button, input, textarea, a, svg, [role='checkbox'], [role='menuitem'], [data-no-row-open='true'], [data-radix-collection-item]",
        );
    };

    return (
        <div
            className={cn(
                "w-full overflow-x-auto dark:rounded-2xl dark:border dark:border-white/10 dark:bg-[rgba(8,15,28,0.42)] dark:text-slate-100 dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)] dark:backdrop-blur-2xl",
                className,
            )}
        >
            <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:justify-between dark:border-b dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl">
                {enableSearch ? (
                    <div className="relative w-full max-w-md flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground dark:text-cyan-200/80" />
                        <Input
                            value={globalFilter}
                            placeholder={searchPlaceholder}
                            className="pl-9 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:placeholder:text-slate-300/70 dark:focus-visible:ring-cyan-400/40"
                            onChange={(event) =>
                                table.setGlobalFilter(event.target.value)
                            }
                        />
                    </div>
                ) : (
                    <div />
                )}
                <div className=" flex justify-between items-center gap-2">
                    {resolvedActions.map((action, index) => {
                        if (isDataTableButtonAction(action)) {
                            const { label, icon, key, ...buttonProps } = action;

                            return (
                                <Button
                                    key={key ?? `action-${index}`}
                                    type="button"
                                    {...buttonProps}
                                >
                                    {icon}
                                    {label}
                                </Button>
                            );
                        }

                        return (
                            <React.Fragment key={`action-${index}`}>
                                {action}
                            </React.Fragment>
                        );
                    })}
                    <DataTableViewOptions table={table} />
                </div>
            </div>

            <Table className="min-w-full">
                <TableHeader
                    className={cn(
                        "sticky top-0 z-20  backdrop-blur-sm ",
                        isDark
                            ? "dark:border-white/10 dark:bg-white/[0.05] dark:backdrop-blur-xl"
                            : "bg-slate-50/95 bg-linear-to-r from-blue-50 to-yellow-50",
                    )}
                >
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="hover:bg-primary/10 bg-primary/5 border-b border-gray-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-cyan-400/10"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        stickySet.has(header.column.id)
                                            ? cn(
                                                  "sticky left-0 z-30 backdrop-blur-3xl border-b border-border after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border/60 dark:border-white/10 dark:bg-white/[0.07] dark:after:bg-white/10",
                                                  stickyClampClass,
                                                  stickyHeaderClassName,
                                              )
                                            : undefined,
                                        "font-semibold text-gray-700 dark:text-slate-100",
                                    )}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={
                                    onRowClick
                                        ? (event) => {
                                              if (shouldIgnoreRowClick(event)) {
                                                  return;
                                              }
                                              onRowClick(row.original);
                                          }
                                        : undefined
                                }
                                className={cn(
                                    onRowClick ? "cursor-pointer" : undefined,
                                    "border-gray-100 odd:bg-white even:bg-blue-50 hover:bg-blue-100/60 dark:border-white/10 dark:odd:bg-white/[0.03] dark:even:bg-white/[0.06] dark:hover:bg-cyan-400/10",
                                    typeof rowClassName === "function"
                                        ? rowClassName(row.original)
                                        : rowClassName,
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            stickySet.has(cell.column.id)
                                                ? cn(
                                                      "sticky left-0 z-30 backdrop-blur-3xl border-b border-border after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border/60 dark:border-white/10 dark:bg-white/[0.07] dark:after:bg-white/10",
                                                      stickyClampClass,
                                                      stickyCellClassName,
                                                  )
                                                : undefined,
                                            "text-zinc-900 dark:text-slate-100",
                                        )}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground italic dark:text-slate-300/80"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {paginationConfig && totalPages > 0 ? (
                <div className="mt-3 px-3 pb-3">
                    {paginationConfig.onPageChange ? (
                        <StatePagination
                            totalPages={totalPages}
                            currentPage={page}
                            total={total}
                            onPageChange={paginationConfig.onPageChange}
                        />
                    ) : (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            total={total}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
}
