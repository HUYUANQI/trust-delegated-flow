import { Activity, Brain, Gauge, Grid2X2, LayoutDashboard, MemoryStick, Settings, ShieldCheck, Zap } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Delegation Matrix", to: "/matrix", icon: Grid2X2 },
  { label: "Decision Engine", to: "/decision", icon: Brain },
  { label: "Execution", to: "/timeline", icon: Activity },
  { label: "Trust", to: "/trust", icon: ShieldCheck },
  { label: "Scoring", to: "/scoring", icon: Gauge },
  { label: "Memory", to: "/memory", icon: MemoryStick },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Zap size={18} /></span><strong>Delegate</strong></div>
        <nav>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Icon size={17} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="profile">
          <span className="avatar">AM</span>
          <span><strong>Alex Morgan</strong><small>Product Designer</small></span>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

