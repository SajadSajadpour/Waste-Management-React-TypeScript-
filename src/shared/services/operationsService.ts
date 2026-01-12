import type { Alert, DeviceStatus } from "@/shared/mock/domainTypes"
import { alertsData, deviceStatusData } from "@/shared/mock/domainData"
import { deviceList, locationList } from "@/shared/mock"
import { sleep } from "@/shared/services/sleep"

type FleetParams = {
  companyId: string | null
  locationId: string | null
  deviceIds?: string[]
}

type AlertsParams = {
  companyId: string | null
  locationId: string | null
  deviceId: string | null
}

export async function fetchFleetStatus({
  companyId,
  locationId,
  deviceIds,
}: FleetParams): Promise<DeviceStatus[]> {
  await sleep()
  let results = deviceStatusData

  if (deviceIds && deviceIds.length > 0) {
    results = results.filter((device) => deviceIds.includes(device.deviceId))
  }

  if (!companyId && !locationId) {
    return results
  }

  const filteredDevices = deviceList.filter((device) => {
    if (locationId && device.locationId !== locationId) return false
    if (companyId) {
      const location = locationList.find(
        (candidate) => candidate.id === device.locationId
      )
      return location?.companyId === companyId
    }
    return true
  })

  const filteredIds = new Set(filteredDevices.map((device) => device.id))
  return results.filter((device) => filteredIds.has(device.deviceId))
}

export async function fetchAlerts({
  companyId,
  locationId,
  deviceId,
}: AlertsParams): Promise<Alert[]> {
  await sleep()
  return alertsData.filter((alert) => {
    if (companyId && alert.companyId !== companyId) return false
    if (locationId && alert.locationId !== locationId) return false
    if (deviceId && alert.deviceId !== deviceId) return false
    return true
  })
}
