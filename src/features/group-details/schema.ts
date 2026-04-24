import { z } from "zod";

export const groupLedgerDetailQuerySchema = z.object({
    groupId: z.string().trim().min(1, "Group ID is required"),
    query: z.string().optional().default(""),
    memberId: z.string().optional().default(""),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GroupLedgerDetailQueryInput = z.infer<
    typeof groupLedgerDetailQuerySchema
>;
