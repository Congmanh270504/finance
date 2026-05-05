import { z } from "zod";

export const settlementListQuerySchema = z.object({
    groupId: z.string().trim().optional(),
    query: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const settlementCreateSchema = z.object({
    groupId: z.string().trim().min(1, "Please select a group."),
    toMemberId: z.string().trim().min(1, "Please select who you paid."),
    amount: z.coerce
        .number()
        .int()
        .positive("Amount must be greater than 0."),
    note: z
        .string()
        .trim()
        .max(500, "Note must be 500 characters or fewer.")
        .optional()
        .transform((value) => value || null),
    settledAt: z
        .string()
        .trim()
        .min(1, "Please select the payment date.")
        .refine(
            (value) => !Number.isNaN(Date.parse(value)),
            "Payment date is invalid.",
        )
        .transform((value) => new Date(value)),
});

export const settlementUpdateSchema = settlementCreateSchema.extend({
    id: z.string().trim().min(1, "Missing payment id."),
});

export const settlementDeleteSchema = z.object({
    id: z.string().trim().min(1, "Missing payment id."),
});

export type SettlementListQueryInput = z.infer<
    typeof settlementListQuerySchema
>;
export type SettlementCreateInput = z.infer<typeof settlementCreateSchema>;
export type SettlementUpdateInput = z.infer<typeof settlementUpdateSchema>;
export type SettlementDeleteInput = z.infer<typeof settlementDeleteSchema>;
