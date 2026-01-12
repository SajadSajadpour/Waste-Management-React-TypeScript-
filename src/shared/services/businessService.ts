import type { Metrics } from "@/shared/mock/domainTypes"
import { metricsData } from "@/shared/mock/domainData"
import { sleep } from "@/shared/services/sleep"

type BusinessOverviewParams = {
  companyId: string | null
  dateRangeKey: "last7" | "last30" | "ytd"
}

export async function fetchBusinessOverview({
  companyId,
  dateRangeKey,
}: BusinessOverviewParams): Promise<Metrics | null> {
  await sleep()
  if (!companyId) return null
  return (
    metricsData.find(
      (metric) =>
        metric.companyId === companyId && metric.dateRangeKey === dateRangeKey
    ) ?? null
  )
}
