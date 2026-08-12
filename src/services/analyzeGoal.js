import { base44, isDemoMode } from "../api/base44Client";
import { buildDemoAnalysis } from "../data/demoFixtures";

const responseJsonSchema = {
  type: "object",
  properties: {
    task_summary: { type: "string" },
    expected_outcome: { type: "string" },
    constraints: { type: "array", items: { type: "string" } },
    overall_risk: { type: "string", enum: ["low", "medium", "high"] },
    ai_confidence: { type: "number" },
    recoverability: { type: "string", enum: ["low", "medium", "high"] },
    difficulty_score: { type: "number" },
    delegation_strategy: { type: "string" },
    scores: {
      type: "object",
      properties: {
        complexity: { type: "number" }, clarity: { type: "number" }, risk: { type: "number" },
        recoverability: { type: "number" }, domain: { type: "number" }, impact: { type: "number" },
        data: { type: "number" }, judgment: { type: "number" }
      }
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          order: { type: "number" }, title: { type: "string" }, description: { type: "string" },
          risk: { type: "string", enum: ["low", "medium", "high"] },
          recoverability: { type: "string", enum: ["low", "medium", "high"] },
          executor: { type: "string", enum: ["ai", "shared", "human"] },
          permission: { type: "string", enum: ["not_required", "ask_first", "required"] },
          recommended_executor: { type: "string", enum: ["ai", "shared", "human"] },
          human_judgment: { type: "string", enum: ["low", "medium", "high"] },
          reasoning: { type: "string" },
          confidence: { type: "number" },
          external_impact: { type: "boolean" },
          decision_boundary: { type: "boolean" },
          action_description: { type: "string" },
          approval_reason: { type: "string" },
          depends_on: { type: "array", items: { type: "number" } }
        }
      }
    }
  }
};

export async function analyzeGoal(goal) {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return buildDemoAnalysis(goal);
  }

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an explainable AI delegation planner. Analyze this goal: "${goal}".
Return a transparent risk assessment and 3-7 ordered subtasks. Assign each subtask to ai, shared, or human. Include a short recommendation reason, human-judgment level, confidence, and whether it crosses a decision boundary. Prioritize recoverability and require human approval for irreversible, external, or high-impact actions.`,
      response_json_schema: responseJsonSchema,
    });
    return { ...result, tasks: result.tasks.map((task, index) => ({
      ...task,
      order: task.order || index + 1,
      recommended_executor: task.recommended_executor || task.executor,
      human_judgment: task.human_judgment || (task.risk === "high" ? "high" : "medium"),
      reasoning: task.reasoning || "The recommendation balances risk, recoverability, permission, and the need for human judgment.",
      confidence: task.confidence || result.ai_confidence || .75,
      decision_boundary: Boolean(task.decision_boundary || task.risk === "high" || task.permission === "required"),
      status: "pending",
    })) };
  } catch (error) {
    console.warn("Base44 analysis failed; using demo fallback.", error);
    return buildDemoAnalysis(goal);
  }
}
