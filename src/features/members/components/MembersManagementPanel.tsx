"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "@/components/delete-dialog";
import { GroupedAccordionTable } from "@/components/grouped-accordion-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    assignExistingMembersToGroupsAction,
    createMemberAction,
    deleteMemberAction,
    updateMemberAction,
} from "@/features/members/action";
import { createMemberColumns } from "@/features/members/components/columns";
import { MemberFormSheet } from "@/features/members/components/MemberFormSheet";
import type {
    AssignExistingMembersInput,
    CreateMemberInput,
    UpdateMemberInput,
} from "@/features/members/schema";
import type {
    MemberFormMode,
    MemberManagementItem,
    MembersManagementData,
    MemberStatusFilter,
} from "@/features/members/types";

type MembersManagementPanelProps = {
    data: MembersManagementData;
    isDemo?: boolean;
    onMembersChange: (members: MemberManagementItem[]) => void;
};

function buildDemoId(prefix: string) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}`;
}

export function MembersManagementPanel({
    data,
    isDemo = false,
    onMembersChange,
}: MembersManagementPanelProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const deferredQuery = React.useDeferredValue(
        searchParams.get("member-q")?.trim() ?? "",
    );

    const [selectedMember, setSelectedMember] =
        React.useState<MemberManagementItem | null>(null);
    const [memberFormMode, setMemberFormMode] =
        React.useState<MemberFormMode>("view");
    const [memberSheetOpen, setMemberSheetOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] =
        React.useState<MemberManagementItem | null>(null);
    const [submittingMember, setSubmittingMember] = React.useState(false);
    const [deletingMemberId, setDeletingMemberId] = React.useState<
        string | null
    >(null);

    const groupFilter = searchParams.get("member-group") ?? "all";
    const statusFilter =
        (searchParams.get("member-status") as MemberStatusFilter | null) ??
        "all";

    function replaceParams(updates: Record<string, string | null | undefined>) {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname);
    }

    const filteredMembers = React.useMemo(() => {
        return data.members.filter((member) => {
            const matchesQuery =
                deferredQuery.length === 0 ||
                [member.name, member.email, member.linkedGroupLabel]
                    .join(" ")
                    .toLowerCase()
                    .includes(deferredQuery.toLowerCase());

            const matchesGroup =
                groupFilter === "all" ||
                member.linkedGroupIds.includes(groupFilter);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && member.isActive) ||
                (statusFilter === "inactive" && !member.isActive);

            return matchesQuery && matchesGroup && matchesStatus;
        });
    }, [data.members, deferredQuery, groupFilter, statusFilter]);

    const groupedSections = React.useMemo(
        () =>
            data.groups
                .filter((group) =>
                    groupFilter === "all" ? true : group.id === groupFilter,
                )
                .map((group) => ({
                    key: group.id,
                    label: `${group.name} (${group.currency})`,
                    action: (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-sky-300/80 bg-white/90"
                        >
                            <Link href={`/groups/${group.id}`}>
                                Group details
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </Button>
                    ),
                    items: filteredMembers
                        .filter((member) => member.linkedGroupIds.includes(group.id))
                        .map((member) => {
                            const perGroupStats = member.groupLedgerStats[group.id];
                            return {
                                ...member,
                                oweAmount: perGroupStats?.oweAmount ?? 0,
                                receiveAmount: perGroupStats?.receiveAmount ?? 0,
                                netAmount: perGroupStats?.netAmount ?? 0,
                                ledgerCount: perGroupStats?.ledgerCount ?? 0,
                            };
                        }),
                }))
                .filter((group) => group.items.length > 0),
        [data.groups, filteredMembers, groupFilter],
    );

    function openCreateMember() {
        setMemberFormMode("create");
        setSelectedMember(null);
        setMemberSheetOpen(true);
    }

    function openViewMember(member: MemberManagementItem) {
        setSelectedMember(member);
        setMemberFormMode("view");
        setMemberSheetOpen(true);
    }

    function openEditMember(member: MemberManagementItem) {
        setSelectedMember(member);
        setMemberFormMode("edit");
        setMemberSheetOpen(true);
    }

    async function handleSubmitMember(
        values:
            | CreateMemberInput
            | UpdateMemberInput
            | AssignExistingMembersInput,
    ) {
        setSubmittingMember(true);

        try {
            if ("userIds" in values) {
                if (isDemo) {
                    const selectedSet = new Set(values.userIds);
                    onMembersChange(
                        data.members.map((member) => {
                            if (!selectedSet.has(member.id)) {
                                return member;
                            }

                            const nextLinkedGroupIds = Array.from(
                                new Set([
                                    ...member.linkedGroupIds,
                                    ...values.linkedGroupIds,
                                ]),
                            );
                            const nextLinkedGroupNames = data.groups
                                .filter((group) =>
                                    nextLinkedGroupIds.includes(group.id),
                                )
                                .map((group) => group.name);

                            return {
                                ...member,
                                linkedGroupIds: nextLinkedGroupIds,
                                linkedGroupNames: nextLinkedGroupNames,
                                linkedGroupLabel:
                                    nextLinkedGroupNames.length > 0
                                        ? nextLinkedGroupNames.join(", ")
                                        : "No groups assigned",
                            };
                        }),
                    );
                } else {
                    const result =
                        await assignExistingMembersToGroupsAction(values);
                    if (!result.success || !result.data) {
                        throw new Error(
                            result.error ?? "Unable to assign users to groups",
                        );
                    }

                    const updatedMap = new Map(
                        result.data.map((member) => [member.id, member]),
                    );
                    onMembersChange(
                        data.members.map((member) =>
                            updatedMap.get(member.id) ?? member,
                        ),
                    );
                    router.refresh();
                }
            } else if ("id" in values) {
                if (isDemo) {
                    const currentMember = data.members.find(
                        (member) => member.id === values.id,
                    );
                    if (!currentMember) {
                        throw new Error("Member not found for update");
                    }

                    const nextLinkedGroupNames = data.groups
                        .filter((group) =>
                            values.linkedGroupIds.includes(group.id),
                        )
                        .map((group) => group.name);

                    onMembersChange(
                        data.members.map((member) =>
                            member.id === values.id
                                ? {
                                      ...member,
                                      ...values,
                                      imgUrl: values.imgUrl || null,
                                      linkedGroupIds: values.linkedGroupIds,
                                      linkedGroupNames: nextLinkedGroupNames,
                                      linkedGroupLabel:
                                          nextLinkedGroupNames.length > 0
                                              ? nextLinkedGroupNames.join(", ")
                                              : "No groups assigned",
                                  }
                                : member,
                        ),
                    );
                } else {
                    const result = await updateMemberAction(values);
                    if (!result.success || !result.data) {
                        throw new Error(
                            result.error ?? "Unable to update member",
                        );
                    }

                    const updatedMember = result.data;
                    onMembersChange(
                        data.members.map((member) =>
                            member.id === updatedMember.id
                                ? updatedMember
                                : member,
                        ),
                    );
                    router.refresh();
                }
            } else if (isDemo) {
                const now = new Date();
                const linkedGroupNames = data.groups
                    .filter((group) => values.linkedGroupIds.includes(group.id))
                    .map((group) => group.name);
                const newMember: MemberManagementItem = {
                    id: buildDemoId("demo-member"),
                    name: values.name,
                    email: values.email,
                    nickname: null,
                    passwordHash: null,
                    phone: null,
                    address: null,
                    imgUrl: values.imgUrl || null,
                    username: null,
                    bio: null,
                    pronouns: null,
                    profileUrl: null,
                    company: null,
                    location: null,
                    avatarTone: null,
                    linkedGroupIds: values.linkedGroupIds,
                    linkedGroupNames,
                    isActive: values.isActive,
                    createdAt: now,
                    updatedAt: now,
                    linkedGroupLabel:
                        linkedGroupNames.length > 0
                            ? linkedGroupNames.join(", ")
                            : "No groups assigned",
                    netAmount: 0,
                    oweAmount: 0,
                    receiveAmount: 0,
                    ledgerCount: 0,
                    groupLedgerStats: {},
                };

                onMembersChange([newMember, ...data.members]);
            } else {
                const result = await createMemberAction(values);
                if (!result.success || !result.data) {
                    throw new Error(result.error ?? "Unable to create member");
                }

                onMembersChange([result.data, ...data.members]);
                router.refresh();
            }

            setMemberSheetOpen(false);
            setSelectedMember(null);
            toast.success("Member saved");
        } catch (error) {
            toast.error("Failed to save member", {
                description:
                    error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setSubmittingMember(false);
        }
    }

    async function handleDeleteMember() {
        if (!deleteTarget) return;

        setDeletingMemberId(deleteTarget.id);

        try {
            if (isDemo) {
                onMembersChange(
                    data.members.filter(
                        (member) => member.id !== deleteTarget.id,
                    ),
                );
            } else {
                const result = await deleteMemberAction(deleteTarget.id);
                if (!result.success) {
                    throw new Error(result.error ?? "Unable to delete member");
                }

                onMembersChange(
                    data.members.filter(
                        (member) => member.id !== deleteTarget.id,
                    ),
                );
                router.refresh();
            }

            setDeleteTarget(null);
            toast.success("Member deleted");
        } catch (error) {
            toast.error("Failed to delete member", {
                description:
                    error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setDeletingMemberId(null);
        }
    }

    const columns = React.useMemo(
        () =>
            createMemberColumns({
                groups: data.groups,
                onView: openViewMember,
                onStartEdit: openEditMember,
                onDelete: setDeleteTarget,
            }),
        [data.groups],
    );

    const defaultGroupId =
        groupFilter !== "all"
            ? groupFilter
            : (data.groups[0]?.id ?? selectedMember?.linkedGroupIds[0] ?? "");

    return (
        <div className="space-y-4">
            <Card className="py-0">
                <CardHeader className="space-y-4 px-4 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Members by group
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Browse members grouped by team and manage them
                                directly from one screen.
                            </p>
                        </div>
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={openCreateMember}
                            disabled={data.groups.length === 0}
                        >
                            <Plus className="size-4" />
                            Add Member
                        </Button>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchParams.get("member-q") ?? ""}
                                onChange={(event) =>
                                    replaceParams({
                                        "member-q": event.target.value,
                                    })
                                }
                                placeholder="Search by name, email, or group..."
                                className="pl-9"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
                            <Select
                                value={groupFilter}
                                onValueChange={(value) =>
                                    replaceParams({ "member-group": value })
                                }
                            >
                                <SelectTrigger className="min-w-44">
                                    <SelectValue placeholder="All groups" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All groups
                                    </SelectItem>
                                    {data.groups.map((group) => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    replaceParams({ "member-status": value })
                                }
                            >
                                <SelectTrigger className="min-w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
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
                </CardHeader>

                <CardContent className="px-4 pb-4">
                    <GroupedAccordionTable
                        columns={columns}
                        groups={groupedSections}
                        onRowClick={openViewMember}
                        activeRowId={selectedMember?.id}
                        emptyMessage="No members match the current filters."
                    />
                </CardContent>
            </Card>

            <MemberFormSheet
                open={memberSheetOpen}
                onOpenChange={setMemberSheetOpen}
                mode={memberFormMode}
                groups={data.groups}
                availableUsers={data.members.map((member) => ({
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    imgUrl: member.imgUrl,
                    isActive: member.isActive,
                    linkedGroupIds: member.linkedGroupIds,
                }))}
                initialMember={selectedMember}
                defaultGroupId={defaultGroupId}
                submitting={submittingMember}
                onSubmit={handleSubmitMember}
            />

            <DeleteDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                onConfirm={handleDeleteMember}
                loading={deletingMemberId !== null}
                title="Delete member"
                description={
                    deleteTarget
                        ? `Are you sure you want to delete ${deleteTarget.name}?`
                        : "Are you sure you want to delete this member?"
                }
            />
        </div>
    );
}
