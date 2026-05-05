"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2Icon, LoaderIcon, WalletCardsIcon } from "lucide-react";
import { DatePickerSimple } from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createSettlementAction,
    getSettlementFormData,
    updateSettlementAction,
} from "@/features/settlements/action";
import type {
    SettlementDebtOption,
    SettlementFormData,
    SettlementFormGroup,
    SettlementRow,
} from "@/features/settlements/types";

type FormValues = {
    groupId: string;
    toMemberId: string;
    amountInput: string;
    note: string;
    settledAt: string;
};

const formSchema = z
    .object({
        groupId: z.string().trim().min(1, "Please select a group."),
        toMemberId: z.string().trim().min(1, "Please select who you paid."),
        amountInput: z.string().trim().min(1, "Please enter an amount."),
        note: z
            .string()
            .trim()
            .max(500, "Note must be 500 characters or fewer.")
            .optional(),
        settledAt: z.string().trim().min(1, "Please select the payment date."),
    })
    .superRefine((value, ctx) => {
        const amount = parseAmountInput(value.amountInput);

        if (amount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amountInput"],
                message: "Amount must be greater than 0.",
            });
        }

        if (Number.isNaN(Date.parse(value.settledAt))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["settledAt"],
                message: "Payment date is invalid.",
            });
        }
    });

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

function parseAmountInput(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
}

function formatAmountInput(amount: number) {
    return amount > 0 ? amount.toLocaleString("vi-VN") : "";
}

function createDefaultValues(
    groups: SettlementFormGroup[],
    initialGroupId: string,
    settlement?: SettlementRow | null,
): FormValues {
    const groupId =
        settlement?.groupId ??
        (groups.some((group) => group.id === initialGroupId)
            ? initialGroupId
            : (groups[0]?.id ?? ""));

    return {
        groupId,
        toMemberId: settlement?.toMemberId ?? "",
        amountInput: formatAmountInput(settlement?.amount ?? 0),
        note: settlement?.note ?? "",
        settledAt: settlement?.settledAt
            ? new Date(settlement.settledAt).toISOString()
            : new Date().toISOString(),
    };
}

function formatDebtLabel(debt: SettlementDebtOption) {
    return `${debt.toMemberName}`;
}

