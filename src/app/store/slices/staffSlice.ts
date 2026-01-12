import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Staff } from "@/shared/mock/types"
import staff from "@/shared/mock/staff.json"

type StaffState = {
  items: Staff[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: StaffState = {
  items: staff as Staff[],
  status: "succeeded",
  error: null,
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<Staff>) => {
      state.items = [action.payload, ...state.items]
    },
  },
})

export const { addStaff } = staffSlice.actions
export default staffSlice.reducer
