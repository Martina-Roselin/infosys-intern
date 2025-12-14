import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import RegisterUser from './pages/RegisterUser';
import RegisterProvider from './pages/RegisterProvider';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home'; // ✅ new import
import MapSearch from './components/MapSearch';
// ... imports
import ProviderDetails from './pages/ProviderDetails'; // <-- Import the new page



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Show homepage instead of redirecting to login */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register/user" element={<RegisterUser />} />
          <Route path="/register/provider" element={<RegisterProvider />} />
          <Route path="/map-search" element={<MapSearch />} />
          <Route path="/user/provider/:id" element={<ProviderDetails />} />

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="ROLE_USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRole="ROLE_PROVIDER">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
