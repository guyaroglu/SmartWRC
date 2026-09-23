"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { requireUser } from "@/lib/current-user";
import {
  addEvidence,
  blockCheck,
  changeOwner,
  changePriority,
  changeReviewer,
  createProject,
  createReleaseFromTemplate,
  emergencyDeploy,
  failCheck,
  completeBaseline,
  markDeployed,
  markProductionVerified,
  passCheck,
  reopenCheck,
  reopenRelease,
  startCheck,
  startPostLaunch,
  submitForReview,
  waiveCheck,
} from "@/lib/release-service";
import { ModuleKey, OnboardingType, Priority } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirectOnFailure } from "@/lib/action-error";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "");
  const project = await createProject(user, name);
  redirect(`/projects/${project.id}`);
}

export async function createReleaseAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");
  const templateVersionId = String(formData.get("templateVersionId") ?? "");
  const modules = formData
    .getAll("modules")
    .map(String)
    .filter(Boolean) as ModuleKey[];
  const targetDateRaw = String(formData.get("targetDate") ?? "");
  const release = await createReleaseFromTemplate({
    user,
    projectId,
    name,
    templateVersionId,
    modules: modules.length ? modules : [ModuleKey.FRONTEND, ModuleKey.NETWORK, ModuleKey.SEO],
    targetDate: targetDateRaw ? new Date(targetDateRaw) : undefined,
    onboardingType: (String(formData.get("onboardingType") ?? "NEW") as OnboardingType) || OnboardingType.NEW,
  });
  redirect(`/releases/${release.id}`);
}

async function runCheckAction(formData: FormData, fn: (checkId: string) => Promise<unknown>) {
  const checkId = String(formData.get("checkId") ?? "");
  try {
    await fn(checkId);
  } catch (err) {
    redirectOnFailure(`/checks/${checkId}`, err);
  }
}

async function runReleaseAction(formData: FormData, fn: (releaseId: string) => Promise<unknown>) {
  const releaseId = String(formData.get("releaseId") ?? "");
  try {
    await fn(releaseId);
  } catch (err) {
    redirectOnFailure(`/releases/${releaseId}`, err);
  }
}

export async function startCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => startCheck(user, checkId));
}

export async function addEvidenceAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    addEvidence(user, checkId, {
      type: String(formData.get("type") ?? "TEXT") as "TEXT" | "URL" | "SCREENSHOT" | "FILE" | "EXTERNAL_TICKET" | "TEST_RESULT",
      body: String(formData.get("body") ?? ""),
    }),
  );
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => submitForReview(user, checkId));
}

export async function failCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => failCheck(user, checkId, String(formData.get("reason") ?? "")));
}

export async function passCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => passCheck(user, checkId));
}

export async function blockCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    blockCheck(user, checkId, String(formData.get("blockedBy") ?? ""), String(formData.get("reason") ?? "")),
  );
}

export async function waiveCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    waiveCheck(user, checkId, String(formData.get("reason") ?? ""), String(formData.get("risk") ?? "")),
  );
}

export async function changeOwnerAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    changeOwner(user, checkId, String(formData.get("ownerUserId") ?? ""), String(formData.get("reason") ?? "")),
  );
}

export async function changeReviewerAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    changeReviewer(user, checkId, String(formData.get("reviewerUserId") ?? ""), String(formData.get("reason") ?? "")),
  );
}

export async function changePriorityAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) =>
    changePriority(user, checkId, String(formData.get("priority") ?? "P1") as Priority, String(formData.get("reason") ?? "")),
  );
}

export async function reopenCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => reopenCheck(user, checkId, String(formData.get("reason") ?? "")));
}

export async function completeBaselineAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) => completeBaseline(user, releaseId));
}

export async function reopenReleaseAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) => reopenRelease(user, releaseId, String(formData.get("reason") ?? "")));
}

export async function markDeployedAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) => markDeployed(user, releaseId, String(formData.get("note") ?? "")));
}

export async function startPostLaunchAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) => startPostLaunch(user, releaseId));
}

export async function markProductionVerifiedAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) => markProductionVerified(user, releaseId));
}

export async function emergencyDeployAction(formData: FormData) {
  const user = await requireUser();
  await runReleaseAction(formData, (releaseId) =>
    emergencyDeploy(user, releaseId, {
      reason: String(formData.get("reason") ?? ""),
      openRisks: String(formData.get("openRisks") ?? ""),
      approver2Id: String(formData.get("approver2Id") ?? ""),
    }),
  );
}
