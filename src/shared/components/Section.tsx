import { type PropsWithChildren, type ReactNode } from "react"

import { cn } from "@/shared/utils/cn"

type SectionProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}>

export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
