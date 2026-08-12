import { base44, isDemoMode } from "../api/base44Client";

export async function createRemoteSession(session) {
  if (isDemoMode) return null;
  const record = await base44.entities.DelegationSession.create({
    goal: session.goal,
    status: session.status,
    task_summary: session.analysis.task_summary,
    expected_outcome: session.analysis.expected_outcome,
    overall_risk: session.analysis.overall_risk,
    ai_confidence: session.analysis.ai_confidence,
    recoverability: session.analysis.recoverability,
    difficulty_score: session.analysis.difficulty_score,
    delegation_mode: session.delegationMode,
    accepted: false,
    analysis: session.analysis,
  });

  await base44.entities.DelegationTask.bulkCreate(
    session.tasks.map((task) => ({
      ...task,
      session_id: record.id,
    })),
  );
  return record;
}

export async function updateRemoteSession(id, changes) {
  if (isDemoMode || !id) return null;
  return base44.entities.DelegationSession.update(id, changes);
}

export async function logExecutionEvent(sessionId, eventType, detail, metadata = {}) {
  if (isDemoMode || !sessionId) return null;
  return base44.entities.ExecutionEvent.create({
    session_id: sessionId,
    event_type: eventType,
    detail,
    metadata,
  });
}

