import type { RootState } from "@/app/store"

export const selectLocations = (state: RootState) => state.locations.items
export const selectLocationsStatus = (state: RootState) =>
  state.locations.status
export const selectLocationsError = (state: RootState) => state.locations.error
