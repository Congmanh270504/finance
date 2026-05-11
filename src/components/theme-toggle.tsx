"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const dark = mounted ? resolvedTheme === "dark" : false;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={!mounted}
      className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10"
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
