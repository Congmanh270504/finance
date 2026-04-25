"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CheckCircle2Icon,
    LoaderIcon,
    ReceiptTextIcon,
    UsersIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { DatePickerSimple } from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createExpenseAction,
    getExpenseFormMembers,
} from "@/features/expense/action";
import type {
    ExpenseFormGroup,
    ExpenseFormMember,
} from "@/features/expense/types";
import { MemberAvatar } from "@/features/finance/components/shared/MemberAvatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserAvatar from "@/components/user-avatar";

type ParticipantFormValue = {
    memberId: string;
    memberName: string;
    avatarUrl?: string;
    avatarFallback?: string;
    enabled: boolean;
    shareAmountInput: string;
};

const formSchema = z
    .object({
        groupId: z.string().trim().min(1, "Please select a group."),
        title: z.string().trim().min(1, "Please enter an expense title."),
        amountInput: z.string().trim().min(1, "Please enter an amount."),
        paidByMemberId: z.string().min(1, "Please select the payer."),
        shareStrategy: z.enum(["EQUAL", "CUSTOM"]),
        notes: z
            .string()
            .max(500, "Notes must be 500 characters or fewer.")
            .optional(),
        occurredAt: z.string().min(1, "Please select the expense date."),
        participants: z.array(
            z.object({
                memberId: z.string().min(1),
                memberName: z.string().min(1),
                avatarUrl: z.string().optional(),
                avatarFallback: z.string().optional(),
                enabled: z.boolean(),
                shareAmountInput: z.string(),
            }),
        ),
    })
    .superRefine((value, ctx) => {
        const amount = parseCurrencyInput(value.amountInput);

        if (amount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amountInput"],
                message: "Amount must be greater than 0.",
            });
        }

        if (Number.isNaN(Date.parse(value.occurredAt))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["occurredAt"],
                message: "Expense date is invalid.",
            });
        }

        const selectedParticipants = value.participants.filter(
            (participant) => participant.enabled,
        );

        if (selectedParticipants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["participants"],
                message: "Select at least one participant.",
            });
        }

        if (value.shareStrategy === "CUSTOM") {
            const totalShare = selectedParticipants.reduce(
                (sum, participant) =>
                    sum + parseCurrencyInput(participant.shareAmountInput),
                0,
            );

            if (totalShare !== amount) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["participants"],
                    message: "Allocated amount must match the total expense.",
                });
            }
        }
    });

type FormValues = z.infer<typeof formSchema>;

function parseCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
}

