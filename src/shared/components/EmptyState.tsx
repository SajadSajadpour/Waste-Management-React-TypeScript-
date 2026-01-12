import { type ReactNode } from "react"
import { Inbox } from "lucide-react"

import { cn } from "@/shared/utils/cn"

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  icon?: typeof Inbox
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center", className)}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-lg font-semibold text-foreground">{title}</div>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
