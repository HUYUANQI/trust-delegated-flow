import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { demoMetrics, recentDelegations } from "../data/demoFixtures";
import { Badge, Panel, Progress } from "../components/ui";
import { useDelegationSession } from "../context/DelegationSessionContext";

export default function Dashboard() {
  const { session } = useDelegationSession();
  const hasRealSession = Boolean(session.goal);
  return <div className="page wide">
    <header className="dashboard-heading"><h1>Good morning, Alex Morgan</h1><p>AI Delegation Operating System for Product Teams</p></header>
    <Link to="/delegation" className="start-card">
      <span><small>Start a new delegation</small><strong>Describe your goal — AI will plan the work</strong><p>AI decides what to delegate and what to keep under human control</p></span><ArrowRight size={22} />
    </Link>

    {hasRealSession && <Panel className="current-session">
      <div><small>CURRENT SESSION</small><h2>{session.goal}</h2><p>Status: {session.status.replaceAll("_", " ")}</p></div>
      <div className="session-progress"><strong>{session.progress}%</strong><Progress value={session.progress} /></div>
    </Panel>}

    <div className="section-title"><h2>Delegation Metrics</h2><Badge tone="blue">Demo baseline</Badge></div>
    <div className="metric-grid">
      {demoMetrics.map((metric) => <Panel key={metric.label} className="metric-card"><small>{metric.label}</small><div><strong>{metric.value}</strong><em>{metric.change}</em></div><Progress value={parseFloat(metric.value) || 72} /></Panel>)}
    </div>

    <div className="section-title"><h2>Recent Delegations</h2></div>
    <Panel className="list-panel">
      {recentDelegations.map((item) => <div className="list-row" key={item.title}><span><strong>{item.title}</strong><small>{item.time}</small></span><Badge tone={item.status === "Stopped" ? "red" : "green"}>{item.status}</Badge></div>)}
    </Panel>
  </div>;
}

