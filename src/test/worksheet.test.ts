import { describe, expect, it } from "vitest";

import { gradeFromPercent, isAccepted } from "@/lib/worksheet";
import { emptyState, scoreTask } from "@/lib/worksheet-score";

describe("worksheet grading", () => {
  it("maps percent to the 10-point scale", () => {
    expect(gradeFromPercent(100)).toBe(10);
    expect(gradeFromPercent(95)).toBe(10);
    expect(gradeFromPercent(94)).toBe(9);
    expect(gradeFromPercent(55)).toBe(6);
    expect(gradeFromPercent(0)).toBe(0);
  });

  it("accepts answers regardless of case, ё and quotes", () => {
    expect(isAccepted("  НАЦИОНАЛЬНЫЙ банк ", ["Национальный банк"])).toBe(true);
    expect(isAccepted("«Развития»", ["развития"])).toBe(true);
    expect(isAccepted("финансово – кредитной", ["финансово-кредитной"])).toBe(true);
    expect(isAccepted("Министерство", ["Президенту"])).toBe(false);
  });

  it("scores second-level scheme boxes in either order", () => {
    const s = { ...emptyState, text: { s1: "Национальный банк", s2: "НКФО", s3: "банки", s4: "развития" } };
    expect(scoreTask("scheme", s)).toBe(4);
  });
});
