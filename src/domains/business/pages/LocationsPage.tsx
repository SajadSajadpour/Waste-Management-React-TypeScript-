import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { ContentCard } from "@/shared/components/ContentCard"
import { Button } from "@/shared/ui/button"

export function LocationsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Business Locations"
        description="Rollups by region and location performance belong here."
        actions={<Button>View locations</Button>}
      />
      <Section
        title="Regional coverage"
        description="Maps and location health summaries will be presented here."
      >
        <ContentCard>
          <p className="text-sm text-muted-foreground">
            Placeholder content for business location insights.
          </p>
        </ContentCard>
      </Section>
    </PageLayout>
  )
}
