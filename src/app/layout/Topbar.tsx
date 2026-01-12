import { useEffect, useMemo, useState } from "react"
import { PanelLeft, Search } from "lucide-react"

import { toggleSidebar } from "@/app/store/slices/uiSlice"
import { setPersona, type Persona } from "@/app/store/slices/authSlice"
import {
  setCompanyId,
  setDateRange,
  setDeviceId,
  setLocationId,
} from "@/app/store/slices/contextSlice"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectDateRange,
  selectDeviceId,
  selectLocationId,
} from "@/app/store/slices/contextSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { selectDevices } from "@/app/store/slices/devicesSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import { companyList } from "@/shared/mock"
import { Breadcrumbs } from "@/shared/components/Breadcrumbs"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

const personas: Persona[] = ["customerAdmin", "internalOps", "engineer"]

const datePresets = [
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "ytd", label: "YTD" },
] as const

type DatePresetKey = (typeof datePresets)[number]["key"]

function getPresetRange(key: DatePresetKey) {
  const today = new Date()
  const end = new Date(today)
  let start = new Date(today)

  if (key === "last7") {
    start.setDate(start.getDate() - 6)
  }
  if (key === "last30") {
    start.setDate(start.getDate() - 29)
  }
  if (key === "ytd") {
    start = new Date(today.getFullYear(), 0, 1)
  }

  const toISO = (value: Date) => value.toISOString().slice(0, 10)
  return { start: toISO(start), end: toISO(end) }
}

export function Topbar() {
  const dispatch = useAppDispatch()
  const { persona } = useAppSelector((state) => state.auth)
  const companyId = useAppSelector(selectCompanyId)
  const locationId = useAppSelector(selectLocationId)
  const deviceId = useAppSelector(selectDeviceId)
  const dateRange = useAppSelector(selectDateRange)
  const locationsFromStore = useAppSelector(selectLocations)
  const devicesFromStore = useAppSelector(selectDevices)
  const companiesFromStore = useAppSelector(selectCompanies)

  const [isContextOpen, setIsContextOpen] = useState(false)

  const locations = useMemo(
    () =>
      locationsFromStore.filter(
        (location) => location.companyId === companyId
      ),
    [companyId, locationsFromStore]
  )
  const devices = useMemo(
    () =>
      devicesFromStore.filter(
        (device) => device.locationId === locationId
      ),
    [locationId, devicesFromStore]
  )

  const selectedPreset = useMemo(() => {
    return datePresets.find((preset) => {
      const range = getPresetRange(preset.key)
      return range.start === dateRange.start && range.end === dateRange.end
    })
  }, [dateRange.end, dateRange.start])

  const breadcrumbLabelMap = useMemo(() => {
    return Object.fromEntries(
      companiesFromStore.map((company) => [company.id, company.name])
    )
  }, [companiesFromStore])

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      const range = getPresetRange("last7")
      dispatch(setDateRange(range))
    }
  }, [dateRange.end, dateRange.start, dispatch])

  const contextSelects = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <Select
        value={companyId ?? undefined}
        onValueChange={(value) => {
          dispatch(setCompanyId(value))
          dispatch(setLocationId(null))
          dispatch(setDeviceId(null))
        }}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Select company" />
        </SelectTrigger>
        <SelectContent>
          {companyList.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={locationId ?? undefined}
        onValueChange={(value) => {
          dispatch(setLocationId(value))
          dispatch(setDeviceId(null))
        }}
        disabled={!companyId}
      >
        <SelectTrigger className="w-full md:w-[170px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={deviceId ?? undefined}
        onValueChange={(value) => dispatch(setDeviceId(value))}
        disabled={!locationId}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Device" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              {device.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedPreset?.key}
        onValueChange={(value) => {
          const range = getPresetRange(value as DatePresetKey)
          dispatch(setDateRange(range))
        }}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {datePresets.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden min-w-0 md:flex">
          <Breadcrumbs labelMap={breadcrumbLabelMap} />
        </div>
        <div className="text-sm font-semibold">Persona</div>
        <Select
          value={persona}
          onValueChange={(value) => dispatch(setPersona(value as Persona))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select persona" />
          </SelectTrigger>
          <SelectContent>
            {personas.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden lg:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-[260px] pl-9"
              placeholder="Search devices, locations, alerts... (demo)"
              aria-label="Global search"
            />
          </div>
        </div>
        <div className="hidden md:flex">{contextSelects}</div>
        <div className="md:hidden">
          <Button variant="outline" size="sm" onClick={() => setIsContextOpen(true)}>
            Context
          </Button>
          <Drawer open={isContextOpen} onOpenChange={setIsContextOpen}>
            <DrawerContent>
              <div className="space-y-4">
                <DrawerTitle>Context</DrawerTitle>
                {contextSelects}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
