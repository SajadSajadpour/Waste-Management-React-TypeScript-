import type { RootState } from "@/app/store"

export const selectDevices = (state: RootState) => state.devices.items
export const selectDevicesStatus = (state: RootState) => state.devices.status
export const selectDevicesError = (state: RootState) => state.devices.error
