import type { RootState } from "@/app/store"

export const selectCompanies = (state: RootState) => state.companies.items
export const selectCompaniesStatus = (state: RootState) => state.companies.status
export const selectCompaniesError = (state: RootState) => state.companies.error
