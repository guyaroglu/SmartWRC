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

export async function startCheckAction(formData: FormData) {
  const user = await requireUser();
  const checkId = String(formData.get("checkId") ?? "");
  await startCheck(user, checkId);
}

export async function addEvidenceAction(formData: FormData) {
  const user = await requireUser();
  const checkId = String(formData.get("checkId") ?? "");
  await addEvidence(user, checkId, {
    type: String(formData.get("type") ?? "TEXT") as "TEXT" | "URL" | "SCREENSHOT" | "FILE" | "EXTERNAL_TICKET" | "TEST_RESULT",
    body: String(formData.get("body") ?? ""),
  });
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser();
  await submitForReview(user, String(formData.get("checkId") ?? ""));
}

export async function failCheckAction(formData: FormData) {
  const user = await requireUser();
  await failCheck(user, String(formData.get("checkId") ?? ""), String(formData.get("reason") ?? ""));
}

export async function passCheckAction(formData: FormData) {
  const user = await requireUser();
  await passCheck(user, String(formData.get("checkId") ?? ""));
}

export async function blockCheckAction(formData: FormData) {
  const user = await requireUser();
  await blockCheck(
    user,
    String(formData.get("checkId") ?? ""),
    String(formData.get("blockedBy") ?? ""),
    String(formData.get("reason") ?? ""),
  );
}

export async function waiveCheckAction(formData: FormData) {
  const user = await requireUser();
  await waiveCheck(
    user,
    String(formData.get("checkId") ?? ""),
    String(formData.get("reason") ?? ""),
    String(formData.get("risk") ?? ""),
  );
}

export async function changeOwnerAction(formData: FormData) {
  const user = await requireUser();
  await changeOwner(
    user,
    String(formData.get("checkId") ?? ""),
    String(formData.get("ownerUserId") ?? ""),
    String(formData.get("reason") ?? ""),
  );
}

export async function changeReviewerAction(formData: FormData) {
  const user = await requireUser();
  await changeReviewer(
    user,
    String(formData.get("checkId") ?? ""),
    String(formData.get("reviewerUserId") ?? ""),
    String(formData.get("reason") ?? ""),
  );
}

export async function changePriorityAction(formData: FormData) {
  const user = await requireUser();
  await changePriority(
    user,
    String(formData.get("checkId") ?? ""),
    String(formData.get("priority") ?? "P1") as Priority,
    String(formData.get("reason") ?? ""),
  );
}

export async function reopenCheckAction(formData: FormData) {
  const user = await requireUser();
  await reopenCheck(user, String(formData.get("checkId") ?? ""), String(formData.get("reason") ?? ""));
}

export async function completeBaselineAction(formData: FormData) {
  const user = await requireUser();
  await completeBaseline(user, String(formData.get("releaseId") ?? ""));
}

export async function reopenReleaseAction(formData: FormData) {
  const user = await requireUser();
  await reopenRelease(user, String(formData.get("releaseId") ?? ""), String(formData.get("reason") ?? ""));
}

export async function markDeployedAction(formData: FormData) {
  const user = await requireUser();
  await markDeployed(user, String(formData.get("releaseId") ?? ""), String(formData.get("note") ?? ""));
}

export async function startPostLaunchAction(formData: FormData) {
  const user = await requireUser();
  await startPostLaunch(user, String(formData.get("releaseId") ?? ""));
}

export async function markProductionVerifiedAction(formData: FormData) {
  const user = await requireUser();
  await markProductionVerified(user, String(formData.get("releaseId") ?? ""));
}

export async function emergencyDeployAction(formData: FormData) {
  const user = await requireUser();
  await emergencyDeploy(user, String(formData.get("releaseId") ?? ""), {
    reason: String(formData.get("reason") ?? ""),
    openRisks: String(formData.get("openRisks") ?? ""),
    approver2Id: String(formData.get("approver2Id") ?? ""),
  });
}
