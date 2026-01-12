import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Company } from "@/shared/mock/types"
import companies from "@/shared/mock/companies.json"

type CompaniesState = {
  items: Company[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CompaniesState = {
  items: companies as Company[],
  status: "succeeded",
  error: null,
}

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<Company>) => {
      state.items = [action.payload, ...state.items]
    },
  },
})

export const { addCompany } = companiesSlice.actions
export default companiesSlice.reducer
