"use client";

import * as React from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { toast } from "sonner";
import { Check, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import DeleteDialog from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    createGroupAction,
    deleteGroupAction,
    reorderGroupsAction,
    updateGroupAction,
} from "@/features/groups/action";
import type {
    CreateGroupInput,
    UpdateGroupInput,
} from "@/features/groups/schema";
import type { GroupCrudItem } from "@/features/groups/types";
import {
    reorderGroupsByIds,
    sortGroupsByOrder,
} from "@/features/groups/utils";
import { cn } from "@/lib/utils";

type GroupCrudDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: GroupCrudItem[];
    isDemo?: boolean;
    onCreated: (group: GroupCrudItem) => void;
    onReordered: (groups: GroupCrudItem[]) => void;
    onUpdated: (group: GroupCrudItem) => void;
    onDeleted: (groupId: string) => void;
};

type DraftValue = {
    name: string;
    currency: string;
};

type DraftState = Record<string, DraftValue>;

type GroupTableRow = {
    id: string;
    name: string;
    currency: string;
    order?: number | null;
    memberCount: number;
    activeMemberCount: number;
    isNew?: boolean;
};

type SubmitAction = "create" | "update" | "delete" | "reorder";

type SubmitState = {
    action: SubmitAction;
    rowId: string | null;
} | null;

type GroupTableMeta = {
    editingId: string | null;
    isBusy: boolean;
    isReordering: boolean;
    isEditing: (rowId: string) => boolean;
    isSaving: (rowId: string) => boolean;
    isDeleting: (rowId: string) => boolean;
    getDraft: (row: GroupTableRow) => DraftValue;
    updateDraft: (
        rowId: string,
        field: keyof DraftValue,
        value: string,
    ) => void;
    beginEdit: (row: GroupTableRow) => void;
    cancelEdit: (rowId: string) => void;
    saveRow: (row: GroupTableRow) => Promise<void>;
    requestDelete: (row: GroupTableRow) => void;
    dragDisabled: boolean;
};

const NEW_ROW_ID = "__new-group__";
const SORTABLE_GROUP_ID = "groups-crud-table";
const DEFAULT_DRAFT: DraftValue = {
    name: "",
    currency: "VND",
};

