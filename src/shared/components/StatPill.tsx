import { cn } from "@/shared/utils/cn"

type StatPillProps = {
  label: string
  value: string
  className?: string
}

export function StatPill({ label, value, className }: StatPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <span className="uppercase tracking-wide">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}
