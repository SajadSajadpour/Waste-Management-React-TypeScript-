import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/shared/utils/cn"

type BreadcrumbsProps = {
  labelMap?: Record<string, string>
  className?: string
}

const defaultLabelMap: Record<string, string> = {
  business: "Business",
  ops: "Operations",
  eng: "Engineering",
  overview: "Overview",
  companies: "Companies",
  locations: "Locations",
  reports: "Reports",
  fleet: "Fleet",
  alerts: "Alerts",
  devices: "Devices",
  firmware: "Firmware",
  profile: "Profile",
}

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function Breadcrumbs({ labelMap, className }: BreadcrumbsProps) {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  const map = { ...defaultLabelMap, ...labelMap }

  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`
    const label = map[segment] ?? formatSegment(segment)
    return { path, label }
  })

  if (crumbs.length === 0) return null

  return (
    <nav
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-muted-foreground",
        className
      )}
    >
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.path}>
          <Link
            to={crumb.path}
            className={cn(
              "min-w-0 truncate text-ellipsis transition-colors hover:text-foreground",
              index === crumbs.length - 1 && "text-foreground"
            )}
          >
            {crumb.label}
          </Link>
          {index < crumbs.length - 1 ? (
            <span className="shrink-0 text-muted-foreground">/</span>
          ) : null}
        </Fragment>
      ))}
    </nav>
  )
}
