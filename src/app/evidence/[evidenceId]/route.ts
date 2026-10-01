import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loadEvidenceFile } from "@/lib/evidence-download";
import { evidenceFileHeaders } from "@/lib/evidence-file";

const MESSAGE = {
  401: "Oturum açman gerekiyor.",
  403: "Bu kanıtı görme yetkin yok.",
  404: "Kanıt dosyası bulunamadı.",
} as const;

// GET /evidence/:id → inline (image/PDF) or ?download=1 → attachment. Never public: middleware requires a
// session and loadEvidenceFile re-checks the user server-side.
export async function GET(req: Request, { params }: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await params;
  const session = await auth();
  const row = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, include: { team: true } }) : null;
  const user = row ? { id: row.id, role: row.role, teamId: row.teamId, teamKey: row.team?.key ?? null, isActive: row.isActive } : null;
  const result = await loadEvidenceFile(user, evidenceId);
  if (result.status !== 200) {
    return new Response(MESSAGE[result.status], { status: result.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const download = new URL(req.url).searchParams.get("download") === "1";
  return new Response(new Uint8Array(result.data), { headers: evidenceFileHeaders(result.meta, download) });
}
