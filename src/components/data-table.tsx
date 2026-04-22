"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { type MouseEvent, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/pagination/Pagination";
import StatePagination from "@/components/pagination/StatePagination";
import { cn } from "@/lib/utils";

type PaginationConfig = {
    total: number;
    page: number;
    limit: number;
    onPageChange?: (page: number) => void;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    emptyMessage?: string;
    meta?: any;
    pagination?: PaginationConfig;
    onRowClick?: (row: TData) => void;
    rowClassName?: string | ((row: TData) => string);
    getRowId?: (originalRow: TData, index: number, parent?: any) => string;
    stickyColumns?: string[];
    stickyHeaderClassName?: string;
    stickyCellClassName?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    emptyMessage = "Không có dữ liệu",
    meta,
    pagination,
    onRowClick,
    rowClassName,
    getRowId,
    stickyColumns,
    stickyHeaderClassName,
    stickyCellClassName,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        meta,
        getRowId,
    });

    const stickySet = new Set(stickyColumns ?? []);
    const stickyClampClass = "max-w-[200px] sm:max-w-none truncate";

    const metaPagination = meta as PaginationConfig | undefined;
    const paginationConfig = pagination ?? metaPagination;
    const total = paginationConfig?.total ?? 0;
    const page = paginationConfig?.page ?? 1;
    const limit = paginationConfig?.limit ?? 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const shouldIgnoreRowClick = (
        event: MouseEvent<HTMLTableRowElement>,
    ) => {
        const target = event.target as HTMLElement;
        return !!target.closest(
            "button, input, textarea, a, svg, [role='checkbox'], [role='menuitem'], [data-no-row-open='true'], [data-radix-collection-item]",
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            <Table className="min-w-full">
                <TableHeader className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm bg-linear-to-r from-blue-50 to-yellow-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="hover:bg-primary/10 bg-primary/5 border-b border-gray-200"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        stickySet.has(header.column.id)
                                            ? cn(
                                                  "sticky left-0 z-30  backdrop-blur-3xl border-b border-border after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border/60",
                                                  stickyClampClass,
                                                  stickyHeaderClassName,
                                              )
                                            : undefined,
                                        "font-semibold text-gray-700",
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
                                    "border-gray-100 odd:bg-white even:bg-blue-50 hover:bg-blue-100/60",
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
                                                      "sticky left-0 z-30 backdrop-blur-3xl border-b border-border after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border/60",
                                                      stickyClampClass,
                                                      stickyCellClassName,
                                                  )
                                                : undefined,
                                            "text-gray-900",
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
                                className="h-24 text-center text-muted-foreground italic"
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
