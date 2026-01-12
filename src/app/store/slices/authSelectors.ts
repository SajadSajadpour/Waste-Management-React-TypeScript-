import type { RootState } from "@/app/store"
import type { Capability } from "@/app/store/slices/authSlice"
import { hasCapability } from "@/shared/auth/permissions"

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated"
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectPersona = (state: RootState) => state.auth.persona
export const selectCapabilities = (state: RootState) => state.auth.capabilities

export const selectHasCapability = (capability: Capability) => (state: RootState) =>
  hasCapability(state.auth.capabilities, capability)

export const selectIsEngineer = (state: RootState) =>
  state.auth.persona === "engineer"