function buildDemoId(prefix: string) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}`;
}

function getNextLocalGroupOrder(groups: GroupCrudItem[]) {
    return groups.reduce((maxOrder, group) => {
        return Math.max(maxOrder, group.order ?? -1);
    }, -1) + 1;
}

function GroupSortableRow({
    row,
    index,
    meta,
}: {
    row: GroupTableRow;
    index: number;
    meta: GroupTableMeta;
}) {
    const {
        ref,
        handleRef,
        isDragSource,
        isDropTarget,
    } = useSortable({
        id: row.id,
        index,
        group: SORTABLE_GROUP_ID,
        disabled: meta.dragDisabled || row.isNew,
    });

    const isEditing = meta.isEditing(row.id);
    const isSaving = meta.isSaving(row.id);
    const isDeleting = meta.isDeleting(row.id);
    const draft = meta.getDraft(row);
    const actionsDisabled =
        meta.isBusy ||
        (meta.editingId !== null && meta.editingId !== row.id) ||
        isDeleting;

    return (
        <tr
            ref={ref}
            data-slot="table-row"
            className={cn(
                "border-b transition-colors border-gray-100 odd:bg-white even:bg-blue-50 hover:bg-blue-100/60",
                row.isNew && "bg-emerald-50/70",
                isDropTarget && "bg-blue-100/90",
                isDragSource && "opacity-60",
            )}
        >
            <TableCell className="w-12 text-center">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={meta.dragDisabled || row.isNew}
                    className="cursor-grab active:cursor-grabbing"
                    aria-label={`Move ${row.name || "group"}`}
                >
                    <span ref={handleRef} className="inline-flex">
                        <GripVertical className="size-4 text-muted-foreground" />
                    </span>
                </Button>
            </TableCell>
            <TableCell className="min-w-[220px]">
                {isEditing ? (
                    <Input
                        value={draft.name}
                        onChange={(event) =>
                            meta.updateDraft(row.id, "name", event.target.value)
                        }
                        placeholder="Group name"
                        disabled={isSaving}
                        className="min-w-[220px]"
                    />
                ) : (
                    <div className="font-medium">{row.name}</div>
                )}
            </TableCell>
            <TableCell className="text-center">
                {isEditing ? (
                    <div className="flex justify-center">
                        <Input
                            value={draft.currency}
                            onChange={(event) =>
                                meta.updateDraft(
                                    row.id,
                                    "currency",
                                    event.target.value,
                                )
                            }
                            placeholder="VND"
                            disabled={isSaving}
                            className="w-30"
                        />
                    </div>
                ) : (
                    <div className="font-medium text-muted-foreground">
                        {row.currency}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-center">
                {row.isNew ? "-" : row.memberCount}
            </TableCell>
            <TableCell className="text-center">
                {row.isNew ? "-" : row.activeMemberCount}
            </TableCell>
            <TableCell className="w-[140px]">
                {isEditing ? (
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            size="sm"
                            className="bg-green-700"
                            onClick={() => void meta.saveRow(row)}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Spinner className="size-4" />
                            ) : (
                                <Check className="size-4" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => meta.cancelEdit(row.id)}
                            disabled={isSaving}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => meta.beginEdit(row)}
                            disabled={actionsDisabled}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-rose-600"
                            onClick={() => meta.requestDelete(row)}
                            disabled={actionsDisabled}
                        >
                            {isDeleting ? (
                                <Spinner className="size-4" />
                            ) : (
                                <Trash2 className="size-4" />
                            )}
                        </Button>
                    </div>
                )}
            </TableCell>
        </tr>
    );
}

export function GroupCrudDialog({
    open,
    onOpenChange,
    groups,
    isDemo = false,
    onCreated,
    onReordered,
    onUpdated,
    onDeleted,
}: GroupCrudDialogProps) {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [drafts, setDrafts] = React.useState<DraftState>({});
    const [submitState, setSubmitState] = React.useState<SubmitState>(null);
    const [deleteTarget, setDeleteTarget] =
        React.useState<GroupCrudItem | null>(null);

    React.useEffect(() => {
        if (!open) {
            setEditingId(null);
            setDrafts({});
            setDeleteTarget(null);
            setSubmitState(null);
        }
    }, [open]);

    const orderedGroups = React.useMemo(
        () => sortGroupsByOrder(groups),
        [groups],
    );

    const updateDraft = React.useCallback(
        (rowId: string, field: keyof DraftValue, value: string) => {
            setDrafts((current) => ({
                ...current,
                [rowId]: {
                    ...(current[rowId] ?? DEFAULT_DRAFT),
                    [field]: value,
                },
            }));
        },
        [],
    );

    const cancelEdit = React.useCallback((rowId: string) => {
        setEditingId((current) => (current === rowId ? null : current));
        setDrafts((current) => {
            const next = { ...current };
            delete next[rowId];
            return next;
        });
    }, []);

    const beginEdit = React.useCallback((row: GroupTableRow) => {
        if (row.isNew) return;

        setEditingId(row.id);
        setDrafts((current) => ({
            ...current,
            [row.id]: {
                name: row.name,
                currency: row.currency,
            },
        }));
    }, []);

    const startCreate = React.useCallback(() => {
        setEditingId(NEW_ROW_ID);
        setDrafts((current) => ({
            ...current,
            [NEW_ROW_ID]: current[NEW_ROW_ID] ?? DEFAULT_DRAFT,
        }));
    }, []);

    const handleCreateGroup = React.useCallback(async () => {
        const draft = drafts[NEW_ROW_ID];
        if (!draft) return;

        const payload: CreateGroupInput = {
            name: draft.name,
            currency: draft.currency,
        };

        setSubmitState({
            action: "create",
            rowId: NEW_ROW_ID,
        });

        try {
            if (isDemo) {
                const now = new Date();
                onCreated({
                    id: buildDemoId("demo-group"),
                    name: payload.name.trim(),
                    currency: payload.currency.trim().toUpperCase(),
                    order: getNextLocalGroupOrder(orderedGroups),
                    createdAt: now,
                    updatedAt: now,
                    memberCount: 0,
                    activeMemberCount: 0,
                });
            } else {
                const result = await createGroupAction(payload);
                if (!result.success || !result.data) {
                    throw new Error(result.error ?? "Unable to create group");
                }

                onCreated(result.data);
            }

            cancelEdit(NEW_ROW_ID);
            toast.success("Group created");
        } catch (error) {
            toast.error("Failed to create group", {
                description:
                    error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setSubmitState(null);
        }
    }, [cancelEdit, drafts, isDemo, onCreated, orderedGroups]);

    const handleUpdateGroup = React.useCallback(
        async (groupId: string) => {
            const draft = drafts[groupId];
            if (!draft) return;

            const payload: UpdateGroupInput = {
                id: groupId,
                name: draft.name,
                currency: draft.currency,
            };

            setSubmitState({
                action: "update",
                rowId: groupId,
            });

            try {
                if (isDemo) {
                    const current = orderedGroups.find(
                        (group) => group.id === groupId,
                    );
                    if (!current) {
                        throw new Error("Group to update was not found");
                    }

                    onUpdated({
                        ...current,
                        name: payload.name.trim(),
                        currency: payload.currency.trim().toUpperCase(),
                    });
                } else {
                    const result = await updateGroupAction(payload);
                    if (!result.success || !result.data) {
                        throw new Error(
                            result.error ?? "Unable to update group",
                        );
                    }

                    onUpdated(result.data);
                }

                cancelEdit(groupId);
                toast.success("Group updated");
            } catch (error) {
                toast.error("Failed to update group", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Please try again",
                });
            } finally {
                setSubmitState(null);
            }
        },
        [cancelEdit, drafts, isDemo, onUpdated, orderedGroups],
    );

    const handleReorderGroups = React.useCallback(
        async (sourceId: string, targetId: string) => {
            if (
                editingId !== null ||
                submitState !== null ||
                deleteTarget !== null
            ) {
                return;
            }

            const previousGroups = orderedGroups;
            const reorderedGroups = reorderGroupsByIds(
                previousGroups,
                sourceId,
                targetId,
            );

            if (reorderedGroups === previousGroups) {
                return;
            }

            onReordered(reorderedGroups);
            setSubmitState({
                action: "reorder",
                rowId: sourceId,
            });

            try {
                if (!isDemo) {
                    const result = await reorderGroupsAction({
                        orderedIds: reorderedGroups.map((group) => group.id),
                    });

                    if (!result.success) {
                        throw new Error(
                            result.error ?? "Unable to reorder groups",
                        );
                    }
                }

                toast.success("Group order updated");
            } catch (error) {
                onReordered(previousGroups);
                toast.error("Failed to update group order", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Please try again",
                });
            } finally {
                setSubmitState(null);
            }
        },
        [deleteTarget, editingId, isDemo, onReordered, orderedGroups, submitState],
    );

    const handleDeleteGroup = React.useCallback(async () => {
        if (!deleteTarget) return;

        setSubmitState({
            action: "delete",
            rowId: deleteTarget.id,
        });

        try {
            if (isDemo) {
                if (deleteTarget.memberCount > 0) {
                    throw new Error(
                        "Cannot delete a group that still has members",
                    );
                }

                onDeleted(deleteTarget.id);
            } else {
                const result = await deleteGroupAction(deleteTarget.id);
                if (!result.success) {
                    throw new Error(result.error ?? "Unable to delete group");
                }

                onDeleted(deleteTarget.id);
            }

            toast.success("Group deleted");
            setDeleteTarget(null);
        } catch (error) {
            toast.error("Failed to delete group", {
                description:
                    error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setSubmitState(null);
        }
    }, [deleteTarget, isDemo, onDeleted]);

    const tableRows = React.useMemo<GroupTableRow[]>(() => {
        const mappedGroups = orderedGroups.map((group) => ({
            id: group.id,
            name: group.name,
            currency: group.currency,
            order: group.order,
            memberCount: group.memberCount,
            activeMemberCount: group.activeMemberCount,
        }));

        if (editingId === NEW_ROW_ID) {
            return [
                {
                    id: NEW_ROW_ID,
                    name: "",
                    currency: "VND",
                    order: -1,
                    memberCount: 0,
                    activeMemberCount: 0,
                    isNew: true,
                },
                ...mappedGroups,
            ];
        }

        return mappedGroups;
    }, [editingId, orderedGroups]);

    const createDisabled = editingId !== null || submitState !== null;
    const dragDisabled =
        editingId !== null || submitState !== null || deleteTarget !== null;
    const isReordering = submitState?.action === "reorder";

    const tableMeta = React.useMemo<GroupTableMeta>(
        () => ({
            editingId,
            isBusy: submitState !== null,
            isReordering,
            isEditing: (rowId) => editingId === rowId,
            isSaving: (rowId) =>
                submitState?.rowId === rowId &&
                (submitState.action === "create" ||
                    submitState.action === "update"),
            isDeleting: (rowId) =>
                submitState?.rowId === rowId &&
                submitState.action === "delete",
            getDraft: (row) =>
                drafts[row.id] ?? {
                    name: row.name,
                    currency: row.currency,
                },
            updateDraft,
            beginEdit,
            cancelEdit,
            saveRow: async (row) => {
                if (row.isNew) {
                    await handleCreateGroup();
                    return;
                }

                await handleUpdateGroup(row.id);
            },
            requestDelete: (row) => {
                const target = orderedGroups.find((group) => group.id === row.id);
                if (target) {
                    setDeleteTarget(target);
                }
            },
            dragDisabled,
        }),
        [
            beginEdit,
            cancelEdit,
            drafts,
            dragDisabled,
            editingId,
            handleCreateGroup,
            handleUpdateGroup,
            isReordering,
            orderedGroups,
            submitState,
            updateDraft,
        ],
    );

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            if (event.canceled) return;

            const sourceId = event.operation.source?.id;
            const targetId = event.operation.target?.id;

            if (
                typeof sourceId !== "string" ||
                typeof targetId !== "string" ||
                sourceId === targetId
            ) {
                return;
            }

            void handleReorderGroups(sourceId, targetId);
        },
        [handleReorderGroups],
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-hidden p-0 md:max-w-4xl">
                    <DialogHeader className="border-b px-6 py-4">
                        <DialogTitle>Group Management</DialogTitle>
                        <DialogDescription>
                            Dedicated feature to create, edit, delete, and sort
                            groups without creating a new page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[calc(90vh-88px)] space-y-4 overflow-y-auto px-6 pb-4">
                        <div className="overflow-hidden rounded-xl border bg-card">
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Drag rows to reorder groups by the `order`
                                    field.
                                </p>
                                {tableMeta.isReordering ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Spinner className="size-3.5" />
                                        Saving order...
                                    </div>
                                ) : null}
                            </div>

                            <DragDropProvider onDragEnd={handleDragEnd}>
                                <Table className="min-w-full">
                                    <TableHeader className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm bg-linear-to-r from-blue-50 to-yellow-50">
                                        <TableRow className="hover:bg-primary/10 bg-primary/5 border-b border-gray-200">
                                            <TableHead className="w-12 text-center font-semibold text-gray-700">
                                                #
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Group Name
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">
                                                Currency
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">
                                                Members
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-700">
                                                Active
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-gray-700">
                                                <Button
                                                    type="button"
                                                    onClick={startCreate}
                                                    disabled={createDisabled}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tableRows.length > 0 ? (
                                            tableRows.map((row, index) => (
                                                <GroupSortableRow
                                                    key={row.id}
                                                    row={row}
                                                    index={index}
                                                    meta={tableMeta}
                                                />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="h-24 text-center text-muted-foreground italic"
                                                >
                                                    No groups yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </DragDropProvider>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={deleteTarget !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setDeleteTarget(null);
                    }
                }}
                onConfirm={handleDeleteGroup}
                loading={
                    submitState?.action === "delete" &&
                    submitState.rowId === deleteTarget?.id
                }
                title="Delete Group"
                description={
                    deleteTarget
                        ? `Are you sure you want to delete ${deleteTarget.name}?`
                        : "Are you sure you want to delete this group?"
                }
            />
        </>
    );
}
