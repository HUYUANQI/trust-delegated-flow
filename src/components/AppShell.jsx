import { Activity, Brain, Eye, Gauge, Grid2X2, LayoutDashboard, MemoryStick, Settings, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import DelegateCompanion from "./DelegateCompanion";
import StudyObserverPanel from "./StudyObserverPanel";

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
  const { enabled, toggle } = useStudy();
  const [observerOpen, setObserverOpen] = useState(false);
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
        <div className="study-controls">
          <div><button className="study-label" onClick={toggle}><Eye size={15} /> Study Mode</button><button className={enabled ? "toggle on" : "toggle"} onClick={toggle} aria-label="Toggle Study Mode"><span /></button></div>
          {enabled && <button className="observer-button" onClick={() => setObserverOpen(true)}>Observer Summary</button>}
        </div>
        <div className="profile">
          <span className="avatar">AM</span>
          <span><strong>Alex Morgan</strong><small>Product Designer</small></span>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
      <DelegateCompanion />
      <StudyObserverPanel open={observerOpen} onClose={() => setObserverOpen(false)} />
    </div>
  );
}
