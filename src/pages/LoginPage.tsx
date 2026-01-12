import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { login } from "@/app/store/slices/authSlice"
import { selectIsAuthenticated } from "@/app/store/slices/authSelectors"
import { routePaths } from "@/app/router/routes"
import { PageHeader } from "@/shared/components/PageHeader"
import { PageLayout } from "@/shared/components/PageLayout"
import { Section } from "@/shared/components/Section"
import { ContentCard } from "@/shared/components/ContentCard"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const isValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0
  }, [email, password])

  if (isAuthenticated) {
    return <Navigate to={routePaths.business.overview} replace={true} />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return
    const name = email.split("@")[0]
    dispatch(login({ email: email.trim(), name }))
    navigate(routePaths.business.overview, { replace: true })
  }

  return (
    <PageLayout>
      <PageHeader
        title="Login"
        description="Sign in to access the FoodCycler dashboard demo."
      />
      <Section title="Account access" description="Use any email and password.">
        <ContentCard>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
              />
            </div>
            <Button type="submit" disabled={!isValid}>
              Sign in
            </Button>
          </form>
        </ContentCard>
      </Section>
    </PageLayout>
  )
}
