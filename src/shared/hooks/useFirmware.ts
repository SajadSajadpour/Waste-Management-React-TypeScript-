import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectEngineeringError,
  selectEngineeringStatus,
  selectFirmware,
} from "@/app/store/slices/engineeringSelectors"
import { loadFirmware } from "@/app/store/slices/engineeringSlice"

export function useFirmware() {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectFirmware)
  const status = useAppSelector(selectEngineeringStatus)
  const error = useAppSelector(selectEngineeringError)

  const refetch = useCallback(() => {
    dispatch(loadFirmware())
  }, [dispatch])

  return { data, status, error, refetch }
}