function formatAmountInput(amount: number) {
    return amount > 0 ? amount.toLocaleString("vi-VN") : "";
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function splitAmountEvenly(amount: number, count: number) {
    if (amount <= 0 || count <= 0) {
        return [];
    }

    const base = Math.floor(amount / count);
    const remainder = amount - base * count;

    return Array.from({ length: count }, (_, index) =>
        index === 0 ? base + remainder : base,
    );
}

function parseStoredDate(value?: string) {
    if (!value) {
        return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function mergeSelectedDate(date: Date | undefined, previousValue?: string) {
    if (!date) {
        return "";
    }

    const previousDate = parseStoredDate(previousValue) ?? new Date();
    const nextDate = new Date(date);

    nextDate.setHours(
        previousDate.getHours(),
        previousDate.getMinutes(),
        previousDate.getSeconds(),
        previousDate.getMilliseconds(),
    );

    return nextDate.toISOString();
}

function buildParticipants(
    members: ExpenseFormMember[],
    amount: number,
): ParticipantFormValue[] {
    const splits = splitAmountEvenly(amount, members.length);

    return members.map((member, index) => ({
        memberId: member.id,
        memberName: member.name,
        avatarUrl: member.avatarUrl,
        avatarFallback: member.avatarFallback,
        enabled: true,
        shareAmountInput: formatAmountInput(splits[index] ?? 0),
    }));
}

function resolveInitialGroupId(
    groups: ExpenseFormGroup[],
    initialGroupId: string,
) {
    if (groups.some((group) => group.id === initialGroupId)) {
        return initialGroupId;
    }

    return groups[0]?.id ?? "";
}

function createDefaultValues(
    groups: ExpenseFormGroup[],
    initialGroupId: string,
): FormValues {
    return {
        groupId: resolveInitialGroupId(groups, initialGroupId),
        title: "",
        amountInput: "",
        paidByMemberId: "",
        shareStrategy: "EQUAL",
        notes: "",
        occurredAt: new Date().toISOString(),
        participants: [],
    };
}

export function NewExpenseForm({
    open,
    onOpenChange,
    groups,
    currentMemberId,
    initialGroupId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: ExpenseFormGroup[];
    currentMemberId: string;
    initialGroupId: string;
}) {
    const router = useRouter();
    const [members, setMembers] = React.useState<ExpenseFormMember[]>([]);
    const [isMembersLoading, setIsMembersLoading] = React.useState(false);
    const [isSubmitting, startTransition] = React.useTransition();

    const {
        control,
        formState: { errors },
        getValues,
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: createDefaultValues(groups, initialGroupId),
    });

    const selectedGroupId = watch("groupId");
    const amountInput = watch("amountInput");
    const paidByMemberId = watch("paidByMemberId");
    const shareStrategy = watch("shareStrategy");
    const participants = watch("participants");
    const amount = parseCurrencyInput(amountInput ?? "");

    const syncMembersToForm = React.useCallback(
        (nextMembers: ExpenseFormMember[]) => {
            const values = getValues();
            const amountValue = parseCurrencyInput(values.amountInput);
            const nextPayerId = nextMembers.some(
                (member) => member.id === values.paidByMemberId,
            )
                ? values.paidByMemberId
                : nextMembers.some((member) => member.id === currentMemberId)
                  ? currentMemberId
                  : (nextMembers[0]?.id ?? "");

            reset(
                {
                    ...values,
                    paidByMemberId: nextPayerId,
                    participants: buildParticipants(nextMembers, amountValue),
                },
                {
                    keepErrors: true,
                    keepDirty: true,
                    keepTouched: true,
                },
            );
        },
        [currentMemberId, getValues, reset],
    );

    React.useEffect(() => {
        if (!open) {
            return;
        }

        setMembers([]);
        reset(createDefaultValues(groups, initialGroupId));
    }, [groups, initialGroupId, open, reset]);

    React.useEffect(() => {
        if (!open || !selectedGroupId) {
            return;
        }

        let cancelled = false;
        setIsMembersLoading(true);

        void getExpenseFormMembers(selectedGroupId)
            .then((result) => {
                if (cancelled) {
                    return;
                }

                const nextMembers = result.members ?? [];
                setMembers(nextMembers);
                syncMembersToForm(nextMembers);
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setMembers([]);
                syncMembersToForm([]);
                toast.error("Failed to load group members", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Please try again.",
                });
            })
            .finally(() => {
                if (!cancelled) {
                    setIsMembersLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [open, selectedGroupId, syncMembersToForm]);

    const participantSelectionKey = React.useMemo(
        () =>
            (participants ?? [])
                .map(
                    (participant) =>
                        `${participant.memberId}:${participant.enabled ? "1" : "0"}`,
                )
                .join("|"),
        [participants],
    );

    React.useEffect(() => {
        if (!paidByMemberId) {
            return;
        }

        const currentParticipants = getValues("participants");
        const payerIndex = currentParticipants.findIndex(
            (participant) => participant.memberId === paidByMemberId,
        );

        if (payerIndex <= 0) {
            return;
        }

        const payer = currentParticipants[payerIndex];
        const nextParticipants = [
            payer,
            ...currentParticipants.slice(0, payerIndex),
            ...currentParticipants.slice(payerIndex + 1),
        ];

        setValue("participants", nextParticipants, {
            shouldValidate: true,
        });
    }, [getValues, paidByMemberId, setValue]);

    React.useEffect(() => {
        if (shareStrategy !== "EQUAL") {
            return;
        }

        const currentParticipants = getValues("participants");
        const enabledParticipants = currentParticipants.filter(
            (participant) => participant.enabled,
        );
        const splits = splitAmountEvenly(amount, enabledParticipants.length);
        let splitIndex = 0;

        const nextParticipants = currentParticipants.map((participant) => {
            if (!participant.enabled) {
                return {
                    ...participant,
                    shareAmountInput: "",
                };
            }

            const shareAmount = splits[splitIndex] ?? 0;
            splitIndex += 1;

            return {
                ...participant,
                shareAmountInput: formatAmountInput(shareAmount),
            };
        });

        const changed = nextParticipants.some(
            (participant, index) =>
                participant.shareAmountInput !==
                currentParticipants[index]?.shareAmountInput,
        );

        if (changed) {
            setValue("participants", nextParticipants, {
                shouldValidate: true,
            });
        }
    }, [amount, getValues, participantSelectionKey, setValue, shareStrategy]);

    const selectedParticipants = React.useMemo(
        () => (participants ?? []).filter((participant) => participant.enabled),
        [participants],
    );
    const allocatedAmount = React.useMemo(
        () =>
            selectedParticipants.reduce(
                (sum, participant) =>
                    sum + parseCurrencyInput(participant.shareAmountInput),
                0,
            ),
        [selectedParticipants],
    );
    const allocationDiff = amount - allocatedAmount;

    function handleParticipantToggle(memberId: string, checked: boolean) {
        const currentParticipants = getValues("participants");
        const selectedCount = currentParticipants.filter(
            (participant) => participant.enabled,
        ).length;

        if (!checked && selectedCount <= 1) {
            return;
        }

        const nextParticipants = currentParticipants.map((participant) =>
            participant.memberId === memberId
                ? {
                      ...participant,
                      enabled: checked,
                      shareAmountInput:
                          checked || shareStrategy === "EQUAL"
                              ? participant.shareAmountInput
                              : "",
                  }
                : participant,
        );

        setValue("participants", nextParticipants, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function handleCustomShareChange(memberId: string, value: string) {
        const digits = value.replace(/\D/g, "");
        const nextValue = digits ? Number(digits).toLocaleString("vi-VN") : "";
        const nextParticipants = getValues("participants").map((participant) =>
            participant.memberId === memberId
                ? {
                      ...participant,
                      shareAmountInput: nextValue,
                  }
                : participant,
        );

        setValue("participants", nextParticipants, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    const onSubmit = handleSubmit((values) => {
        startTransition(async () => {
            const splitShares = values.participants
                .filter((participant) => participant.enabled)
                .map((participant) => ({
                    memberId: participant.memberId,
                    shareAmount: parseCurrencyInput(
                        participant.shareAmountInput,
                    ),
                }));

            const result = await createExpenseAction({
                groupId: values.groupId,
                title: values.title.trim(),
                amount: parseCurrencyInput(values.amountInput),
                paidByMemberId: values.paidByMemberId,
                shareStrategy: values.shareStrategy,
                notes: values.notes?.trim() || undefined,
                occurredAt: new Date(values.occurredAt).toISOString(),
                splitShares,
            });

            if (!result.success) {
                toast.error("Failed to create expense", {
                    description: result.error,
                });
                return;
            }

            toast.success("Expense created", {
                description: `${values.title.trim()} • ${formatCurrency(
                    parseCurrencyInput(values.amountInput),
                )}`,
            });

            window.dispatchEvent(new Event("notifications:refresh"));
            reset(createDefaultValues(groups, values.groupId));
            setMembers([]);
            router.refresh();
            onOpenChange(false);
        });
    });

    const hasGroups = groups.length > 0;
    const hasMembers = members.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] overflow-hidden gap-0 rounded-lg p-0 md:max-w-5xl"
            >
                <DialogHeader className="rounded-t-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                    <DialogTitle className="text-3xl font-bold text-white">
                        Add Expense
                    </DialogTitle>
                    <DialogDescription className="text-base text-white/90">
                        Select a group, load its members, and create a new
                        expense with the updated schema.
                    </DialogDescription>
                </DialogHeader>

                {!hasGroups ? (
                    <>
                        <div className="px-6 py-8 text-sm text-muted-foreground">
                            No groups are available for creating an expense.
                        </div>
                        <DialogFooter className="mx-0 mb-0 rounded-b-lg px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form
                        onSubmit={onSubmit}
                        className="flex max-h-[calc(90vh-112px)] flex-col"
                    >
                        <div className="overflow-y-auto px-6 pt-6 pb-4 no-scrollbar grid grid-cols-2 gap-6">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 border rounded-2xl p-4">
                                <div className="space-y-2">
                                    <Label>Group</Label>
                                    <Controller
                                        control={control}
                                        name="groupId"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        !!errors.groupId
                                                    }
                                                >
                                                    <SelectValue placeholder="Select a group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {groups.map((group) => (
                                                        <SelectItem
                                                            key={group.id}
                                                            value={group.id}
                                                        >
                                                            {group.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.groupId ? (
                                        <p className="text-sm text-destructive">
                                            {errors.groupId.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expense-title">
                                        Expense title
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expense-title"
                                        placeholder="Example: Dinner, gas, hotel booking"
                                        {...register("title")}
                                        aria-invalid={!!errors.title}
                                    />
                                    {errors.title ? (
                                        <p className="text-sm text-destructive">
                                            {errors.title.message}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <Controller
                                        control={control}
                                        name="occurredAt"
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <DatePickerSimple
                                                    id="occurred-at"
                                                    label="Expense date"
                                                    value={parseStoredDate(
                                                        field.value,
                                                    )}
                                                    onChange={(date) =>
                                                        field.onChange(
                                                            mergeSelectedDate(
                                                                date,
                                                                field.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                                {errors.occurredAt ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            errors.occurredAt
                                                                .message
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expense-amount">
                                        Amount
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="expense-amount"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={amountInput ?? ""}
                                        onChange={(event) => {
                                            const digits =
                                                event.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                );
                                            setValue(
                                                "amountInput",
                                                digits
                                                    ? Number(
                                                          digits,
                                                      ).toLocaleString("vi-VN")
                                                    : "",
                                                {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                },
                                            );
                                        }}
                                        aria-invalid={!!errors.amountInput}
                                        className="text-base font-semibold tabular-nums"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {amount > 0
                                            ? formatCurrency(amount)
                                            : "Enter the total expense amount"}
                                    </p>
                                    {errors.amountInput ? (
                                        <p className="text-sm text-destructive">
                                            {errors.amountInput.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Payer</Label>
                                    <Controller
                                        control={control}
                                        name="paidByMemberId"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={
                                                    isMembersLoading ||
                                                    !hasMembers
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        !!errors.paidByMemberId
                                                    }
                                                >
                                                    <SelectValue placeholder="Select the payer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {members.map((member) => (
                                                        <SelectItem
                                                            key={member.id}
                                                            value={member.id}
                                                        >
                                                            {member.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.paidByMemberId ? (
                                        <p className="text-sm text-destructive">
                                            {errors.paidByMemberId.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Split mode</Label>
                                    <Controller
                                        control={control}
                                        name="shareStrategy"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(nextValue) => {
                                                    field.onChange(nextValue);
                                                    syncMembersToForm(members);
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a split mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EQUAL">
                                                        Split equally
                                                    </SelectItem>
                                                    <SelectItem value="CUSTOM">
                                                        Custom split
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2 col-span-3">
                                    <Label htmlFor="expense-notes">Notes</Label>
                                    <Input
                                        id="expense-notes"
                                        placeholder="Add optional details"
                                        {...register("notes")}
                                    />
                                    {errors.notes ? (
                                        <p className="text-sm text-destructive">
                                            {errors.notes.message}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className=" rounded-2xl border bg-muted/20">
                                <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ReceiptTextIcon className="size-4 text-emerald-600" />
                                            <p className="font-semibold">
                                                Cost allocation
                                            </p>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            After selecting a group, its members
                                            will be loaded for splitting.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="tabular-nums"
                                        >
                                            {selectedParticipants.length} people
                                        </Badge>
                                        <Badge
                                            variant={
                                                allocationDiff === 0
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            className={cn(
                                                "tabular-nums",
                                                allocationDiff === 0
                                                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                                    : "border-amber-200 bg-amber-50 text-amber-700",
                                            )}
                                        >
                                            {allocationDiff === 0
                                                ? "Balanced"
                                                : `Difference ${formatCurrency(
                                                      Math.abs(allocationDiff),
                                                  )}`}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3 px-4 py-4 max-h-40 overflow-auto">
                                    {isMembersLoading ? (
                                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                            <LoaderIcon className="size-4 animate-spin" />
                                            Loading group members
                                        </div>
                                    ) : !hasMembers ? (
                                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                            <UsersIcon className="size-4" />
                                            This group has no members yet
                                        </div>
                                    ) : (
                                        participants.map((participant) => {
                                            const shareAmount =
                                                parseCurrencyInput(
                                                    participant.shareAmountInput,
                                                );
                                            const isPayer =
                                                participant.memberId ===
                                                paidByMemberId;

                                            return (
                                                <div
                                                    key={participant.memberId}
                                                    className={cn(
                                                        "rounded-2xl border px-4 py-3 transition-colors ",
                                                        participant.enabled
                                                            ? "border-emerald-200 bg-white"
                                                            : "border-dashed border-border bg-background/60 opacity-70",
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                                        <label className="flex flex-1 items-center gap-3">
                                                            <Checkbox
                                                                checked={
                                                                    participant.enabled
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    handleParticipantToggle(
                                                                        participant.memberId,
                                                                        checked ===
                                                                            true,
                                                                    )
                                                                }
                                                            />
                                                            {/* <MemberAvatar
                                                                name={
                                                                    participant.memberName
                                                                }
                                                                size="sm"
                                                            /> */}
                                                            <UserAvatar
                                                                src={
                                                                    participant.avatarUrl
                                                                }
                                                                alt={
                                                                    participant.memberName
                                                                }
                                                                fallback={
                                                                    participant.avatarFallback
                                                                }
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="font-medium">
                                                                    {
                                                                        participant.memberName
                                                                    }
                                                                </p>
                                                                <div className="mt-1 flex flex-wrap gap-2">
                                                                    {isPayer ? (
                                                                        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                                                                            Payer
                                                                        </Badge>
                                                                    ) : null}
                                                                    {!participant.enabled ? (
                                                                        <Badge variant="outline">
                                                                            Excluded
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </label>

                                                        <div className="w-full md:w-52">
                                                            {shareStrategy ===
                                                            "CUSTOM" ? (
                                                                <Input
                                                                    inputMode="numeric"
                                                                    placeholder="0"
                                                                    value={
                                                                        participant.shareAmountInput
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        handleCustomShareChange(
                                                                            participant.memberId,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !participant.enabled
                                                                    }
                                                                    className="text-right tabular-nums"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={cn(
                                                                        "rounded-md border px-3 py-2 text-right text-sm font-semibold tabular-nums",
                                                                        participant.enabled
                                                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                            : "border-dashed border-border text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {participant.enabled
                                                                        ? formatCurrency(
                                                                              shareAmount,
                                                                          )
                                                                        : "Not included"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    <div className="rounded-2xl border border-dashed bg-background px-4 py-3">
                                        <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                                            <span className="text-muted-foreground">
                                                Total allocated
                                            </span>
                                            <span className="font-semibold tabular-nums">
                                                {formatCurrency(
                                                    allocatedAmount,
                                                )}{" "}
                                                / {formatCurrency(amount)}
                                            </span>
                                        </div>
                                    </div>

                                    {errors.participants ? (
                                        <p className="text-sm text-destructive">
                                            {errors.participants.message}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mx-0 mb-0 rounded-b-lg px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    isMembersLoading ||
                                    !hasMembers
                                }
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderIcon className="size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2Icon className="size-4" />
                                        Save expense
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
