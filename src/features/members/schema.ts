import { z } from "zod";

const optionalUrlText = z
    .string()
    .trim()
    .max(2048, "Lien ket anh qua dai")
    .optional()
    .or(z.literal(""));

const linkedGroupIdsSchema = z
    .array(z.string().trim().min(1))
    .min(1, "Vui long chon it nhat 1 group");

const memberBaseSchema = z.object({
    name: z.string().trim().min(1, "Ten thanh vien la bat buoc"),
    email: z.string().trim().email("Email khong hop le"),
    imgUrl: optionalUrlText,
    linkedGroupIds: linkedGroupIdsSchema,
    isActive: z.boolean(),
});

export const createMemberSchema = memberBaseSchema;

export const updateMemberSchema = memberBaseSchema.extend({
    id: z.string().trim().min(1, "Thieu member id"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
