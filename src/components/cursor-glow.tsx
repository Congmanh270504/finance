"use client";

import * as React from "react";

export function CursorGlow() {
  const [pos, setPos] = React.useState({ x: -999, y: -999 });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      aria-hidden
    >
      <div
        className="absolute size-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: pos.x,
          top: pos.y,
          background:
            "radial-gradient(circle, var(--glow-color) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
