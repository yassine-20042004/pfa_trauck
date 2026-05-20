import "leaflet/dist/leaflet.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./features/landing/LandingPage"
import { AuthProvider, useAuth } from "./features/auth/AuthContext"
import { Navigate } from "react-router-dom"
import { LoginPage } from "./features/auth/LoginPage"
import { RegisterPage } from "./features/auth/RegisterPage"
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

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['dispatcher', 'Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
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
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver', 'Driver']}>
            <DriverLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TripPage />} />
          <Route path="tasks" element={<div className="p-8 text-white">Delivery Tasks list</div>} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
