import { type PropsWithChildren } from "react"

import { Card, CardContent } from "@/shared/ui/card"
import { cn } from "@/shared/utils/cn"

type ContentCardProps = PropsWithChildren<{
  className?: string
  contentClassName?: string
}>

export function ContentCard({
  children,
  className,
  contentClassName,
}: ContentCardProps) {
  return (
    <Card className={className}>
      <CardContent className={cn("pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
