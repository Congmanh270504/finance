import { z } from "zod";

export const expenseListQuerySchema = z.object({
    groupId: z.string().min(1, "Thiếu groupId"),
    query: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const expenseDeleteSchema = z.object({
    id: z.string().min(1, "Thiếu mã khoản chi"),
});

export type ExpenseListQueryInput = z.infer<typeof expenseListQuerySchema>;
export type ExpenseDeleteInput = z.infer<typeof expenseDeleteSchema>;
