import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectLocationId,
  selectDeviceId,
} from "@/app/store/slices/contextSelectors"
import {
  selectAlerts,
  selectOperationsError,
  selectOperationsStatus,
} from "@/app/store/slices/operationsSelectors"
import { loadAlerts } from "@/app/store/slices/operationsSlice"

export function useAlerts() {
  const dispatch = useAppDispatch()
  const companyId = useAppSelector(selectCompanyId)
  const locationId = useAppSelector(selectLocationId)
  const deviceId = useAppSelector(selectDeviceId)
  const data = useAppSelector(selectAlerts)
  const status = useAppSelector(selectOperationsStatus)
  const error = useAppSelector(selectOperationsError)

  const refetch = useCallback(() => {
    dispatch(loadAlerts({ companyId, locationId, deviceId }))
  }, [companyId, locationId, deviceId, dispatch])

  return { data, status, error, refetch }
}
