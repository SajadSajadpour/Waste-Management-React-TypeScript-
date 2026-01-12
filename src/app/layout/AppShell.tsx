import { Outlet } from "react-router-dom"

import { Sidebar } from "@/app/layout/Sidebar"
import { Topbar } from "@/app/layout/Topbar"

export function AppShell() {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
