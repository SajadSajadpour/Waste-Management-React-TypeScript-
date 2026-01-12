import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/shared/utils/cn"

type IconNavItemProps = {
  to: string
  label: string
  icon: LucideIcon
  collapsed?: boolean
}

export function IconNavItem({ to, label, icon: Icon, collapsed }: IconNavItemProps) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          collapsed && "justify-center"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span className="absolute left-0 h-6 w-1 rounded-r bg-sidebar-foreground" />
          ) : null}
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              "text-muted-foreground group-hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          {!collapsed ? <span className="truncate">{label}</span> : null}
        </>
      )}
    </NavLink>
  )
}
