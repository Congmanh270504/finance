"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
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
    createMemberAction,
    deleteMemberAction,
    updateMemberAction,
} from "@/features/members/action";
import { createMemberColumns } from "@/features/members/components/columns";
import { MemberFormSheet } from "@/features/members/components/MemberFormSheet";
import type {
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
                    items: filteredMembers.filter((member) =>
                        member.linkedGroupIds.includes(group.id),
                    ),
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
        values: CreateMemberInput | UpdateMemberInput,
    ) {
        setSubmittingMember(true);

        try {
            if ("id" in values) {
                if (isDemo) {
                    const currentMember = data.members.find(
                        (member) => member.id === values.id,
                    );
                    if (!currentMember) {
                        throw new Error("Khong tim thay member de cap nhat");
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
                                              : "Chua co group",
                                  }
                                : member,
                        ),
                    );
                } else {
                    const result = await updateMemberAction(values);
                    if (!result.success || !result.data) {
                        throw new Error(
                            result.error ?? "Khong the cap nhat member",
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
                    imgUrl: values.imgUrl || null,
                    linkedGroupIds: values.linkedGroupIds,
                    linkedGroupNames,
                    isActive: values.isActive,
                    createdAt: now,
                    updatedAt: now,
                    linkedGroupLabel:
                        linkedGroupNames.length > 0
                            ? linkedGroupNames.join(", ")
                            : "Chua co group",
                    netAmount: 0,
                    oweAmount: 0,
                    receiveAmount: 0,
                    ledgerCount: 0,
                };

                onMembersChange([newMember, ...data.members]);
            } else {
                const result = await createMemberAction(values);
                if (!result.success || !result.data) {
                    throw new Error(result.error ?? "Khong the tao member");
                }

                onMembersChange([result.data, ...data.members]);
                router.refresh();
            }

            setMemberSheetOpen(false);
            setSelectedMember(null);
            toast.success("Da luu member");
        } catch (error) {
            toast.error("Luu member that bai", {
                description:
                    error instanceof Error ? error.message : "Vui long thu lai",
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
                    throw new Error(result.error ?? "Khong the xoa member");
                }

                onMembersChange(
                    data.members.filter(
                        (member) => member.id !== deleteTarget.id,
                    ),
                );
                router.refresh();
            }

            setDeleteTarget(null);
            toast.success("Da xoa member");
        } catch (error) {
            toast.error("Xoa member that bai", {
                description:
                    error instanceof Error ? error.message : "Vui long thu lai",
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
                                Member grouped table
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Danh sach member duoc nhom theo group va CRUD
                                truc tiep tren cung man hinh.
                            </p>
                        </div>
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={openCreateMember}
                            disabled={data.groups.length === 0}
                        >
                            <Plus className="size-4" />
                            Create Member
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
                                placeholder="Tim theo ten, email, group..."
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
                                    <SelectValue placeholder="Tat ca group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tat ca group
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
                                        Tat ca trang thai
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Dang hoat dong
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Tam ngung
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
                        emptyMessage="Khong co member phu hop voi bo loc hien tai"
                    />
                </CardContent>
            </Card>

            <MemberFormSheet
                open={memberSheetOpen}
                onOpenChange={setMemberSheetOpen}
                mode={memberFormMode}
                groups={data.groups}
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
                title="Xoa member"
                description={
                    deleteTarget
                        ? `Ban co chac muon xoa ${deleteTarget.name}?`
                        : "Ban co chac muon xoa member nay?"
                }
            />
        </div>
    );
}
