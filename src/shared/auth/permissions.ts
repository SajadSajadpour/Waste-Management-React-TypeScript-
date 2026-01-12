import type { Capability } from "@/app/store/slices/authSlice"

export function hasCapability(
  capabilities: Capability[],
  capability: Capability
) {
  return capabilities.includes(capability)
}
