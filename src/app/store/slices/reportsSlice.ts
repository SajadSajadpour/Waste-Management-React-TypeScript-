import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Report } from "@/shared/mock/types"
import reports from "@/shared/mock/reports.json"

type ReportsState = {
  items: Report[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: ReportsState = {
  items: reports as Report[],
  status: "succeeded",
  error: null,
}

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    addReport: (state, action: PayloadAction<Report>) => {
      state.items = [action.payload, ...state.items]
    },
  },
})

export const { addReport } = reportsSlice.actions
export default reportsSlice.reducer
