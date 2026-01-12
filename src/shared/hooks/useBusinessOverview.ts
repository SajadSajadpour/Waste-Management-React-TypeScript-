import { useCallback } from "react"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectCompanyId,
  selectDateRange,
} from "@/app/store/slices/contextSelectors"
import {
  selectBusinessError,
  selectBusinessOverview,
  selectBusinessStatus,
} from "@/app/store/slices/businessSelectors"
import { loadBusinessOverview } from "@/app/store/slices/businessSlice"

type DateRangeKey = "last7" | "last30" | "ytd"

function getDateRangeKey(dateRange: { start: string | null; end: string | null }): DateRangeKey {
  const today = new Date()
  const toISO = (value: Date) => value.toISOString().slice(0, 10)
  const presets: Record<DateRangeKey, { start: string; end: string }> = {
    last7: {
      start: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)),
      end: toISO(today),
    },
    last30: {
      start: toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)),
      end: toISO(today),
    },
    ytd: {
      start: toISO(new Date(today.getFullYear(), 0, 1)),
      end: toISO(today),
    },
  }

  const match = (Object.keys(presets) as DateRangeKey[]).find((key) => {
    const preset = presets[key]
    return preset.start === dateRange.start && preset.end === dateRange.end
  })

  return match ?? "last7"
}

export function useBusinessOverview() {
  const dispatch = useAppDispatch()
  const companyId = useAppSelector(selectCompanyId)
  const dateRange = useAppSelector(selectDateRange)
  const data = useAppSelector(selectBusinessOverview)
  const status = useAppSelector(selectBusinessStatus)
  const error = useAppSelector(selectBusinessError)

  const refetch = useCallback(() => {
    const dateRangeKey = getDateRangeKey(dateRange)
    dispatch(loadBusinessOverview({ companyId, dateRangeKey }))
  }, [companyId, dateRange, dispatch])

  return { data, status, error, refetch }
}
