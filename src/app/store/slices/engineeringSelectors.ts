import type { RootState } from "@/app/store"

export const selectDiagnostics = (state: RootState) => state.engineering.diagnostics
export const selectFirmware = (state: RootState) => state.engineering.firmware
export const selectEngineeringStatus = (state: RootState) => state.engineering.status
export const selectEngineeringError = (state: RootState) => state.engineering.error
