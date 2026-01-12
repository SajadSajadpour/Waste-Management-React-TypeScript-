import type {
  DeviceLog,
  DeviceStatus,
  DeviceTelemetry,
  FirmwareRelease,
} from "@/shared/mock/domainTypes"
import {
  deviceStatusData,
  firmwareData,
  logsData,
  telemetryData,
} from "@/shared/mock/domainData"
import { sleep } from "@/shared/services/sleep"

type DeviceDiagnosticsParams = {
  deviceId: string | null
}

export async function fetchDeviceDiagnostics({
  deviceId,
}: DeviceDiagnosticsParams): Promise<{
  status: DeviceStatus | null
  logs: DeviceLog | null
  telemetry: DeviceTelemetry | null
}> {
  await sleep()
  if (!deviceId) {
    return { status: null, logs: null, telemetry: null }
  }

  return {
    status: deviceStatusData.find((entry) => entry.deviceId === deviceId) ?? null,
    logs: logsData.find((entry) => entry.deviceId === deviceId) ?? null,
    telemetry: telemetryData.find((entry) => entry.deviceId === deviceId) ?? null,
  }
}

export async function fetchFirmwareReleases(): Promise<FirmwareRelease[]> {
  await sleep()
  return firmwareData
}
