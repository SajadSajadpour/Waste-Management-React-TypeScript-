import { type ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

type ChartCardShellProps = {
  title: string
  metric?: ReactNode
  children?: ReactNode
}

export function ChartCardShell({ title, metric, children }: ChartCardShellProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <CardTitle>{title}</CardTitle>
        {metric ? <div className="text-sm text-muted-foreground">{metric}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          {children ?? "Chart shell"}
        </div>
      </CardContent>
    </Card>
  )
}
