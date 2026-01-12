import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Location } from "@/shared/mock/types"
import locations from "@/shared/mock/locations.json"

type LocationsState = {
  items: Location[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: LocationsState = {
  items: locations as Location[],
  status: "succeeded",
  error: null,
}

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    addLocation: (state, action: PayloadAction<Location>) => {
      state.items = [action.payload, ...state.items]
    },
  },
})

export const { addLocation } = locationsSlice.actions
export default locationsSlice.reducer
