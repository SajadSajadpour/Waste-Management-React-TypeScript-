import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type TableDensity = "comfortable" | "compact"

type UiState = {
  sidebarCollapsed: boolean
  tableDensity: TableDensity
}

const initialState: UiState = {
  sidebarCollapsed: false,
  tableDensity: "comfortable",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setTableDensity: (state, action: PayloadAction<TableDensity>) => {
      state.tableDensity = action.payload
    },
  },
})

export const { toggleSidebar, setTableDensity } = uiSlice.actions
export default uiSlice.reducer
