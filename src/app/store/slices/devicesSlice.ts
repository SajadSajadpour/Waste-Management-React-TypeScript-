import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Device } from "@/shared/mock/types"
import devices from "@/shared/mock/devices.json"

type DevicesState = {
  items: Device[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: DevicesState = {
  items: devices as Device[],
  status: "succeeded",
  error: null,
}

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<Device>) => {
      state.items = [action.payload, ...state.items]
    },
  },
})

export const { addDevice } = devicesSlice.actions
export default devicesSlice.reducer
