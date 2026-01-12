import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectLocationId,
} from "@/app/store/slices/contextSelectors"
import {
  selectFleet,
  selectOperationsError,
  selectOperationsStatus,
} from "@/app/store/slices/operationsSelectors"
import { loadFleet } from "@/app/store/slices/operationsSlice"

export function useFleet() {
  const dispatch = useAppDispatch()
  const companyId = useAppSelector(selectCompanyId)
  const locationId = useAppSelector(selectLocationId)
  const data = useAppSelector(selectFleet)
  const status = useAppSelector(selectOperationsStatus)
  const error = useAppSelector(selectOperationsError)

  const refetch = useCallback(() => {
    dispatch(loadFleet({ companyId, locationId }))
  }, [companyId, locationId, dispatch])

  return { data, status, error, refetch }
}
