import type { RootState } from "@/app/store"

export const selectStaff = (state: RootState) => state.staff.items
export const selectStaffStatus = (state: RootState) => state.staff.status
export const selectStaffError = (state: RootState) => state.staff.error
