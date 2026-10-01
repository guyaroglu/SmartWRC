import { prisma } from "@/lib/prisma";
import { canViewRelease, type AuthUser } from "@/lib/authz";

// Server-side gate for evidence bytes: same visibility as the check page (an active signed-in user).
// Only records that really carry an uploaded file are served; text/URL evidence has nothing to download.
export async function loadEvidenceFile(user: AuthUser | null, evidenceId: string) {
  if (!user) return { status: 401 as const };
  if (!canViewRelease(user)) return { status: 403 as const };
  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: { fileName: true, fileSize: true, mimeType: true, file: { select: { data: true } } },
  });
  if (!evidence?.file || !evidence.fileName || !evidence.mimeType) return { status: 404 as const };
  return {
    status: 200 as const,
    meta: { fileName: evidence.fileName, mimeType: evidence.mimeType, size: evidence.fileSize ?? evidence.file.data.length },
    data: evidence.file.data,
  };
}
