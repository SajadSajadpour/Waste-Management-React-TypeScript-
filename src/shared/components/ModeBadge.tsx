import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/cn"

const modeBadgeVariants = cva("border-transparent", {
  variants: {
    variant: {
      business: "bg-indigo-500/15 text-indigo-700",
      ops: "bg-teal-500/15 text-teal-700",
      eng: "bg-violet-500/15 text-violet-700",
    },
  },
  defaultVariants: {
    variant: "business",
  },
})

type ModeBadgeProps = {
  label: string
  className?: string
} & VariantProps<typeof modeBadgeVariants>

export function ModeBadge({ label, variant, className }: ModeBadgeProps) {
  return (
    <Badge className={cn(modeBadgeVariants({ variant }), className)} variant="secondary">
      {label}
    </Badge>
  )
}
