import { z } from "zod";

const optionalUrlText = z
    .string()
    .trim()
    .max(2048, "Image URL is too long")
    .optional()
    .or(z.literal(""));

const linkedGroupIdsSchema = z
    .array(z.string().trim().min(1))
    .min(1, "Please select at least one group");

const memberBaseSchema = z.object({
    name: z.string().trim().min(1, "Member name is required"),
    email: z.string().trim().email("Email is invalid"),
    imgUrl: optionalUrlText,
    linkedGroupIds: linkedGroupIdsSchema,
    isActive: z.boolean(),
});

const optionalPasswordText = z
    .string()
    .trim()
    .max(128, "Password is too long")
    .optional()
    .or(z.literal(""));

export const createMemberSchema = memberBaseSchema.extend({
    password: z
        .string()
        .trim()
        .min(6, "Password must be at least 6 characters"),
});

export const updateMemberSchema = memberBaseSchema.extend({
    id: z.string().trim().min(1, "Member ID is required"),
    password: optionalPasswordText,
});

export const assignExistingMembersSchema = z.object({
    userIds: z
        .array(z.string().trim().min(1))
        .min(1, "Please select at least one user"),
    linkedGroupIds: linkedGroupIdsSchema,
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type AssignExistingMembersInput = z.infer<
    typeof assignExistingMembersSchema
>;
