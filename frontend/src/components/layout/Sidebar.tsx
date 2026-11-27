import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BriefcaseBusiness,
  Sparkles,
  Settings,
  LogOut,
  Star,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "My Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Goals & Milestones", path: "/goals", icon: Target },
  { name: "Career Progress", path: "/career", icon: BriefcaseBusiness },
  { name: "NOVA Assistant", path: "/nova", icon: Sparkles },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="brand-mark"><Star size={21} strokeWidth={2.3} /></div>
        <span className="sidebar-brand-name">LifeOS</span>
      </div>

      <nav className="sidebar-nav">
        {navigation.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            title={name}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon className="nav-icon" size={21} strokeWidth={1.9} />
            <span className="nav-label">{name}</span>
            {name === "NOVA Assistant" && <span className="nova-dot" />}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-utility">
          <button className="nav-item settings-item" type="button" title="Settings">
            <Settings className="nav-icon" size={21} strokeWidth={1.9} />
            <span className="nav-label">Settings</span>
          </button>
        </div>

        <div className="profile-card">
          <div className="avatar" title={user?.name || "User"}>{initials}</div>
          <div className="profile-info">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || ""}</span>
          </div>
          <button className="logout-button" onClick={logout} title="Log out" aria-label="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
