import { HashRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Actors from "@/pages/Actors"
import Analytics from "@/pages/Analytics"
import NationalReports from "@/pages/NationalReports"
import Agreements from "@/pages/Agreements"
import Inspections from "@/pages/Inspections"
import QuarterlyReports from "@/pages/QuarterlyReports"
import Fraud from "@/pages/Fraud"
import Prohibitions from "@/pages/Prohibitions"
import Publications from "@/pages/Publications"
import Admin from "@/pages/Admin"

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/actors" element={<Actors />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/national-reports" element={<NationalReports />} />
          <Route path="/agreements" element={<Agreements />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/quarterly-reports" element={<QuarterlyReports />} />
          <Route path="/fraud" element={<Fraud />} />
          <Route path="/prohibitions" element={<Prohibitions />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
