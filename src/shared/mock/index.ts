import type { Company, Device, Location } from "@/shared/mock/types"
import companies from "@/shared/mock/companies.json"
import locations from "@/shared/mock/locations.json"
import devices from "@/shared/mock/devices.json"

export const companyList = companies as Company[]
export const locationList = locations as Location[]
export const deviceList = devices as Device[]
