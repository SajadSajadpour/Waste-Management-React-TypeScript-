import { cn } from "@/shared/utils/cn"

type ContextPillProps = {
  label: string
  value?: string
  className?: string
}

export function ContextPill({ label, value, className }: ContextPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {value ? <span className="text-foreground">{value}</span> : null}
    </div>
  )
}
