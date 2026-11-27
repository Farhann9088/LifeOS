
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Career from "./pages/Career";
import Nova from "./pages/Nova";

import "./App.css";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Loading LifeOS...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Loading LifeOS...</div>;
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/career" element={<Career />} />
              <Route path="/nova" element={<Nova />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
