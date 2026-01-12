import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routePaths } from "@/app/router/routes"
import { useAppSelector } from "@/app/store/hooks"
import { selectHasCapability } from "@/app/store/slices/authSelectors"
import { selectCompanies } from "@/app/store/slices/companiesSelectors"
import { selectDevices } from "@/app/store/slices/devicesSelectors"
import { selectLocations } from "@/app/store/slices/locationsSelectors"
import { ContentCard } from "@/shared/components/ContentCard"
import { EmptyState } from "@/shared/components/EmptyState"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { Button } from "@/shared/ui/button"

export function BusinessDeviceDetailPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const devices = useAppSelector(selectDevices)
  const locations = useAppSelector(selectLocations)
  const companies = useAppSelector(selectCompanies)
  const canViewEng = useAppSelector(selectHasCapability("can_view_eng"))

  const device = useMemo(
    () => devices.find((item) => item.id === deviceId),
    [deviceId, devices]
  )

  const location = useMemo(() => {
    if (!device) return undefined
    return locations.find((item) => item.id === device.locationId)
  }, [device, locations])

  const company = useMemo(() => {
    if (!location) return undefined
    return companies.find((item) => item.id === location.companyId)
  }, [companies, location])

  if (!deviceId || !device) {
    return (
      <PageLayout>
        <PageHeader
          title="Device"
          description="Device not found in the demo dataset."
        />
        <EmptyState
          title="Device not found"
          description="Return to the devices directory to select a valid device."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title={device.name}
        description={device.id}
        actions={
          canViewEng ? (
            <Button
              variant="outline"
              onClick={() =>
                navigate(routePaths.engineering.deviceDetail(device.id))
              }
            >
              View engineering diagnostics
            </Button>
          ) : undefined
        }
      />
      <Section title="Device overview" description="Business context for this device.">
        <ContentCard>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Device ID</div>
              <div className="text-sm font-medium text-foreground">{device.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Device Name</div>
              <div className="text-sm font-medium text-foreground">{device.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Company</div>
              <div className="text-sm font-medium text-foreground">
                {company?.name ?? "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="text-sm font-medium text-foreground">
                {location?.name ?? "Unknown"}
              </div>
            </div>
          </div>
        </ContentCard>
      </Section>
    </PageLayout>
  )
}
