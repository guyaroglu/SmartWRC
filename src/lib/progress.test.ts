import { describe, expect, it } from "vitest";
import { CheckStatus } from "@prisma/client";
import { calculateProgress } from "@/lib/progress";

describe("calculateProgress", () => {
  it("returns 100% when every applicable check is PASS", () => {
    const result = calculateProgress([
      { status: CheckStatus.PASS },
      { status: CheckStatus.PASS },
    ]);
    expect(result).toEqual({ completed: 2, total: 2, percent: 100 });
  });

  it("counts mixed states as incomplete except PASS", () => {
    const result = calculateProgress([
      { status: CheckStatus.PASS },
      { status: CheckStatus.IN_PROGRESS },
      { status: CheckStatus.FAIL },
      { status: CheckStatus.REVIEW },
    ]);
    expect(result).toEqual({ completed: 1, total: 4, percent: 25 });
  });

  it("excludes N/A from the denominator", () => {
    const result = calculateProgress([
      { status: CheckStatus.PASS },
      { status: CheckStatus.NA },
      { status: CheckStatus.NOT_STARTED },
    ]);
    expect(result).toEqual({ completed: 1, total: 2, percent: 50 });
  });

  it("excludes REMOVED_FROM_SCOPE from the denominator", () => {
    const result = calculateProgress([
      { status: CheckStatus.PASS },
      { status: CheckStatus.REMOVED_FROM_SCOPE },
    ]);
    expect(result).toEqual({ completed: 1, total: 1, percent: 100 });
  });

  it("returns zero totals when no applicable checks exist", () => {
    expect(calculateProgress([])).toEqual({ completed: 0, total: 0, percent: 0 });
    expect(calculateProgress([{ status: CheckStatus.NA }, { status: CheckStatus.REMOVED_FROM_SCOPE }])).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
    });
  });
});
