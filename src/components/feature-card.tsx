import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colorVariants = {
    blue: {
        card: "border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-blue-950",
        icon: "bg-blue-100 text-blue-700",
        value: "text-blue-700",
    },
    emerald: {
        card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 text-emerald-950",
        icon: "bg-emerald-100 text-emerald-700",
        value: "text-emerald-700",
    },
    amber: {
        card: "border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 text-amber-950",
        icon: "bg-amber-100 text-amber-700",
        value: "text-amber-700",
    },
    rose: {
        card: "border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-pink-50 text-rose-950",
        icon: "bg-rose-100 text-rose-700",
        value: "text-rose-700",
    },
    slate: {
        card: "border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-950",
        icon: "bg-slate-200 text-slate-700",
        value: "text-slate-700",
    },
} as const;

export type FeatureCardColor = keyof typeof colorVariants;

type FeatureCardProps = {
    title: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    color?: FeatureCardColor;
    className?: string;
    contentClassName?: string;
    valueClassName?: string;
    onClick?: () => void;
};

export function FeatureCard({
    title,
    value,
    description,
    icon,
    color = "blue",
    className,
    contentClassName,
    valueClassName,
    onClick,
}: FeatureCardProps) {
    const tone = colorVariants[color];

    return (
        <Card
            className={cn(
                "relative overflow-hidden py-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                tone.card,
                onClick ? "cursor-pointer" : undefined,
                className,
            )}
            onClick={onClick}
        >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 hover:translate-x-full" />
            </div>
            <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-3 px-4 py-4">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                    {description ? (
                        <CardDescription className="text-xs text-current/70">
                            {description}
                        </CardDescription>
                    ) : null}
                </div>
                {icon ? (
                    <div
                        className={cn(
                            "flex size-10 items-center justify-center rounded-full",
                            tone.icon,
                        )}
                    >
                        {icon}
                    </div>
                ) : null}
            </CardHeader>
            <CardContent className={cn("relative z-10 px-4 pb-4 pt-0", contentClassName)}>
                <div className={cn("text-2xl font-bold tracking-tight", tone.value, valueClassName)}>
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}
