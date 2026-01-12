import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import type { Metrics } from "@/shared/mock/domainTypes"
import { fetchBusinessOverview } from "@/shared/services/businessService"

type BusinessState = {
  overview: Metrics | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: BusinessState = {
  overview: null,
  status: "idle",
  error: null,
}

export const loadBusinessOverview = createAsyncThunk(
  "business/loadOverview",
  async (params: { companyId: string | null; dateRangeKey: "last7" | "last30" | "ytd" }) => {
    return fetchBusinessOverview(params)
  }
)

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessOverview.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(loadBusinessOverview.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.overview = action.payload
      })
      .addCase(loadBusinessOverview.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load business overview"
      })
  },
})

export default businessSlice.reducer
