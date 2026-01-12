export type Company = {
  id: string
  name: string
}

export type Location = {
  id: string
  name: string
  companyId: string
}

export type Device = {
  id: string
  name: string
  locationId: string
}

export type Staff = {
  id: string
  name: string
  email: string
  role: "Admin" | "Manager" | "Staff"
  companyId: string
  locationId: string
  createdAt?: string
}

export type Report = {
  id: string
  name: string
  type: "Usage" | "Fleet" | "Compliance"
  companyId: string
  locationId: string
  createdAt?: string
}
