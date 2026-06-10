import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-bg-dark-primary">
      <Topbar />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-6 min-h-[calc(100vh-64px)]">
        <div className="max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
