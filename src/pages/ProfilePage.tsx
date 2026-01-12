import { useEffect, useMemo, useState } from "react"

import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { ContentCard } from "@/shared/components/ContentCard"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { setTableDensity } from "@/app/store/slices/uiSlice"
import { selectAuthUser } from "@/app/store/slices/authSelectors"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const tableDensity = useAppSelector((state) => state.ui.tableDensity)
  const user = useAppSelector(selectAuthUser)
  const [initialProfile, setInitialProfile] = useState({
    name: "Avery Morgan",
    email: "avery.morgan@foodcycler.demo",
  })
  const [name, setName] = useState(initialProfile.name)
  const [email, setEmail] = useState(initialProfile.email)
  const [saveMessage, setSaveMessage] = useState("")

  const isValid = useMemo(() => {
    return name.trim().length > 0 && email.trim().includes("@")
  }, [email, name])

  const isDirty = useMemo(() => {
    return name !== initialProfile.name || email !== initialProfile.email
  }, [email, initialProfile.email, initialProfile.name, name])

  useEffect(() => {
    if (!saveMessage) return
    const timer = setTimeout(() => setSaveMessage(""), 3000)
    return () => clearTimeout(timer)
  }, [saveMessage])

  const handleSave = () => {
    if (!isValid || !isDirty) return
    setInitialProfile({ name: name.trim(), email: email.trim() })
    setSaveMessage("Profile updated (demo only).")
  }

  const handleCancel = () => {
    setName(initialProfile.name)
    setEmail(initialProfile.email)
    setSaveMessage("")
  }

  return (
    <PageLayout>
      <PageHeader
        title="Profile"
        description="Account preferences and authentication settings will live here."
      />
      <Section
        title="Profile details"
        description="Update your contact details for this demo account."
      >
        <ContentCard>
          <div className="space-y-4">
            {user?.email ? (
              <div className="text-sm text-muted-foreground">
                Signed in as <span className="text-foreground">{user.email}</span>
              </div>
            ) : null}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="profile-name">
                Full name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="profile-email">
                Email
              </label>
              <Input
                id="profile-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleSave} disabled={!isValid || !isDirty}>
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
                Cancel
              </Button>
              {saveMessage ? (
                <span className="text-sm text-muted-foreground">{saveMessage}</span>
              ) : null}
            </div>
          </div>
        </ContentCard>
      </Section>
      <Section
        title="UI Preferences"
        description="Set how dense table layouts should feel."
      >
        <ContentCard>
          <div className="flex items-center gap-2">
            <Button
              variant={tableDensity === "comfortable" ? "default" : "outline"}
              onClick={() => dispatch(setTableDensity("comfortable"))}
            >
              Comfortable
            </Button>
            <Button
              variant={tableDensity === "compact" ? "default" : "outline"}
              onClick={() => dispatch(setTableDensity("compact"))}
            >
              Compact
            </Button>
          </div>
        </ContentCard>
      </Section>
    </PageLayout>
  )
}
