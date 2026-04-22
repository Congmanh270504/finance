import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

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
      {(data.description || data.hint || data.badge) ? (
        <CardContent className="relative space-y-3">
          {data.description ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {data.description}
            </p>
          ) : null}
          {data.hint || data.badge ? (
            <div className="flex items-center justify-between gap-3">
              {data.hint ? (
                <span className="text-xs text-muted-foreground">{data.hint}</span>
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
  CardDescription,
  CardContent,
  OverviewCard,
};
export type { OverviewCardData };
