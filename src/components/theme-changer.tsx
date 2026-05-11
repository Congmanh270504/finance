"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { themes, type ThemeColor } from "@/lib/themes";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "./ui/button";

const STORAGE_KEY = "color-theme";

export function ThemeChanger() {
    const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => {
        if (typeof window === "undefined") {
            return "golden";
        }

        const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeColor;
        return savedTheme && themes[savedTheme] ? savedTheme : "emerald";
    });
    const [isOpen, setIsOpen] = useState(false);
    const { resolvedTheme, systemTheme } = useTheme();
    const mounted = useMounted();
    const currentThemeRef = useRef<ThemeColor>(currentTheme);

    const applyTheme = useCallback(
        (themeName: ThemeColor, mode?: string | null) => {
            const themeConfig = themes[themeName];
            const effectiveMode = mode ?? systemTheme ?? "light";
            const isDark = effectiveMode === "dark";
            const colors = isDark ? themeConfig.dark : themeConfig.light;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    Object.entries(colors).forEach(([key, value]) => {
                        document.documentElement.style.setProperty(
                            `--${key}`,
                            value,
                        );
                    });
                });
            });
        },
        [systemTheme],
    );

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (
                e.key === STORAGE_KEY &&
                e.newValue &&
                themes[e.newValue as ThemeColor]
            ) {
                const nextTheme = e.newValue as ThemeColor;
                currentThemeRef.current = nextTheme;
                setCurrentTheme(nextTheme);
                applyTheme(nextTheme, resolvedTheme);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [applyTheme, resolvedTheme]);

    useEffect(() => {
        if (!mounted || resolvedTheme === undefined) {
            return;
        }

        applyTheme(currentThemeRef.current, resolvedTheme);
    }, [applyTheme, mounted, resolvedTheme]);

    const handleThemeChange = (themeName: ThemeColor) => {
        currentThemeRef.current = themeName;
        setCurrentTheme(themeName);
        localStorage.setItem(STORAGE_KEY, themeName);
        applyTheme(themeName, resolvedTheme);
        setIsOpen(false);
    };

    if (!mounted) {
        return (
            <div className="flex h-9 w-9 items-center justify-center">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    const themeColors: Record<ThemeColor, string> = {
        golden: "bg-gradient-to-br from-amber-400 to-yellow-600",
        cyan: "bg-gradient-to-br from-cyan-400 to-blue-500",
        purple: "bg-gradient-to-br from-purple-400 to-violet-600",
        emerald: "bg-gradient-to-br from-emerald-400 to-green-600",
        rose: "bg-gradient-to-br from-rose-400 to-pink-600",
    };

    return (
        <div className="relative ">
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group relative flex h-8 w-9 items-center justify-center rounded-lg px-2.5",
                    "text-muted-foreground transition-all duration-300",
                    "hover:bg-primary/10 hover:text-primary",
                    isOpen && "bg-primary/10 text-primary",
                )}
                aria-label="Change color theme"
            >
                <Palette className="h-4 w-4" />
                <span
                    className={cn(
                        "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap",
                        "rounded-md border border-border bg-card px-2.5 py-1",
                        "font-mono text-[10px] text-muted-foreground shadow-lg",
                        "pointer-events-none opacity-0 transition-all duration-200",
                        "group-hover:-bottom-9 group-hover:opacity-100",
                    )}
                >
                    Colors
                </span>
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className={cn(
                            "absolute right-0 top-12 z-50 w-48 rounded-lg border border-border",
                            "bg-card/95 p-3 shadow-xl backdrop-blur-xl",
                            "animate-fade-in",
                        )}
                    >
                        <div className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Select Theme
                        </div>
                        <div className="space-y-1.5">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    onClick={() =>
                                        handleThemeChange(key as ThemeColor)
                                    }
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                                        "transition-all duration-200 hover:bg-secondary/80",
                                        currentTheme === key
                                            ? "border border-primary/50 bg-primary/10"
                                            : "border border-transparent",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full border-2 border-border shadow-sm",
                                            themeColors[key as ThemeColor],
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "flex-1 text-left font-mono text-sm",
                                            currentTheme === key
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {theme.name}
                                    </span>
                                    {currentTheme === key && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
