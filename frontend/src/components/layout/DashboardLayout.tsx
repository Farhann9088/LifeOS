import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const pageNames: Record<string, string> = {
  "/": "Overview",
  "/tasks": "My Tasks",
  "/goals": "Goals & Milestones",
  "/career": "Career Progress",
  "/nova": "NOVA Assistant",
};

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>LifeOS</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{pageNames[location.pathname] || "Overview"}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" title="Search" aria-label="Search"><Search size={19} /></button>
            <button className="icon-button" title="Notifications" aria-label="Notifications"><Bell size={19} /></button>
            <div className="topbar-avatar" title={user?.name || "Profile"}>{initials}</div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