export function SettlementDialog({
    open,
    onOpenChange,
    mode,
    groups,
    initialGroupId,
    settlement,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    groups: SettlementFormGroup[];
    initialGroupId: string;
    settlement?: SettlementRow | null;
}) {
    const router = useRouter();
    const [formData, setFormData] = React.useState<SettlementFormData>({
        members: [],
        debts: [],
        currency: "VND",
    });
    const [isLoadingData, setIsLoadingData] = React.useState(false);
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
        defaultValues: createDefaultValues(groups, initialGroupId, settlement),
    });

    const selectedGroupId = watch("groupId");
    const selectedToMemberId = watch("toMemberId");
    const amountInput = watch("amountInput");
    const amount = parseAmountInput(amountInput ?? "");
    const selectedDebt = React.useMemo(
        () =>
            formData.debts.find(
                (debt) => debt.toMemberId === selectedToMemberId,
            ),
        [formData.debts, selectedToMemberId],
    );

    React.useEffect(() => {
        if (!open) {
            return;
        }

        reset(createDefaultValues(groups, initialGroupId, settlement));
    }, [groups, initialGroupId, open, reset, settlement]);

    React.useEffect(() => {
        if (!open || mode !== "create" || !selectedGroupId) {
            return;
        }

        let cancelled = false;
        setIsLoadingData(true);

        void getSettlementFormData(selectedGroupId)
            .then((result) => {
                if (cancelled) {
                    return;
                }

                setFormData(result);

                const currentToMemberId = getValues("toMemberId");
                const nextDebt =
                    result.debts.find(
                        (debt) => debt.toMemberId === currentToMemberId,
                    ) ?? result.debts[0];

                if (nextDebt) {
                    setValue("toMemberId", nextDebt.toMemberId, {
                        shouldValidate: true,
                    });
                    setValue(
                        "amountInput",
                        formatAmountInput(nextDebt.amount),
                        {
                            shouldValidate: true,
                        },
                    );
                } else {
                    setValue("toMemberId", "", { shouldValidate: true });
                    setValue("amountInput", "", { shouldValidate: true });
                }
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setFormData({
                    members: [],
                    debts: [],
                    currency: "VND",
                });
                toast.error("Failed to load payment data", {
                    description:
                        error instanceof Error
                            ? error.message
                            : "Please try again.",
                });
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingData(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [getValues, mode, open, selectedGroupId, setValue]);

    React.useEffect(() => {
        if (mode !== "create" || !selectedDebt) {
            return;
        }

        const currentAmount = parseAmountInput(getValues("amountInput"));

        if (currentAmount === 0) {
            setValue("amountInput", formatAmountInput(selectedDebt.amount), {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [getValues, mode, selectedDebt, setValue]);

    function handleDebtChange(toMemberId: string) {
        const debt = formData.debts.find(
            (item) => item.toMemberId === toMemberId,
        );
        setValue("toMemberId", toMemberId, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (debt) {
            setValue("amountInput", formatAmountInput(debt.amount), {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }

    const onSubmit = handleSubmit((values) => {
        startTransition(async () => {
            const payload = {
                groupId: values.groupId,
                toMemberId: values.toMemberId,
                amount: parseAmountInput(values.amountInput),
                note: values.note?.trim() || undefined,
                settledAt: new Date(values.settledAt).toISOString(),
            };

            const result =
                mode === "create"
                    ? await createSettlementAction(payload)
                    : await updateSettlementAction({
                          ...payload,
                          id: settlement?.id ?? "",
                      });

            if (!result.success) {
                toast.error(
                    mode === "create"
                        ? "Failed to save payment"
                        : "Failed to update payment",
                    {
                        description: result.error,
                    },
                );
                return;
            }

            toast.success(
                mode === "create" ? "Payment saved" : "Payment updated",
                {
                    description: `${formatCurrency(payload.amount)} to ${
                        mode === "create"
                            ? (formData.debts.find(
                                  (debt) =>
                                      debt.toMemberId === payload.toMemberId,
                              )?.toMemberName ?? "counterparty")
                            : (settlement?.toMemberName ?? "counterparty")
                    }`,
                },
            );

            reset(createDefaultValues(groups, values.groupId, null));
            router.refresh();
            onOpenChange(false);
        });
    });

    const hasGroups = groups.length > 0;
    const hasDebts = formData.debts.length > 0;
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] overflow-hidden gap-0 rounded-lg p-0 md:max-w-4xl"
            >
                <DialogHeader className="rounded-t-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                    <DialogTitle className="text-2xl font-bold text-white">
                        {mode === "create" ? "Add payment" : "Edit payment"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-white/90">
                        Record a repayment to the person you owe and keep the
                        debt history in sync.
                    </DialogDescription>
                </DialogHeader>

                {!hasGroups ? (
                    <div className="px-6 py-8 text-sm text-muted-foreground">
                        No groups are available for payment tracking.
                    </div>
                ) : (
                    <form
                        onSubmit={onSubmit}
                        className="flex max-h-[calc(90vh-112px)] flex-col"
                    >
                        <div className="grid gap-4 overflow-y-auto px-6 py-6 md:grid-cols-2">
                            <div className="space-y-4 rounded-2xl border p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Group</Label>
                                    {mode === "create" ? (
                                        <Controller
                                            control={control}
                                            name="groupId"
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger>
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
                                    ) : (
                                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                            {settlement?.groupName}
                                        </div>
                                    )}
                                    {errors.groupId ? (
                                        <p className="text-sm text-destructive">
                                            {errors.groupId.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Counterparty</Label>
                                    {mode === "create" ? (
                                        <Controller
                                            control={control}
                                            name="toMemberId"
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        handleDebtChange
                                                    }
                                                    disabled={isLoadingData}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select who you paid" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {formData.debts.map(
                                                            (debt) => (
                                                                <SelectItem
                                                                    key={
                                                                        debt.toMemberId
                                                                    }
                                                                    value={
                                                                        debt.toMemberId
                                                                    }
                                                                >
                                                                    {formatDebtLabel(
                                                                        debt,
                                                                    )}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    ) : (
                                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                            {settlement?.toMemberName}
                                        </div>
                                    )}
                                    {errors.toMemberId ? (
                                        <p className="text-sm text-destructive">
                                            {errors.toMemberId.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="settlement-amount">
                                        Amount
                                    </Label>
                                    <Input
                                        id="settlement-amount"
                                        inputMode="numeric"
                                        className="tabular-nums text-right"
                                        placeholder="0"
                                        {...register("amountInput", {
                                            onChange: (event) => {
                                                const value =
                                                    event.target.value;
                                                const nextDigits =
                                                    value.replace(/\D/g, "");
                                                event.target.value = nextDigits
                                                    ? Number(
                                                          nextDigits,
                                                      ).toLocaleString("vi-VN")
                                                    : "";
                                            },
                                        })}
                                    />
                                    {mode === "create" && selectedDebt ? (
                                        <p className="text-xs text-muted-foreground">
                                            Remaining debt:{" "}
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    selectedDebt.amount,
                                                )}
                                            </span>
                                        </p>
                                    ) : null}
                                    {errors.amountInput ? (
                                        <p className="text-sm text-destructive">
                                            {errors.amountInput.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Controller
                                        control={control}
                                        name="settledAt"
                                        render={({ field }) => (
                                            <DatePickerSimple
                                                value={
                                                    field.value
                                                        ? new Date(field.value)
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    field.onChange(
                                                        date
                                                            ? date.toISOString()
                                                            : "",
                                                    )
                                                }
                                                label="Date"
                                            />
                                        )}
                                    />
                                    {errors.settledAt ? (
                                        <p className="text-sm text-destructive">
                                            {errors.settledAt.message}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <WalletCardsIcon className="size-4 text-emerald-600" />
                                            <p className="font-semibold">
                                                Payment summary
                                            </p>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {mode === "create"
                                                ? "Choose a group and select one of the active debts."
                                                : "Update the amount, date, or note for this saved payment."}
                                        </p>
                                    </div>
                                    {selectedGroup ? (
                                        <Badge variant="secondary">
                                            {selectedGroup.currency}
                                        </Badge>
                                    ) : null}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border bg-background p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Amount
                                        </p>
                                        <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-600">
                                            {formatCurrency(amount)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-background p-4">
                                        <p className="text-xs text-muted-foreground">
                                            Counterparty
                                        </p>
                                        <p className="mt-1 text-base font-semibold">
                                            {mode === "create"
                                                ? (selectedDebt?.toMemberName ??
                                                  "Select a debt")
                                                : (settlement?.toMemberName ??
                                                  "N/A")}
                                        </p>
                                    </div>
                                </div>

                                {mode === "create" &&
                                !isLoadingData &&
                                !hasDebts ? (
                                    <div className="rounded-xl border border-dashed bg-background px-4 py-6 text-sm text-muted-foreground">
                                        There is no active debt in this group
                                        yet.
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                    <Label htmlFor="settlement-note">
                                        Note
                                    </Label>
                                    <Input
                                        id="settlement-note"
                                        placeholder="Optional note"
                                        {...register("note")}
                                    />
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
                                    (mode === "create" && isLoadingData) ||
                                    (mode === "create" && !hasDebts)
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
                                        {mode === "create"
                                            ? "Save payment"
                                            : "Update payment"}
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
