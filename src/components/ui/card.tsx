import * as React from "react";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

function Card({
    className,
    size = "default",
    ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
    return (
        <div
            data-slot="card"
            data-size={size}
            className={cn(
                "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
                className,
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-title"
            className={cn(
                "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
                className,
            )}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
                className,
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn(
                "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
                className,
            )}
            {...props}
        />
    );
}
type OverviewCardData = {
    title: string;
    value: string | number;
    description?: string;
    hint?: string;
    icon?: LucideIcon;
    badge?: string;
};

type OverviewCardProps = {
    data: OverviewCardData;
    className?: string;
};

type ImageBackgroundCardProps = Omit<React.ComponentProps<"div">, "title"> & {
    backgroundImage: string;
    title: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
};

function ImageBackgroundCard({
    backgroundImage,
    title,
    value,
    description,
    className,
    style,
    ...props
}: ImageBackgroundCardProps) {
    return (
        <Card
            className={cn(
                "relative h-36 overflow-hidden bg-[length:100%_100%] bg-center bg-no-repeat py-0 shadow-sm md:h-40",
                className,
            )}
            style={{
                backgroundImage: `url("${backgroundImage}")`,
                ...style,
            }}
            {...props}
        >
            <div className="absolute inset-x-0 top-0 z-10 p-4">
                <p className="text-sm font-medium text-foreground/75">
                    {title}
                </p>
                <div className="text-2xl font-semibold leading-tight text-foreground">
                    {value}
                </div>
                {description ? (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
        </Card>
    );
}

function OverviewCard({ data, className }: OverviewCardProps) {
    const Icon = data.icon;

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-border/60 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm",
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/0.12),transparent_38%)]" />
            <CardHeader className="relative flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                    <CardDescription className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
                        {data.title}
                    </CardDescription>
                    <CardTitle className="text-3xl font-semibold tracking-tight">
                        {data.value}
                    </CardTitle>
                </div>
                {Icon ? (
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 shadow-sm">
                        <Icon className="size-5 text-primary" />
                    </div>
                ) : null}
            </CardHeader>
            {data.description || data.hint || data.badge ? (
                <CardContent className="relative space-y-3">
                    {data.description ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {data.description}
                        </p>
                    ) : null}
                    {data.hint || data.badge ? (
                        <div className="flex items-center justify-between gap-3">
                            {data.hint ? (
                                <span className="text-xs text-muted-foreground">
                                    {data.hint}
                                </span>
                            ) : (
                                <span />
                            )}
                            {data.badge ? (
                                <span className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground">
                                    {data.badge}
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </CardContent>
            ) : null}
        </Card>
    );
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
    ImageBackgroundCard,
    OverviewCard,
};
export type { OverviewCardData };
