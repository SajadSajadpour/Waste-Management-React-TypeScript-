import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type DateRange = {
  start: string | null
  end: string | null
}

type ContextState = {
  companyId: string | null
  locationId: string | null
  deviceId: string | null
  dateRange: DateRange
}

const initialState: ContextState = {
  companyId: null,
  locationId: null,
  deviceId: null,
  dateRange: {
    start: null,
    end: null,
  },
}

const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    setCompanyId: (state, action: PayloadAction<string | null>) => {
      state.companyId = action.payload
    },
    setLocationId: (state, action: PayloadAction<string | null>) => {
      state.locationId = action.payload
    },
    setDeviceId: (state, action: PayloadAction<string | null>) => {
      state.deviceId = action.payload
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload
    },
  },
})

export const { setCompanyId, setLocationId, setDeviceId, setDateRange } =
  contextSlice.actions
export default contextSlice.reducer
