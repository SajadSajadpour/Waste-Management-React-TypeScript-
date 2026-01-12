import type { RootState } from "@/app/store"

export const selectCompanyId = (state: RootState) => state.context.companyId
export const selectLocationId = (state: RootState) => state.context.locationId
export const selectDeviceId = (state: RootState) => state.context.deviceId
export const selectDateRange = (state: RootState) => state.context.dateRange
