"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function FinanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
      <p className="text-2xl">⚠️</p>
      <div>
        <p className="font-semibold">Đã có lỗi xảy ra</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
      <Button onClick={reset} variant="outline">
        Thử lại
      </Button>
    </div>
  );
}
