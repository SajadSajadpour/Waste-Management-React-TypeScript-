import { type ReactNode } from "react"

import { cn } from "@/shared/utils/cn"

type ToolbarProps = {
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function Toolbar({ title, description, actions, className }: ToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className="space-y-1">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
