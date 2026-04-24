import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ActionIconButton({
    label,
    onClick,
    variant = "ghost",
    children,
}: {
    label: string;
    onClick: () => void;
    variant?: "ghost" | "outline" | "destructive";
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant={variant}
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={(event) => {
                        event.stopPropagation();
                        onClick();
                    }}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] font-semibold">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}
