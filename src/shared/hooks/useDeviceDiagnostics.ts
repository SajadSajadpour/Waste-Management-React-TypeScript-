import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectDeviceId } from "@/app/store/slices/contextSelectors"
import {
  selectDiagnostics,
  selectEngineeringError,
  selectEngineeringStatus,
} from "@/app/store/slices/engineeringSelectors"
import { loadDeviceDiagnostics } from "@/app/store/slices/engineeringSlice"

export function useDeviceDiagnostics() {
  const dispatch = useAppDispatch()
  const deviceId = useAppSelector(selectDeviceId)
  const data = useAppSelector(selectDiagnostics)
  const status = useAppSelector(selectEngineeringStatus)
  const error = useAppSelector(selectEngineeringError)

  const refetch = useCallback(() => {
    dispatch(loadDeviceDiagnostics({ deviceId }))
  }, [deviceId, dispatch])

  return { data, status, error, refetch }
}
