import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import { DecisionEngine, DelegationMatrix, DelegationWorkspace, ExecutionTimeline, GoalAnalysis, TaskDecomposition } from "./pages/FlowPages";
import { MemoryCenter, Reflection, Scoring, SettingsPage, TrustDashboard } from "./pages/SystemPages";

export default function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/delegation" element={<DelegationWorkspace />} />
      <Route path="/goal-analysis" element={<GoalAnalysis />} />
      <Route path="/task-decomposition" element={<TaskDecomposition />} />
      <Route path="/matrix" element={<DelegationMatrix />} />
      <Route path="/decision" element={<DecisionEngine />} />
      <Route path="/timeline" element={<ExecutionTimeline />} />
      <Route path="/trust" element={<TrustDashboard />} />
      <Route path="/reflection" element={<Reflection />} />
      <Route path="/scoring" element={<Scoring />} />
      <Route path="/memory" element={<MemoryCenter />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/execution" element={<Navigate to="/timeline" replace />} />
      <Route path="/monitoring" element={<Navigate to="/timeline" replace />} />
      <Route path="/result" element={<Navigate to="/reflection" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}

