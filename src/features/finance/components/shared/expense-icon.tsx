import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  Gamepad2,
  Zap,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
}

function getCategory(title: string): CategoryConfig {
  const t = title.toLowerCase();
  if (/ăn|cơm|bữa|nhà hàng|quán|cafe|cà phê|bia|uống|snack/.test(t))
    return { icon: UtensilsCrossed, bg: "bg-orange-500/10", color: "text-orange-500" };
  if (/xe|xăng|taxi|grab|đi lại|giao thông|vé/.test(t))
    return { icon: Car, bg: "bg-sky-500/10", color: "text-sky-500" };
  if (/siêu thị|shop|mua|sắm/.test(t))
    return { icon: ShoppingCart, bg: "bg-pink-500/10", color: "text-pink-500" };
  if (/phim|game|giải trí|karaoke/.test(t))
    return { icon: Gamepad2, bg: "bg-violet-500/10", color: "text-violet-500" };
  if (/điện|nước|internet|wifi/.test(t))
    return { icon: Zap, bg: "bg-yellow-500/10", color: "text-yellow-500" };
  return { icon: Banknote, bg: "bg-primary/10", color: "text-primary" };
}

export function ExpenseCategoryIcon({
  title,
  size = "size-9",
  iconSize = "size-4",
  className,
}: {
  title: string;
  size?: string;
  iconSize?: string;
  className?: string;
}) {
  const { icon: Icon, bg, color } = getCategory(title);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 dark:ring-white/5",
        size,
        bg,
        className,
      )}
    >
      <Icon className={cn(iconSize, color)} />
    </div>
  );
}
