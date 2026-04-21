"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10"
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
