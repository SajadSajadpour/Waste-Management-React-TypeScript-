import type { RootState } from "@/app/store"
import {
  getCapabilitiesForPersona,
  type AuthStatus,
  type AuthUser,
  type Persona,
} from "@/app/store/slices/authSlice"
import type { TableDensity } from "@/app/store/slices/uiSlice"

const STORAGE_KEY = "foodcycler-dashboard-demo:state"

type PersistedState = {
  auth?: {
    persona?: Persona
    status?: AuthStatus
    user?: AuthUser | null
  }
  ui?: {
    sidebarCollapsed?: boolean
    tableDensity?: TableDensity
  }
}

export function loadPersistedState(): Partial<RootState> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const data = JSON.parse(raw) as PersistedState
    if (!data.auth && !data.ui) return undefined

    const persona = data.auth?.persona ?? "customerAdmin"
    const status = data.auth?.status ?? "anonymous"
    const authState = data.auth
      ? {
          persona,
          capabilities: getCapabilitiesForPersona(persona),
          status,
          user: status === "authenticated" ? data.auth.user ?? null : null,
        }
      : undefined

    const uiState = data.ui
      ? {
          sidebarCollapsed: data.ui.sidebarCollapsed ?? false,
          tableDensity: data.ui.tableDensity ?? "comfortable",
        }
      : undefined

    return {
      auth: authState,
      ui: uiState,
    }
  } catch {
    return undefined
  }
}

export function persistState(state: RootState) {
  try {
    const data: PersistedState = {
      auth: {
        persona: state.auth.persona,
        status: state.auth.status,
        user: state.auth.user,
      },
      ui: {
        sidebarCollapsed: state.ui.sidebarCollapsed,
        tableDensity: state.ui.tableDensity,
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore write failures
  }
}
