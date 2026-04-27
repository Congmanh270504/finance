"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { updateSettingsProfileAction } from "@/features/settings/action";
import type { SettingsProfile } from "@/features/settings/types";
import { toast } from "sonner";

const PRONOUN_OPTIONS = [
    "he/him",
    "she/her",
    "they/them",
    "gay",
    "lesbian",
] as const;

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
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

type ProfileFormState = Pick<
    SettingsProfile,
    | "displayName"
    | "nickname"
    | "username"
    | "phone"
    | "avatarUrl"
    | "email"
    | "bio"
    | "pronouns"
    | "url"
    | "company"
    | "location"
    | "avatarTone"
>;

function createProfileForm(profile: SettingsProfile): ProfileFormState {
    return {
        displayName: profile.displayName,
        username: profile.username,
        nickname: profile.nickname,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl ?? "",
        email: profile.email,
        bio: profile.bio,
        pronouns: profile.pronouns,
        url: profile.url,
        company: profile.company,
        location: profile.location,
        avatarTone: profile.avatarTone,
    };
}

function StaticTextArea({
    value,
    rows = 4,
    onChange,
}: {
    value: string;
    rows?: number;
    onChange: (value: string) => void;
}) {
    return (
        <textarea
            rows={rows}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
    );
}

type UploadAvatarResponse = {
    success?: boolean;
    message?: string;
    url?: string;
};

async function uploadProfileAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "finance/profiles");
    formData.append("type", "image");

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    const data = (await response
        .json()
        .catch(() => null)) as UploadAvatarResponse | null;

    if (!response.ok || !data?.success || !data.url) {
        throw new Error(data?.message ?? "Upload failed");
    }

    return data.url;
}

export function SettingsClient({
    profile,
    isDemo,
}: {
    profile: SettingsProfile;
    isDemo?: boolean;
}) {
    const router = useRouter();
    const [savedProfile, setSavedProfile] = React.useState(profile);
    const [form, setForm] = React.useState(() => createProfileForm(profile));
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<
        string | null
    >(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const objectUrlRef = React.useRef<string | null>(null);
    const [isPending, startTransition] = React.useTransition();
    const avatarSrc = avatarPreviewUrl ?? (form.avatarUrl || undefined);

    React.useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    function updateField<K extends keyof ProfileFormState>(
        field: K,
        value: ProfileFormState[K],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function clearAvatarSelection() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setAvatarFile(null);
        setAvatarPreviewUrl(null);

        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
    }

    function handleAvatarFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            event.target.value = "";
            return;
        }

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;
        setAvatarFile(file);
        setAvatarPreviewUrl(objectUrl);
        event.target.value = "";
    }

    function resetChanges() {
        setForm(createProfileForm(savedProfile));
        clearAvatarSelection();
    }

    function handleUpdateProfile() {
        startTransition(async () => {
            let nextForm = form;

            if (avatarFile) {
                try {
                    const avatarUrl = await uploadProfileAvatar(avatarFile);
                    nextForm = {
                        ...form,
                        avatarUrl,
                    };
                    setForm(nextForm);
                    clearAvatarSelection();
                } catch (error) {
                    toast.error("Unable to upload profile picture", {
                        description:
                            error instanceof Error
                                ? error.message
                                : "Please try again",
                    });
                    return;
                }
            }

            const result = await updateSettingsProfileAction(nextForm);

            if (!result.success || !result.data) {
                toast.error("Unable to update profile", {
                    description: result.error,
                });
                return;
            }

            setSavedProfile(result.data);
            setForm(createProfileForm(result.data));
            clearAvatarSelection();
            toast.success("Profile updated");
            router.refresh();
        });
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        Profile settings
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        Public profile
                    </h2>
                </div>
                {isDemo ? (
                    <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Mock data preview
                    </div>
                ) : null}
            </div>

            <Separator />

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
                <section className="space-y-6">
                    <div className="grid gap-2">
                        <FieldLabel title="Name" />
                        <Input
                            value={form.displayName}
                            onChange={(event) =>
                                updateField("displayName", event.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel title="Username" />
                        <Input
                            value={form.username}
                            onChange={(event) =>
                                updateField("username", event.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel title="Nick Name" />
                        <Input
                            value={form.nickname}
                            onChange={(event) =>
                                updateField("nickname", event.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel title="Email" />
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                updateField("email", event.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel title="Phone" />
                        <Input
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                                updateField("phone", event.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel
                            title="Bio"
                            description="Description about yourself."
                        />
                        <StaticTextArea
                            value={form.bio}
                            onChange={(value) => updateField("bio", value)}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <FieldLabel title="Pronouns" />
                            <Select
                                value={form.pronouns}
                                onValueChange={(value) =>
                                    updateField("pronouns", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chon cach xung ho" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[form.pronouns, ...PRONOUN_OPTIONS]
                                        .filter(
                                            (value, index, values) =>
                                                value &&
                                                values.indexOf(value) === index,
                                        )
                                        .map((value) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {value}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <FieldLabel title="Avatar style" />
                            <Input
                                value={form.avatarTone}
                                onChange={(event) =>
                                    updateField(
                                        "avatarTone",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel title="Location" />
                        <Input
                            value={form.location}
                            onChange={(event) =>
                                updateField("location", event.target.value)
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/70 pt-6 md:flex-row">
                        <Button
                            type="button"
                            className="md:min-w-36"
                            disabled={isPending || isDemo}
                            onClick={handleUpdateProfile}
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <Spinner /> Updating...
                                </div>
                            ) : (
                                "Update profile"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="md:min-w-36"
                            disabled={isPending}
                            onClick={resetChanges}
                        >
                            Reset changes
                        </Button>
                    </div>
                </section>

                <aside className="order-first xl:order-none">
                    <div className="rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(240,253,250,0.9))] p-5 shadow-sm">
                        <p className="text-sm font-semibold text-foreground">
                            Profile picture
                        </p>
                        <div className="mt-5 flex flex-col items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.95),rgba(161,161,170,0.1)_38%,rgba(39,39,42,0.65)_100%)] blur-sm" />
                                <Avatar
                                    className="relative size-44 cursor-pointer overflow-hidden border border-zinc-300 bg-[radial-gradient(circle_at_35%_30%,#fafafa_0%,#e4e4e7_35%,#52525b_100%)] text-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_12px_30px_-18px_rgba(15,23,42,0.35)] after:hidden"
                                    onClick={() =>
                                        avatarInputRef.current?.click()
                                    }
                                >
                                    <AvatarImage
                                        src={avatarSrc}
                                        alt={form.displayName}
                                    />
                                    <AvatarFallback className="bg-transparent text-4xl font-black uppercase tracking-[0.18em] text-zinc-900">
                                        {getInitials(form.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                disabled={isPending}
                                onChange={handleAvatarFileChange}
                            />
                        </div>

                        <Separator className="my-5" />

                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Quick facts
                            </p>
                            {profile.highlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-sm"
                                >
                                    <span className="text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <span className="text-right font-medium text-foreground">
                                        <Badge className="gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20">
                                            <div className="size-1.5 rounded-full bg-emerald-500" />{" "}
                                            {item.value}
                                        </Badge>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
