import { type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

import { cn } from "@/shared/utils/cn"

type ErrorStateProps = {
  title: string
  description?: string
  action?: ReactNode
  icon?: typeof AlertTriangle
  className?: string
}

export function ErrorState({
  title,
  description,
  action,
  icon: Icon = AlertTriangle,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center", className)}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="h-5 w-5 text-destructive" />
      </div>
      <div className="text-lg font-semibold text-destructive">{title}</div>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
