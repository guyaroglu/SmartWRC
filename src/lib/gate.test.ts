import { describe, expect, it } from "vitest";
import { CheckStatus, DeploymentStatus, GateStatus, ModuleKey, OnboardingType, Priority, VerificationType } from "@prisma/client";
import { assertReadyNotUserSet, calculateGate, openRiskCounts, type GateCheckInput } from "@/lib/gate";

const release = {
  onboardingType: OnboardingType.NEW,
  baselineCompleted: true,
  deploymentStatus: DeploymentStatus.NOT_DEPLOYED,
};

function check(partial: Partial<GateCheckInput> & Pick<GateCheckInput, "status" | "priority">): GateCheckInput {
  return {
    releaseBlocker: partial.priority === Priority.P0,
    evidenceRequired: true,
    verificationType: VerificationType.SEO_GATED,
    evidenceCount: 1,
    module: ModuleKey.FRONTEND,
    ...partial,
  };
}

describe("gate engine", () => {
  it("unresolved P0 blocker => NO_GO", () => {
    const gate = calculateGate(release, [
      check({ status: CheckStatus.IN_PROGRESS, priority: Priority.P0 }),
      check({ status: CheckStatus.PASS, priority: Priority.P1 }),
    ]);
    expect(gate).toBe(GateStatus.NO_GO);
  });

  it("missing required P0 evidence => NO_GO", () => {
    const gate = calculateGate(release, [
      check({ status: CheckStatus.REVIEW, priority: Priority.P0, evidenceCount: 0, evidenceRequired: true }),
    ]);
    expect(gate).toBe(GateStatus.NO_GO);
  });

  it("no P0 but unresolved P1 => AT_RISK", () => {
    const gate = calculateGate(release, [
      check({ status: CheckStatus.PASS, priority: Priority.P0 }),
      check({ status: CheckStatus.IN_PROGRESS, priority: Priority.P1, releaseBlocker: false }),
    ]);
    expect(gate).toBe(GateStatus.AT_RISK);
  });

  it("READY cannot coexist with open blocking P0", () => {
    const checks = [
      check({ status: CheckStatus.PASS, priority: Priority.P0 }),
      check({ status: CheckStatus.PASS, priority: Priority.P1, releaseBlocker: false }),
    ];
    const gate = calculateGate(release, checks);
    expect(gate).toBe(GateStatus.READY);
    expect(openRiskCounts(release, checks).p0).toBe(0);
  });

  it("open P0 never yields READY", () => {
    const checks = [check({ status: CheckStatus.IN_PROGRESS, priority: Priority.P0 })];
    const gate = calculateGate(release, checks);
    expect(gate).not.toBe(GateStatus.READY);
    expect(openRiskCounts(release, checks).p0).toBeGreaterThan(0);
  });

  it("READY cannot be selected by a user", () => {
    expect(() => assertReadyNotUserSet(GateStatus.READY, GateStatus.NO_GO, "user")).toThrow(/READY/);
  });

  it("post-launch P0 does not block pre-deploy READY", () => {
    const gate = calculateGate(release, [
      check({ status: CheckStatus.PASS, priority: Priority.P0, module: ModuleKey.FRONTEND }),
      check({ status: CheckStatus.NOT_STARTED, priority: Priority.P0, module: ModuleKey.POST_LAUNCH }),
    ]);
    expect(gate).toBe(GateStatus.READY);
  });

  it("imported incomplete baseline is NOT_ASSESSED", () => {
    const gate = calculateGate(
      { onboardingType: OnboardingType.IN_PROGRESS, baselineCompleted: false, deploymentStatus: DeploymentStatus.NOT_DEPLOYED },
      [check({ status: CheckStatus.NOT_STARTED, priority: Priority.P0 })],
    );
    expect(gate).toBe(GateStatus.NOT_ASSESSED);
  });

  it("LIVE_UNVERIFIED without baseline is NOT_ASSESSED and not READY", () => {
    const input = {
      onboardingType: OnboardingType.LIVE_UNVERIFIED,
      baselineCompleted: false,
      deploymentStatus: DeploymentStatus.NOT_DEPLOYED,
    };
    const checks = [check({ status: CheckStatus.NOT_STARTED, priority: Priority.P0 })];
    expect(calculateGate(input, checks)).toBe(GateStatus.NOT_ASSESSED);
    expect(calculateGate(input, checks)).not.toBe(GateStatus.READY);
  });
});
