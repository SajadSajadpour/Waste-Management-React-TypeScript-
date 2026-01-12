import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Alert, DeviceStatus } from "@/shared/mock/domainTypes"
import { fetchAlerts, fetchFleetStatus } from "@/shared/services/operationsService"

type OperationsState = {
  fleet: DeviceStatus[]
  alerts: Alert[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: OperationsState = {
  fleet: [],
  alerts: [],
  status: "idle",
  error: null,
}

export const loadFleet = createAsyncThunk(
  "operations/loadFleet",
  async (params: {
    companyId: string | null
    locationId: string | null
    deviceIds?: string[]
  }) => {
    return fetchFleetStatus(params)
  }
)

export const loadAlerts = createAsyncThunk(
  "operations/loadAlerts",
  async (params: { companyId: string | null; locationId: string | null; deviceId: string | null }) => {
    return fetchAlerts(params)
  }
)

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    updateAlertState: (
      state,
      action: PayloadAction<{ id: string; state: Alert["state"] }>
    ) => {
      const alert = state.alerts.find((item) => item.id === action.payload.id)
      if (alert) {
        alert.state = action.payload.state
        alert.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFleet.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loadFleet.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.fleet = action.payload
      })
      .addCase(loadFleet.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load fleet"
      })
      .addCase(loadAlerts.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loadAlerts.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.alerts = action.payload
      })
      .addCase(loadAlerts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load alerts"
      })
  },
})

export const { updateAlertState } = operationsSlice.actions
export default operationsSlice.reducer
