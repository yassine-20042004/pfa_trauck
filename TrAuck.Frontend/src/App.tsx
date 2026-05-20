import "leaflet/dist/leaflet.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./features/landing/LandingPage"
import { LoginPage } from "./features/auth/LoginPage"
import { RegisterPage } from "./features/auth/RegisterPage"
import { ProtectedRoute } from "./features/auth/ProtectedRoute"
import { AdminLayout } from "./features/admin/AdminLayout"
import { DashboardPage } from "./features/admin/DashboardPage"
import { FleetPage } from "./features/admin/FleetPage"
import { DriversPage } from "./features/admin/DriversPage"
import { VehiclesPage } from "./features/admin/VehiclesPage"
import { TripsPage } from "./features/admin/TripsPage"
import { IncidentsPage } from "./features/admin/IncidentsPage"
import { LoadsPage } from "./features/admin/LoadsPage"
import { AccessRequestsPage } from "./features/admin/AccessRequestsPage"
import { DriverLayout } from "./features/driver/DriverLayout"
import { TripPage } from "./features/driver/TripPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="fleet" element={<FleetPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="loads" element={<LoadsPage />} />
            <Route path="requests" element={<AccessRequestsPage />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<TripPage />} />
            <Route path="tasks" element={<div className="p-8 text-white">Delivery Tasks list</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
