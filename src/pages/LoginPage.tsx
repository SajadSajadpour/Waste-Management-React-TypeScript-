import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { login } from "@/app/store/slices/authSlice"
import { selectIsAuthenticated } from "@/app/store/slices/authSelectors"
import { routePaths } from "@/app/router/routes"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/40 to-background" />
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="relative w-full max-w-4xl">
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <section className="hidden h-full flex-col justify-between gap-6 bg-muted/40 p-8 md:flex">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    FoodCycler
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Fleet intelligence, ready for action.
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Explore operational insights, device health, and compliance data in a
                    polished demo experience.
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Role-based navigation and permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Operational dashboards with filters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Device diagnostics and alerts
                  </li>
                </ul>
                <div className="rounded-lg border border-border bg-background/70 p-3 text-xs text-muted-foreground">
                  Demo access only. Use any email and password to sign in.
                </div>
              </section>
              <section className="p-6 md:p-8">
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Sign in</h2>
                  <p className="text-sm text-muted-foreground">
                    Access the FoodCycler dashboard demo.
                  </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="login-email"
                    >
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
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="login-password"
                    >
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background text-foreground"
                      />
                      Remember me
                    </label>
                    <label className="flex items-center gap-2 text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(event) => setShowPassword(event.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background text-foreground"
                      />
                      Show password
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={!isValid}>
                    Sign in
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This is a demo. Credentials are not validated.
                  </p>
                </form>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
