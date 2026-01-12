import type { RootState } from "@/app/store"

export const selectReports = (state: RootState) => state.reports.items
export const selectReportsStatus = (state: RootState) => state.reports.status
export const selectReportsError = (state: RootState) => state.reports.error
