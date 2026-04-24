import { ShareStrategy } from "@prisma/client";
import { z } from "zod";

export const expenseListQuerySchema = z.object({
    groupId: z.string().trim().optional(),
    query: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const expenseDeleteSchema = z.object({
    id: z.string().min(1, "Missing expense id."),
});

export const expenseCreateSchema = z
    .object({
        groupId: z.string().trim().min(1, "Please select a group."),
        title: z.string().trim().min(1, "Please enter an expense title."),
        amount: z.coerce
            .number()
            .int()
            .positive("Amount must be greater than 0."),
        paidByMemberId: z.string().trim().min(1, "Please select the payer."),
        shareStrategy: z.nativeEnum(ShareStrategy).default(ShareStrategy.EQUAL),
        notes: z
            .string()
            .trim()
            .max(500, "Notes must be 500 characters or fewer.")
            .optional()
            .transform((value) => value || null),
        occurredAt: z
            .string()
            .trim()
            .min(1, "Please select the expense date.")
            .refine(
                (value) => !Number.isNaN(Date.parse(value)),
                "Expense date is invalid.",
            )
            .transform((value) => new Date(value)),
        splitShares: z
            .array(
                z.object({
                    memberId: z.string().trim().min(1, "Missing member id."),
                    shareAmount: z.coerce
                        .number()
                        .int()
                        .nonnegative("Allocated amount is invalid."),
                }),
            )
            .min(1, "Select at least one participant."),
    })
    .superRefine((value, ctx) => {
        const uniqueMemberIds = new Set(
            value.splitShares.map((item) => item.memberId),
        );

        if (uniqueMemberIds.size !== value.splitShares.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["splitShares"],
                message: "Participants contain duplicate members.",
            });
        }

        const totalShare = value.splitShares.reduce(
            (sum, item) => sum + item.shareAmount,
            0,
        );

        if (totalShare !== value.amount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["splitShares"],
                message: "Allocated amount must match the total expense.",
            });
        }
    });

export type ExpenseListQueryInput = z.infer<typeof expenseListQuerySchema>;
export type ExpenseDeleteInput = z.infer<typeof expenseDeleteSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
