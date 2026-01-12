import type {
  Alert,
  DeviceLog,
  DeviceStatus,
  DeviceTelemetry,
  FirmwareRelease,
  Metrics,
} from "@/shared/mock/domainTypes"
import alerts from "@/shared/mock/alerts.json"
import deviceStatus from "@/shared/mock/deviceStatus.json"
import firmware from "@/shared/mock/firmware.json"
import logs from "@/shared/mock/logs.json"
import metrics from "@/shared/mock/metrics.json"
import telemetry from "@/shared/mock/telemetry.json"

export const metricsData = metrics as Metrics[]
export const deviceStatusData = deviceStatus as DeviceStatus[]
export const alertsData = alerts as Alert[]
export const logsData = logs as DeviceLog[]
export const telemetryData = telemetry as DeviceTelemetry[]
export const firmwareData = firmware as FirmwareRelease[]
