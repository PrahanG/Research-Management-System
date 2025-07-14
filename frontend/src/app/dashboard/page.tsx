import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {Projects} from "@/components/projects"
import { Stats } from "@/components/stats"
import { Profile } from "@/components/profile"
export default function Page() {
  return (
  <ProtectedRoute>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Profile/>
              
              <div className="px-4 lg:px-6">
                <Stats/>
              </div>
              <div className="px-4 lg:px-6">
                <Projects/>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </ProtectedRoute>  
  )
}
