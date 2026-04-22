"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type {
    CreateMemberInput,
    UpdateMemberInput,
} from "@/features/members/schema";
import type {
    MemberFormValues,
    MemberGroupItem,
    MemberManagementItem,
} from "@/features/members/types";

type MemberFormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit" | "view";
    groups: MemberGroupItem[];
    initialMember?: MemberManagementItem | null;
    defaultGroupId?: string;
    submitting?: boolean;
    onSubmit: (values: CreateMemberInput | UpdateMemberInput) => void;
};

function normalizeLinkedGroups(
    linkedGroupIds?: string[],
    fallbackGroupId?: string,
) {
    return Array.from(
        new Set(
            [...(linkedGroupIds ?? []), fallbackGroupId ?? ""].filter(Boolean),
        ),
    );
}

function getInitialState(
    member: MemberManagementItem | null | undefined,
    defaultGroupId: string | undefined,
): MemberFormValues {
    return {
        name: member?.name ?? "",
        email: member?.email ?? "",
        imgUrl: member?.imgUrl ?? "",
        isActive: member?.isActive ?? true,
        linkedGroupIds: normalizeLinkedGroups(
            member?.linkedGroupIds,
            defaultGroupId,
        ),
    };
}

export function MemberFormSheet({
    open,
    onOpenChange,
    mode,
    groups,
    initialMember,
    defaultGroupId,
    submitting = false,
    onSubmit,
}: MemberFormSheetProps) {
    const formId = "member-form-sheet";
    const [form, setForm] = React.useState<MemberFormValues>(() =>
        getInitialState(initialMember, defaultGroupId),
    );

    const readOnly = mode === "view";
    const dateFormatter = React.useMemo(
        () =>
            new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [],
    );

    React.useEffect(() => {
        if (!open) return;
        setForm(getInitialState(initialMember, defaultGroupId));
    }, [defaultGroupId, initialMember, open]);

    function updateField<K extends keyof MemberFormValues>(
        key: K,
        value: MemberFormValues[K],
    ) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function toggleLinkedGroup(groupId: string, checked: boolean) {
        setForm((current) => ({
            ...current,
            linkedGroupIds: checked
                ? normalizeLinkedGroups([...current.linkedGroupIds, groupId])
                : current.linkedGroupIds.filter((item) => item !== groupId),
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (readOnly) return;

        const payload = {
            ...form,
            imgUrl: (form.imgUrl ?? "").trim(),
            linkedGroupIds: normalizeLinkedGroups(form.linkedGroupIds),
        };

        if (mode === "edit" && initialMember) {
            onSubmit({
                id: initialMember.id,
                ...payload,
            });
            return;
        }

        onSubmit(payload);
    }

    const linkedGroupsLabel =
        form.linkedGroupIds.length === 0
            ? "Select linked groups"
            : `${form.linkedGroupIds.length} groups selected`;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-xl"
            >
                <SheetHeader>
                    <SheetTitle>
                        {mode === "create"
                            ? "Create Member"
                            : mode === "edit"
                              ? "Update Member"
                              : "Member Details"}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === "create"
                            ? "Enter member information and assign linked groups."
                            : mode === "edit"
                              ? "Edit member information directly in the members feature."
                              : "Quickly view current member information."}
                    </SheetDescription>
                </SheetHeader>

                <form
                    id={formId}
                    onSubmit={handleSubmit}
                    className="space-y-4 px-4 py-4"
                >
                    <div className="flex justify-center pt-2">
                        <div className="space-y-2 text-center">
                            <Label className="text-sm font-medium">
                                Profile Image
                            </Label>
                            <ImageUpload
                                value={form.imgUrl ?? undefined}
                                onChange={(url) => updateField("imgUrl", url)}
                                disabled={readOnly || submitting}
                                size={96}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                            Member Name
                        </Label>
                        <Input
                            value={form.name}
                            onChange={(event) =>
                                updateField("name", event.target.value)
                            }
                            placeholder="Example: John Doe"
                            disabled={readOnly || submitting}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Email</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    updateField("email", event.target.value)
                                }
                                placeholder="member@example.com"
                                disabled={readOnly || submitting}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Status
                            </Label>
                            <Select
                                value={form.isActive ? "active" : "inactive"}
                                onValueChange={(value) =>
                                    updateField("isActive", value === "active")
                                }
                                disabled={readOnly || submitting}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Groups</Label>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                    disabled={
                                        readOnly ||
                                        submitting ||
                                        groups.length === 0
                                    }
                                >
                                    <span className="truncate">
                                        {groups.length === 0
                                            ? "No groups available"
                                            : linkedGroupsLabel}
                                    </span>
                                    <ChevronDown className="size-4 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[var(--radix-dropdown-menu-trigger-width)]"
                                align="start"
                            >
                                <DropdownMenuLabel>
                                    Select linked groups
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {groups.map((group) => (
                                    <DropdownMenuCheckboxItem
                                        key={group.id}
                                        checked={form.linkedGroupIds.includes(
                                            group.id,
                                        )}
                                        disabled={readOnly}
                                        closeOnSelect={false}
                                        onCheckedChange={(value) =>
                                            toggleLinkedGroup(
                                                group.id,
                                                value === true,
                                            )
                                        }
                                    >
                                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                            <span className="truncate">
                                                {group.name}
                                            </span>
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-xs text-muted-foreground">
                            Checkbox selections stay open until you click
                            outside.
                        </p>
                    </div>
                </form>

                <SheetFooter className="border-t bg-background/95">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        {readOnly ? "Close" : "Cancel"}
                    </Button>
                    {!readOnly ? (
                        <Button
                            type="submit"
                            form={formId}
                            disabled={submitting || groups.length === 0}
                        >
                            {submitting
                                ? "Saving..."
                                : mode === "create"
                                  ? "Create Member"
                                  : "Save Changes"}
                        </Button>
                    ) : null}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
