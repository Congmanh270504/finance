"use client";

import Image from "next/image";
import { Camera, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    size?: number;
    folder?: string;
    disabled?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    size = 88,
    folder = "finance/members",
    disabled = false,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const { upload, uploading, error } = useFileUpload({
        folder,
        type: "image",
        onSuccess: (file) => {
            setPreview(file.url);
            onChange(file.url);
        },
        onError: () => {
            setPreview(value || null);
            onChange("");
        },
    });

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        await upload(file);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleRemove = (event: React.MouseEvent) => {
        event.stopPropagation();
        setPreview(null);
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className="relative group"
                style={{ width: size, height: size }}
                onClick={() =>
                    !disabled && !uploading && inputRef.current?.click()
                }
            >
                <div
                    className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/30 transition-all group-hover:border-primary/60"
                    style={{ width: size, height: size }}
                >
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Avatar"
                            width={size}
                            height={size}
                            className="h-full w-full rounded-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <User
                            className="text-muted-foreground/40"
                            style={{ width: size * 0.4, height: size * 0.4 }}
                        />
                    )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {uploading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white" />
                    ) : !disabled ? (
                        <Camera className="h-5 w-5 text-white" />
                    ) : null}
                </div>

                {preview && !uploading && !disabled ? (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-colors hover:bg-destructive/80"
                    >
                        <X className="h-3 w-3" />
                    </button>
                ) : null}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || disabled}
            />

            <p className="text-center text-[11px] text-muted-foreground">
                {uploading
                    ? "Uploading..."
                    : disabled
                      ? "Avatar"
                      : "Click to select an image"}
            </p>

            {error ? (
                <p className="text-center text-[11px] font-medium text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
