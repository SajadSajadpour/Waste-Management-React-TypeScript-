import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/cn"

const statusBadgeVariants = cva("border-transparent", {
  variants: {
    variant: {
      online: "bg-emerald-500/15 text-emerald-700",
      offline: "bg-slate-500/15 text-slate-700",
      maintenance: "bg-amber-500/15 text-amber-700",
      info: "bg-sky-500/15 text-sky-700",
      warn: "bg-orange-500/15 text-orange-700",
      critical: "bg-rose-500/15 text-rose-700",
    },
  },
  defaultVariants: {
    variant: "info",
  },
})

type StatusBadgeProps = {
  label: string
  className?: string
  showDot?: boolean
} & VariantProps<typeof statusBadgeVariants>

const dotColors: Record<
  NonNullable<StatusBadgeProps["variant"]>,
  string
> = {
  online: "bg-emerald-500",
  offline: "bg-slate-500",
  maintenance: "bg-amber-500",
  info: "bg-sky-500",
  warn: "bg-orange-500",
  critical: "bg-rose-500",
}

export function StatusBadge({
  label,
  variant = "info",
  showDot = true,
  className,
}: StatusBadgeProps) {
  const safeVariant = variant ?? "info"
  return (
    <Badge
      className={cn(statusBadgeVariants({ variant: safeVariant }), className)}
      variant="secondary"
    >
      {showDot ? (
        <span
          className={cn(
            "mr-1.5 inline-block h-2 w-2 rounded-full",
            dotColors[safeVariant]
          )}
        />
      ) : null}
      <span className="capitalize">{label}</span>
    </Badge>
  )
}
