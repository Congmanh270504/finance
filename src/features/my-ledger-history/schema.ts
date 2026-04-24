import { z } from "zod";

export const myLedgerHistoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    query: z.string().trim().optional(),
    groupId: z.string().trim().optional(),
});

export type MyLedgerHistoryQuery = z.infer<typeof myLedgerHistoryQuerySchema>;
