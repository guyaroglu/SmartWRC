"use server";

import { revalidatePath } from "next/cache";
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
  createAdHocCheck,
  markDeployed,
  markNotApplicable,
  markProductionVerified,
  passCheck,
  reopenCheck,
  reopenRelease,
  startCheck,
  startPostLaunch,
  submitForReview,
  waiveCheck,
} from "@/lib/release-service";
import { DomainKey, EvidenceType, ModuleKey, OnboardingType, Priority, TeamKey, VerificationType } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirectOnFailure } from "@/lib/action-error";
import { dismissAllAttention, dismissAttention } from "@/lib/attention-load";

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

// A check or release transition changes the check page, its release gate, dashboard,
// review queue / sidebar badge, attention bell and management view, so refresh the
// whole layout rather than guessing individual paths.
function refreshAfterMutation() {
  revalidatePath("/", "layout");
}

async function runCheckAction(formData: FormData, fn: (checkId: string) => Promise<unknown>) {
  const checkId = String(formData.get("checkId") ?? "");
  try {
    await fn(checkId);
  } catch (err) {
    redirectOnFailure(`/checks/${checkId}`, err);
  }
  refreshAfterMutation();
  // Land on the clean page so an earlier ?err= banner does not survive a successful action.
  redirect(`/checks/${checkId}`);
}

async function runReleaseAction(formData: FormData, fn: (releaseId: string) => Promise<unknown>) {
  const releaseId = String(formData.get("releaseId") ?? "");
  try {
    await fn(releaseId);
  } catch (err) {
    redirectOnFailure(`/releases/${releaseId}`, err);
  }
  refreshAfterMutation();
  redirect(`/releases/${releaseId}`);
}

export async function startCheckAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => startCheck(user, checkId));
}

export async function addEvidenceAction(formData: FormData) {
  const user = await requireUser();
  const upload = formData.get("file");
  await runCheckAction(formData, async (checkId) =>
    addEvidence(user, checkId, {
      type: String(formData.get("type") ?? "TEXT") as "TEXT" | "URL" | "SCREENSHOT" | "FILE" | "EXTERNAL_TICKET" | "TEST_RESULT",
      body: String(formData.get("body") ?? ""),
      file:
        upload instanceof File && upload.size > 0
          ? { name: upload.name, type: upload.type, bytes: Buffer.from(await upload.arrayBuffer()) }
          : null,
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

export async function markNotApplicableAction(formData: FormData) {
  const user = await requireUser();
  await runCheckAction(formData, (checkId) => markNotApplicable(user, checkId, String(formData.get("reason") ?? "")));
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

// “+ Yeni Sorun”: permissions, lock and Found By are enforced in createAdHocCheck.
export async function createAdHocIssueAction(formData: FormData) {
  const user = await requireUser();
  const releaseId = String(formData.get("releaseId") ?? "");
  const pick = <T extends string>(value: FormDataEntryValue | null, allowed: readonly T[], fallback: T): T =>
    allowed.includes(String(value) as T) ? (String(value) as T) : fallback;
  const evidenceBody = String(formData.get("evidenceBody") ?? "").trim();
  let checkId: string;
  try {
    const check = await createAdHocCheck(user, {
      releaseId,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      domains: [pick(formData.get("domain"), Object.values(DomainKey), DomainKey.SEO)],
      ownerTeamKey: pick(formData.get("ownerTeamKey"), Object.values(TeamKey), TeamKey.FRONTEND),
      priority: pick(formData.get("priority"), Object.values(Priority), Priority.P1),
      verificationType: pick(formData.get("verificationType"), Object.values(VerificationType), VerificationType.SEO_GATED),
      reviewerUserId: String(formData.get("reviewerUserId") ?? "") || null,
      evidence: evidenceBody
        ? { type: pick(formData.get("evidenceType"), Object.values(EvidenceType), EvidenceType.TEXT), body: evidenceBody }
        : null,
    });
    checkId = check.id;
  } catch (err) {
    redirectOnFailure(`/releases/${releaseId}`, err);
  }
  refreshAfterMutation();
  redirect(`/checks/${checkId}`);
}

// Dikkat Gerektirenler: clear one item / all items for the current user only.
export async function dismissAttentionAction(key: string) {
  const user = await requireUser();
  await dismissAttention(user, [String(key)]);
  refreshAfterMutation();
}

export async function dismissAllAttentionAction() {
  const user = await requireUser();
  await dismissAllAttention(user);
  refreshAfterMutation();
}
