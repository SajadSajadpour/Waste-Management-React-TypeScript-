import type { Capability } from "@/app/store/slices/authSlice"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CircuitBoard,
  Cpu,
  HardDrive,
  LayoutDashboard,
  MapPin,
  Users,
  User,
} from "lucide-react"

export const routePaths = {
  business: {
    overview: "/business/overview",
    companies: "/business/companies",
    deviceDetail: (deviceId: string) => `/business/devices/${deviceId}`,
    companyDetail: (companyId: string) => `/business/companies/${companyId}`,
    devices: "/business/devices",
    locations: "/business/locations",
    staff: "/business/staff",
    reports: "/business/reports",
  },
  operations: {
    fleet: "/ops/fleet",
    alerts: "/ops/alerts",
    locations: "/ops/locations",
  },
  engineering: {
    devices: "/eng/devices",
    deviceDetail: (deviceId: string) => `/eng/devices/${deviceId}`,
    firmware: "/eng/firmware",
  },
  account: {
    profile: "/profile",
  },
  auth: {
    login: "/login",
  },
} as const

export type NavItem = {
  label: string
  shortLabel: string
  to: string
  icon: LucideIcon
  requiredCapabilities?: Capability[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
  requiredCapabilities?: Capability[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Business",
    requiredCapabilities: ["can_view_business"],
    items: [
      {
        label: "Overview",
        shortLabel: "Ov",
        to: routePaths.business.overview,
        icon: LayoutDashboard,
      },
      {
        label: "Companies",
        shortLabel: "Co",
        to: routePaths.business.companies,
        icon: Building2,
      },
      {
        label: "Devices",
        shortLabel: "Dv",
        to: routePaths.business.devices,
        icon: HardDrive,
      },
      {
        label: "Locations",
        shortLabel: "Lo",
        to: routePaths.business.locations,
        icon: MapPin,
      },
      {
        label: "Staff",
        shortLabel: "St",
        to: routePaths.business.staff,
        icon: Users,
      },
      {
        label: "Reports",
        shortLabel: "Rp",
        to: routePaths.business.reports,
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Operations",
    requiredCapabilities: ["can_view_ops"],
    items: [
      {
        label: "Fleet",
        shortLabel: "Fl",
        to: routePaths.operations.fleet,
        icon: Activity,
      },
      {
        label: "Alerts",
        shortLabel: "Al",
        to: routePaths.operations.alerts,
        icon: Bell,
      },
      {
        label: "Locations",
        shortLabel: "Lo",
        to: routePaths.operations.locations,
        icon: MapPin,
      },
    ],
  },
  {
    label: "Engineering",
    requiredCapabilities: ["can_view_eng"],
    items: [
      {
        label: "Devices",
        shortLabel: "Dv",
        to: routePaths.engineering.devices,
        icon: Cpu,
      },
      {
        label: "Firmware",
        shortLabel: "Fw",
        to: routePaths.engineering.firmware,
        icon: CircuitBoard,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Profile",
        shortLabel: "Pr",
        to: routePaths.account.profile,
        icon: User,
      },
    ],
  },
]
