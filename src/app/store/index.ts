import { combineReducers, configureStore } from "@reduxjs/toolkit"

import authReducer from "./slices/authSlice"
import businessReducer from "./slices/businessSlice"
import companiesReducer from "./slices/companiesSlice"
import contextReducer from "./slices/contextSlice"
import devicesReducer from "./slices/devicesSlice"
import engineeringReducer from "./slices/engineeringSlice"
import locationsReducer from "./slices/locationsSlice"
import operationsReducer from "./slices/operationsSlice"
import reportsReducer from "./slices/reportsSlice"
import staffReducer from "./slices/staffSlice"
import uiReducer from "./slices/uiSlice"
import { loadPersistedState, persistState } from "./persist"

const reducersMap = {
  auth: authReducer,
  business: businessReducer,
  companies: companiesReducer,
  context: contextReducer,
  devices: devicesReducer,
  engineering: engineeringReducer,
  locations: locationsReducer,
  operations: operationsReducer,
  reports: reportsReducer,
  staff: staffReducer,
  ui: uiReducer,
}

const rootReducer = combineReducers(reducersMap)

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
})

let hasHydrated = false
store.subscribe(() => {
  if (!hasHydrated) {
    hasHydrated = true
  }
  persistState(store.getState())
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
