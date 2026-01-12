import type { RootState } from "@/app/store"

export const selectFleet = (state: RootState) => state.operations.fleet
export const selectAlerts = (state: RootState) => state.operations.alerts
export const selectOperationsStatus = (state: RootState) => state.operations.status
export const selectOperationsError = (state: RootState) => state.operations.error
