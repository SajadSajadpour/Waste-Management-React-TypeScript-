export type Metrics = {
  companyId: string
  dateRangeKey: "last7" | "last30" | "ytd"
  co2AvoidedKg: number
  wasteDivertedKg: number
  cyclesCompleted: number
  maintenanceRequiredCount: number
}

export type DeviceStatus = {
  deviceId: string
  status: "online" | "offline" | "maintenance"
  lastSeen: string
  firmwareVersion: string
  cycles7d: number
  needsMaintenance: boolean
}

export type Alert = {
  id: string
  companyId: string
  locationId: string
  deviceId: string
  severity: "info" | "warn" | "critical"
  state: "open" | "ack" | "resolved"
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export type LogEntry = {
  ts: string
  level: "debug" | "info" | "warn" | "error"
  message: string
}

export type DeviceLog = {
  deviceId: string
  entries: LogEntry[]
}

export type TelemetryEntry = {
  ts: string
  tempC: number
  motorLoadPct: number
  cyclePhase: "idle" | "load" | "grind" | "dry" | "cooldown" | "complete"
  doorOpen: boolean
}

export type DeviceTelemetry = {
  deviceId: string
  entries: TelemetryEntry[]
}

export type FirmwareRelease = {
  version: string
  releasedAt: string
  rollout: "staged" | "global"
  notes: string
  status: "available" | "deprecated"
}
