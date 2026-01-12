import type { ReactElement } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/app/layout/AppShell"
import { routePaths } from "@/app/router/routes"
import { selectHasCapability, selectIsAuthenticated } from "@/app/store/slices/authSelectors"
import { useAppSelector } from "@/app/store/hooks"
import { AlertsPage } from "@/domains/operations/pages/AlertsPage"
import { FleetPage } from "@/domains/operations/pages/FleetPage"
import { LocationsPage as OpsLocationsPage } from "@/domains/operations/pages/LocationsPage"
import { CompaniesPage } from "@/domains/business/pages/CompaniesPage"
import { CompanyDetailPage } from "@/domains/business/pages/CompanyDetailPage"
import { BusinessDeviceDetailPage } from "@/domains/business/pages/BusinessDeviceDetailPage"
import { OverviewPage } from "@/domains/business/pages/OverviewPage"
import { ReportsPage } from "@/domains/business/pages/ReportsPage"
import { DeviceDetailPage } from "@/domains/engineering/pages/DeviceDetailPage"
import { EngineeringDevicesPage } from "@/domains/engineering/pages/EngineeringDevicesPage"
import { FirmwarePage } from "@/domains/engineering/pages/FirmwarePage"
import { DevicesPage } from "@/pages/DevicesPage"
import { LoginPage } from "@/pages/LoginPage"
import { LocationsPage } from "@/pages/LocationsPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { StaffPage } from "@/pages/StaffPage"

function RequireAuth({ children }: { children: ReactElement }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={routePaths.auth.login} replace={true} />
  }
  return children
}

function RequireCapability({
  capability,
  children,
}: {
  capability: Parameters<typeof selectHasCapability>[0]
  children: ReactElement
}) {
  const hasCapability = useAppSelector(selectHasCapability(capability))
  const canViewBusiness = useAppSelector(selectHasCapability("can_view_business"))
  const canViewOps = useAppSelector(selectHasCapability("can_view_ops"))

  if (!hasCapability) {
    const fallback = canViewBusiness
      ? routePaths.business.overview
      : canViewOps
        ? routePaths.operations.fleet
        : routePaths.auth.login
    return <Navigate to={fallback} replace={true} />
  }
  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routePaths.auth.login} element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <Navigate to={routePaths.business.overview} replace={true} />
            }
          />
          <Route
            path={routePaths.business.overview}
            element={<OverviewPage />}
          />
          <Route
            path={routePaths.business.companies}
            element={<CompaniesPage />}
          />
          <Route
            path="/business/companies/:companyId"
            element={<CompanyDetailPage />}
          />
          <Route
            path={routePaths.business.devices}
            element={<DevicesPage />}
          />
          <Route
            path={routePaths.business.deviceDetail(":deviceId")}
            element={<BusinessDeviceDetailPage />}
          />
          <Route
            path={routePaths.business.locations}
            element={<LocationsPage />}
          />
          <Route path={routePaths.business.staff} element={<StaffPage />} />
          <Route
            path={routePaths.business.reports}
            element={<ReportsPage />}
          />
          <Route path={routePaths.operations.fleet} element={<FleetPage />} />
          <Route path={routePaths.operations.alerts} element={<AlertsPage />} />
          <Route
            path={routePaths.operations.locations}
            element={<OpsLocationsPage />}
          />
          <Route
            path={routePaths.engineering.devices}
            element={
              <RequireCapability capability="can_view_eng">
                <EngineeringDevicesPage />
              </RequireCapability>
            }
          />
          <Route
            path="/eng/devices/:deviceId"
            element={
              <RequireCapability capability="can_view_eng">
                <DeviceDetailPage />
              </RequireCapability>
            }
          />
          <Route
            path={routePaths.engineering.firmware}
            element={
              <RequireCapability capability="can_view_eng">
                <FirmwarePage />
              </RequireCapability>
            }
          />
          <Route path={routePaths.account.profile} element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
