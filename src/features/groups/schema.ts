import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Ten group la bat buoc"),
    currency: z.string().trim().min(1, "Loai tien la bat buoc").max(10),
});

export const updateGroupSchema = createGroupSchema.extend({
    id: z.string().trim().min(1, "Thieu group id"),
});

export const reorderGroupsSchema = z.object({
    orderedIds: z.array(z.string().trim().min(1, "Thieu group id")).min(1),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type ReorderGroupsInput = z.infer<typeof reorderGroupsSchema>;
