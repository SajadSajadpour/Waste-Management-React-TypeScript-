import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import type {
  DeviceLog,
  DeviceStatus,
  DeviceTelemetry,
  FirmwareRelease,
} from "@/shared/mock/domainTypes"
import {
  fetchDeviceDiagnostics,
  fetchFirmwareReleases,
} from "@/shared/services/engineeringService"

type EngineeringState = {
  diagnostics: {
    status: DeviceStatus | null
    logs: DeviceLog | null
    telemetry: DeviceTelemetry | null
  } | null
  firmware: FirmwareRelease[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: EngineeringState = {
  diagnostics: null,
  firmware: [],
  status: "idle",
  error: null,
}

export const loadDeviceDiagnostics = createAsyncThunk(
  "engineering/loadDiagnostics",
  async (params: { deviceId: string | null }) => {
    return fetchDeviceDiagnostics(params)
  }
)

export const loadFirmware = createAsyncThunk("engineering/loadFirmware", async () => {
  return fetchFirmwareReleases()
})

const engineeringSlice = createSlice({
  name: "engineering",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDeviceDiagnostics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loadDeviceDiagnostics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.diagnostics = action.payload
      })
      .addCase(loadDeviceDiagnostics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load diagnostics"
      })
      .addCase(loadFirmware.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loadFirmware.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.firmware = action.payload
      })
      .addCase(loadFirmware.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load firmware"
      })
  },
})

export default engineeringSlice.reducer
