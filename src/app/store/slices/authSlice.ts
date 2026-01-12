import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type Persona = "customerAdmin" | "internalOps" | "engineer"
export type Capability =
  | "can_view_business"
  | "can_view_ops"
  | "can_view_eng"
  | "can_view_logs"
  | "can_push_firmware"
  | "can_send_remote_commands"

export type AuthStatus = "anonymous" | "authenticated"

export type AuthUser = {
  email: string
  name?: string
}

type AuthState = {
  status: AuthStatus
  user: AuthUser | null
  persona: Persona
  capabilities: Capability[]
}

const personaCapabilities: Record<Persona, Capability[]> = {
  customerAdmin: ["can_view_business", "can_view_ops"],
  internalOps: ["can_view_business", "can_view_ops"],
  engineer: [
    "can_view_eng",
    "can_view_logs",
    "can_push_firmware",
    "can_send_remote_commands",
    "can_view_business",
    "can_view_ops"
  ],
}

export function getCapabilitiesForPersona(persona: Persona) {
  return personaCapabilities[persona]
}

const initialState: AuthState = {
  status: "anonymous",
  user: null,
  persona: "customerAdmin",
  capabilities: personaCapabilities.customerAdmin,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthUser>) => {
      state.status = "authenticated"
      state.user = action.payload
    },
    logout: (state) => {
      state.status = "anonymous"
      state.user = null
      state.persona = "customerAdmin"
      state.capabilities = personaCapabilities.customerAdmin
    },
    setPersona: (state, action: PayloadAction<Persona>) => {
      state.persona = action.payload
      state.capabilities = personaCapabilities[action.payload]
    },
  },
})

export const { login, logout, setPersona } = authSlice.actions
export default authSlice.reducer
