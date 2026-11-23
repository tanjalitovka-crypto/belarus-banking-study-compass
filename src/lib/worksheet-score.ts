import {
  functionsTable,
  isAccepted,
  noteBlanks,
  quiz,
  scheme,
  schemeFields,
  terms,
  timeline,
  trueFalse,
  type Actor,
} from "./worksheet";

export type TaskKey = "notes" | "scheme" | "terms" | "functions" | "quiz" | "trueFalse" | "timeline";

export type WorksheetState = {
  text: Record<string, string>;
  terms: Record<string, string>;
  functions: Record<string, Actor>;
  quiz: Record<string, number>;
  tf: Record<string, boolean>;
  timeline: Record<string, string>;
  checked: Partial<Record<TaskKey, boolean>>;
};

export const emptyState: WorksheetState = {
  text: {},
  terms: {},
  functions: {},
  quiz: {},
  tf: {},
  timeline: {},
  checked: {},
};

const count = (flags: boolean[]) => flags.filter(Boolean).length;

/** Second-level boxes may be filled in either order. */
export function schemeCorrect(s: WorksheetState): Record<string, boolean> {
  const v = (id: string) => s.text[id] ?? "";
  const leftOk = isAccepted(v(scheme.left.id), scheme.left.accepted);
  const rightOk = isAccepted(v(scheme.right.id), scheme.right.accepted);
  const swapped =
    isAccepted(v(scheme.left.id), scheme.right.accepted) &&
    isAccepted(v(scheme.right.id), scheme.left.accepted);
  return {
    [scheme.top.id]: isAccepted(v(scheme.top.id), scheme.top.accepted),
    [scheme.left.id]: leftOk || swapped,
    [scheme.right.id]: rightOk || swapped,
    [scheme.special.id]: isAccepted(v(scheme.special.id), scheme.special.accepted),
  };
}

export function scoreTask(task: TaskKey, s: WorksheetState): number {
  switch (task) {
    case "notes":
      return count(noteBlanks.map((b) => isAccepted(s.text[b.id] ?? "", b.accepted)));
    case "scheme":
      return count(schemeFields.map((f) => schemeCorrect(s)[f.id] ?? false));
    case "terms":
      return count(terms.map((t) => s.terms[t.id] === t.answer));
    case "functions":
      return count(functionsTable.map((f) => s.functions[f.id] === f.answer));
    case "quiz":
      return count(quiz.map((q) => s.quiz[q.id] === q.answer));
    case "trueFalse":
      return count(trueFalse.map((t) => s.tf[t.id] === t.answer));
    case "timeline":
      return count(timeline.map((t) => Number(s.timeline[t.id]) === t.order));
  }
}

export const allTasks: TaskKey[] = ["notes", "scheme", "terms", "functions", "quiz", "trueFalse", "timeline"];

export function totalScore(s: WorksheetState): number {
  return allTasks.reduce((sum, t) => sum + scoreTask(t, s), 0);
}
