import type { RootState } from "@/app/store"

export const selectBusinessOverview = (state: RootState) => state.business.overview
export const selectBusinessStatus = (state: RootState) => state.business.status
export const selectBusinessError = (state: RootState) => state.business.error
