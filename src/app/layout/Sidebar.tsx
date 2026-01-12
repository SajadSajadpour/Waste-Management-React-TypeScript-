import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { navGroups, routePaths } from "@/app/router/routes"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { logout } from "@/app/store/slices/authSlice"
import { AppTitle } from "@/shared/components/AppTitle"
import { IconNavItem } from "@/shared/components/IconNavItem"
import { cn } from "@/shared/utils/cn"

export function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { capabilities } = useAppSelector((state) => state.auth)
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  const hasAny = (required?: string[]) =>
    !required || required.some((capability) => capabilities.includes(capability))

  const getVisibleItems = (group: (typeof navGroups)[number]) => {
    if (!hasAny(group.requiredCapabilities)) return []
    return group.items.filter((item) => hasAny(item.requiredCapabilities))
  }

  const renderGroup = (
    label: string,
    items: (typeof navGroups)[number]["items"]
  ) => (
    <div key={label} className="space-y-2">
      {sidebarCollapsed ? (
        <div className="my-2 h-px bg-sidebar-border" />
      ) : (
        <div className="px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <IconNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            collapsed={sidebarCollapsed}
          />
        ))}
      </div>
    </div>
  )

  const accountGroup = navGroups.find((group) => group.label === "Account")
  const accountItems = accountGroup ? getVisibleItems(accountGroup) : []

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center px-4", sidebarCollapsed && "justify-center")}>
        {sidebarCollapsed ? <span className="text-lg font-semibold">FC</span> : <AppTitle />}
      </div>
      <nav className="flex-1 space-y-6 px-3 pb-6">
        {navGroups
          .filter((group) => group.label !== "Account")
          .map((group) => {
            const visibleItems = getVisibleItems(group)
            if (visibleItems.length === 0) return null
            return renderGroup(group.label, visibleItems)
          })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border px-3 pt-4 pb-4">
        <div className="space-y-3">
          {accountGroup && accountItems.length > 0
            ? renderGroup(accountGroup.label, accountItems)
            : null}
          <button
            type="button"
            title="Logout"
            onClick={() => {
              dispatch(logout())
              navigate(routePaths.auth.login, { replace: true })
            }}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              sidebarCollapsed && "justify-center"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                "text-muted-foreground group-hover:text-sidebar-accent-foreground"
              )}
            >
              <LogOut className="h-4 w-4" />
            </span>
            {!sidebarCollapsed ? <span className="truncate">Logout</span> : null}
          </button>
        </div>
      </div>
    </aside>
  )
}
