"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { KeyRoundIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
    deleteSettingsAccountAction,
    updateSettingsPasswordAction,
    updateSettingsStatusAction,
} from "@/features/settings/action";
import type { SettingsAccountData } from "@/features/settings/types";
import { toast } from "sonner";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function FieldLabel({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">
                {title}
            </label>
            {description ? (
                <p className="text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

export function AccountSettingsClient({
    account,
}: {
    account: SettingsAccountData;
}) {
    const [passwordForm, setPasswordForm] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [savedStatus, setSavedStatus] = React.useState(account.isActive);
    const [statusValue, setStatusValue] = React.useState(account.isActive);
    const [confirmationEmail, setConfirmationEmail] = React.useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    function updatePasswordField(
        field: keyof typeof passwordForm,
        value: string,
    ) {
        setPasswordForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handleUpdatePassword() {
        startTransition(async () => {
            const result = await updateSettingsPasswordAction(passwordForm);

            if (!result.success) {
                toast.error("Unable to update password", {
                    description: result.error,
                });
                return;
            }

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            toast.success("Password updated");
        });
    }

    function handleUpdateStatus() {
        startTransition(async () => {
            const result = await updateSettingsStatusAction({
                isActive: statusValue,
            });

            if (!result.success || !result.data) {
                toast.error("Unable to update account status", {
                    description: result.error,
                });
                return;
            }

            setStatusValue(result.data.isActive);
            setSavedStatus(result.data.isActive);
            toast.success("Account status updated");
        });
    }

    function handleDeleteAccount() {
        startTransition(async () => {
            const result = await deleteSettingsAccountAction({
                confirmationEmail,
            });

            if (!result.success) {
                toast.error("Unable to delete account", {
                    description: result.error,
                });
                return;
            }

            toast.success("Account deleted");
            setDeleteDialogOpen(false);
            await signOut({ callbackUrl: "/login" });
        });
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        Account settings
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        Security and access
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Manage sign-in credentials, account availability, and
                        destructive account actions.
                    </p>
                </div>
                <Badge className="w-fit gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-600 shadow-none hover:bg-emerald-600/10">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    {savedStatus ? "Active" : "Inactive"}
                </Badge>
            </div>

            <Separator />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                    <Card className="border-border/70 bg-gradient-to-br from-blue-50/80 to-white shadow-sm dark:from-blue-950/20 dark:to-background">
                        <CardHeader className="flex-row items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-blue-100 text-blue-700">
                                <KeyRoundIcon className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>Reset password</CardTitle>
                                <CardDescription>
                                    Update the password used for this account.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {account.hasPassword ? (
                                <div className="grid gap-2">
                                    <FieldLabel title="Current password" />
                                    <Input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(event) =>
                                            updatePasswordField(
                                                "currentPassword",
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ) : null}
                            <div className="grid gap-2">
                                <FieldLabel title="New password" />
                                <Input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(event) =>
                                        updatePasswordField(
                                            "newPassword",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <FieldLabel title="Confirm password" />
                                <Input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(event) =>
                                        updatePasswordField(
                                            "confirmPassword",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                type="button"
                                disabled={isPending}
                                onClick={handleUpdatePassword}
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner /> Saving...
                                    </span>
                                ) : (
                                    "Update password"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-border/70 bg-gradient-to-br from-emerald-50/80 to-white shadow-sm dark:from-emerald-950/20 dark:to-background">
                        <CardHeader className="flex-row items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-100 text-emerald-700">
                                <ShieldCheckIcon className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>Account status</CardTitle>
                                <CardDescription>
                                    Control whether this account is active for
                                    future sign-ins.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                            <div className="grid gap-2">
                                <FieldLabel
                                    title="Status"
                                    description="Inactive accounts cannot sign in again until reactivated."
                                />
                                <Select
                                    value={statusValue ? "active" : "inactive"}
                                    onValueChange={(value) =>
                                        setStatusValue(value === "active")
                                    }
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
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    isPending ||
                                    statusValue === savedStatus
                                }
                                onClick={handleUpdateStatus}
                            >
                                Save status
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-border/70 bg-white/85 shadow-sm">
                        <CardHeader>
                            <CardTitle>Account facts</CardTitle>
                            <CardDescription>
                                Basic account metadata for this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                                <span className="text-muted-foreground">
                                    Email
                                </span>
                                <span className="truncate text-right font-medium">
                                    {account.email}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                                <span className="text-muted-foreground">
                                    Created
                                </span>
                                <span className="font-medium">
                                    {formatDate(account.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                                <span className="text-muted-foreground">
                                    Password
                                </span>
                                <span className="font-medium">
                                    {account.hasPassword ? "Set" : "Not set"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/30 bg-gradient-to-br from-red-50/80 to-white shadow-sm dark:from-red-950/20 dark:to-background">
                        <CardHeader className="flex-row items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-200/70 bg-red-100 text-red-700">
                                <Trash2Icon className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>Delete account</CardTitle>
                                <CardDescription>
                                    Permanently remove this account and its
                                    profile data.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog
                                open={deleteDialogOpen}
                                onOpenChange={setDeleteDialogOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        Delete account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-lg">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Delete this account?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action is permanent. Type the
                                            account email to confirm deletion.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="grid gap-2">
                                        <FieldLabel title="Confirmation email" />
                                        <Input
                                            type="email"
                                            value={confirmationEmail}
                                            placeholder={account.email}
                                            onChange={(event) =>
                                                setConfirmationEmail(
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            disabled={isPending}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handleDeleteAccount();
                                            }}
                                        >
                                            {isPending
                                                ? "Deleting..."
                                                : "Delete account"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
