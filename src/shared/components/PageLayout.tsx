import { type PropsWithChildren } from "react"

import { cn } from "@/shared/utils/cn"

type PageLayoutProps = PropsWithChildren<{
  className?: string
}>

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-6xl flex-col gap-6",
        className
      )}
    >
      {children}
    </div>
  )
}
