import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addEvidenceAction,
  blockCheckAction,
  changeOwnerAction,
  changePriorityAction,
  changeReviewerAction,
  failCheckAction,
  passCheckAction,
  reopenCheckAction,
  startCheckAction,
  submitReviewAction,
  waiveCheckAction,
} from "@/app/actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { listAudit } from "@/lib/audit";
import { Card, PriorityBadge, Shell, StatusBadge } from "@/components/shell";
import {
  canAddEvidence,
  canChangeOwner,
  canChangePriority,
  canChangeReviewer,
  canEditCheck,
  canFailCheck,
  canPassCheck,
  canReopenCheck,
  canWaiveCheck,
} from "@/lib/authz";
import { CheckStatus, Role } from "@prisma/client";
import { instructionLines } from "@/lib/format";
import { teamLabel, verificationLabel } from "@/lib/labels";

export default async function CheckPage({ params }: { params: Promise<{ checkId: string }> }) {
  const user = await requireUser();
  const { checkId } = await params;
  const check = await prisma.releaseCheck.findUnique({
    where: { id: checkId },
    include: {
      ownerTeam: true,
      ownerUser: true,
      reviewerUser: true,
      foundByUser: true,
      foundByTeam: true,
      evidence: { include: { createdBy: true }, orderBy: { createdAt: "asc" } },
      reviews: { include: { actor: true }, orderBy: { createdAt: "desc" } },
      release: { include: { project: true } },
    },
  });
  if (!check) notFound();
  const audit = await listAudit("ReleaseCheck", check.id);
  const assignableUsers = await prisma.user.findMany({
    where: { isActive: true, teamId: { not: null } },
    include: { team: true },
    orderBy: { name: "asc" },
  });
  const reviewerUsers = await prisma.user.findMany({
    where: { isActive: true, role: { in: [Role.SEO_LEAD, Role.PROJECT_MANAGER, Role.SYSTEM_ADMIN, Role.TEAM_MEMBER] } },
    orderBy: { name: "asc" },
  });
  const authz = {
    ownerUserId: check.ownerUserId,
    ownerTeamId: check.ownerTeamId,
    ownerTeamKey: check.ownerTeam.key,
    reviewerUserId: check.reviewerUserId,
    verificationType: check.verificationType,
  };
  const failReview = check.reviews.find((r) => r.decision === CheckStatus.FAIL);
  const canMutate = user.role !== Role.MANAGEMENT && canEditCheck(user, authz);
  const isReviewer = user.role !== Role.MANAGEMENT && (canPassCheck(user, authz) || canFailCheck(user, authz));
  const howToCheck = instructionLines(check.howToCheck);

  return (
    <Shell name={user.name} role={user.role}>
      <p className="text-sm">
        <Link className="text-ink/60 no-underline" href={`/releases/${check.releaseId}`}>
          {check.release.project.name} / {check.release.name}
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{check.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
        <span>{check.release.project.name}</span>
        <span>·</span>
        <span>{check.release.name}</span>
        <span>·</span>
        <span>{teamLabel[check.ownerTeam.key] ?? check.ownerTeam.name}</span>
        <PriorityBadge priority={check.priority} />
        <span>{verificationLabel[check.verificationType]}</span>
        <span>{check.controlCode}</span>
        <StatusBadge status={check.status} />
      </div>
      <p className="mt-2 text-sm text-ink/65">
        Tespit eden: {check.foundByTeam ? teamLabel[check.foundByTeam.key] ?? check.foundByTeam.name : check.foundByUser?.name ?? "—"}
        {" · "}
        Sorumlu ekip: {teamLabel[check.ownerTeam.key] ?? check.ownerTeam.name}
        {check.ownerUser ? ` (${check.ownerUser.name})` : ""}
      </p>

      {failReview && check.status === CheckStatus.FAIL ? (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Düzeltme istendi</p>
          <p className="mt-1 text-sm">{failReview.reason ?? "Gerekçe belirtilmedi."}</p>
          <p className="mt-1 text-xs text-ink/55">{failReview.actor.name}</p>
        </div>
      ) : null}

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <Info title="Bu neden önemli?" body={check.whyItMatters} />
        <Info title="Doğru sonuç nedir?" body={check.expectedResult} />
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <h3 className="text-sm font-medium">Nasıl kontrol edeceksin?</h3>
          {howToCheck.length > 1 ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
              {howToCheck.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-ink/80">{check.howToCheck}</p>
          )}
        </div>
        <Info title="Sorun varsa nasıl düzeltilir?" body={check.howToFix} />
        <Info title="Ne zaman SEO'ya / başka ekibe sorulmalı?" body={check.escalationRule} />
      </section>

      <h2 className="mt-8 font-medium">Kanıt</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {check.evidence.length === 0 ? <li className="text-ink/55">Henüz kanıt yok. “Yaptım” kanıt değildir.</li> : null}
        {check.evidence.map((e) => (
          <li key={e.id} className="rounded-lg bg-white p-3 ring-1 ring-ink/10">
            <span className="text-xs uppercase text-ink/45">{e.type}</span>
            <p className="mt-1">{e.body}</p>
            <p className="text-xs text-ink/45">{e.createdBy.name}</p>
          </li>
        ))}
      </ul>

      {canMutate ? (
        <div className="mt-4 space-y-3 rounded-lg border border-ink/10 bg-white p-4">
          {check.status === CheckStatus.FAIL ? (
            <form action={startCheckAction}>
              <input type="hidden" name="checkId" value={check.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Düzelt ve Tekrar Gönder
              </button>
            </form>
          ) : check.status === CheckStatus.NOT_STARTED ? (
            <form action={startCheckAction}>
              <input type="hidden" name="checkId" value={check.id} />
              <button className="rounded-md bg-ink px-3 py-2 text-sm text-white" type="submit">
                Çalışmaya Başla
              </button>
            </form>
          ) : null}
          {canAddEvidence(user, authz) ? (
            <form action={addEvidenceAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="checkId" value={check.id} />
              <select name="type" className="rounded border px-2 py-1 text-sm">
                <option>URL</option>
                <option>TEXT</option>
                <option>SCREENSHOT</option>
                <option>TEST_RESULT</option>
              </select>
              <input className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" name="body" placeholder="URL veya gözlem" required />
              <button className="rounded border px-3 py-1 text-sm" type="submit">
                Kanıt Ekle
              </button>
            </form>
          ) : null}
          {check.status === CheckStatus.IN_PROGRESS ? (
            <form action={submitReviewAction}>
              <input type="hidden" name="checkId" value={check.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Kontrole Gönder
              </button>
            </form>
          ) : null}
          <form action={blockCheckAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="checkId" value={check.id} />
            <select name="blockedBy" className="rounded border px-2 py-1 text-sm">
              <option>BACKEND</option>
              <option>FRONTEND</option>
              <option>NETWORK</option>
              <option>CONTENT</option>
              <option>SEO</option>
              <option>CLIENT</option>
              <option>EXTERNAL</option>
            </select>
            <input className="flex-1 rounded border px-2 py-1 text-sm" name="reason" placeholder="Neden bloklandı?" required />
            <button className="rounded border px-3 py-1 text-sm" type="submit">
              Bloklandı
            </button>
          </form>
        </div>
      ) : null}

      {isReviewer && check.status === CheckStatus.REVIEW ? (
        <div className="mt-4 space-y-3 rounded-lg border border-ink/10 bg-white p-4">
          <p className="text-sm font-medium">Onay</p>
          {canPassCheck(user, authz) ? (
            <form action={passCheckAction}>
              <input type="hidden" name="checkId" value={check.id} />
              <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
                Onayla
              </button>
            </form>
          ) : null}
          {canFailCheck(user, authz) ? (
            <form action={failCheckAction} className="flex gap-2">
              <input type="hidden" name="checkId" value={check.id} />
              <input className="flex-1 rounded border px-2 py-1 text-sm" name="reason" placeholder="Düzeltme gerekçesi" required />
              <button className="rounded-md bg-danger px-3 py-2 text-sm text-white" type="submit">
                Düzeltme İste
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {user.role !== Role.MANAGEMENT && (canReopenCheck(user) || canWaiveCheck(user) || canChangeOwner(user)) ? (
        <details className="mt-4 rounded-lg border border-ink/10 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium">Gelişmiş işlemler</summary>
          <div className="mt-3 space-y-3">
            {canReopenCheck(user) ? (
              <form action={reopenCheckAction} className="flex gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <input className="flex-1 rounded border px-2 py-1" name="reason" placeholder="Yeniden açma nedeni" required />
                <button className="rounded border px-3 py-1" type="submit">Yeniden Aç</button>
              </form>
            ) : null}
            {canChangeOwner(user) ? (
              <form action={changeOwnerAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <select name="ownerUserId" className="rounded border px-2 py-1">
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.team?.name})
                    </option>
                  ))}
                </select>
                <input className="rounded border px-2 py-1" name="reason" placeholder="Neden" required />
                <button className="rounded border px-2 py-1" type="submit">Sorumluyu Değiştir</button>
              </form>
            ) : null}
            {canChangeReviewer(user) ? (
              <form action={changeReviewerAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <select name="reviewerUserId" className="rounded border px-2 py-1">
                  {reviewerUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <input className="rounded border px-2 py-1" name="reason" placeholder="Neden" required />
                <button className="rounded border px-2 py-1" type="submit">Onaylayanı Değiştir</button>
              </form>
            ) : null}
            {canChangePriority(user) ? (
              <form action={changePriorityAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <select name="priority" className="rounded border px-2 py-1">
                  <option>P0</option>
                  <option>P1</option>
                  <option>P2</option>
                  <option>P3</option>
                </select>
                <input className="rounded border px-2 py-1" name="reason" placeholder="Neden" required />
                <button className="rounded border px-2 py-1" type="submit">Önceliği Değiştir</button>
              </form>
            ) : null}
            {canWaiveCheck(user) ? (
              <form action={waiveCheckAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <input className="rounded border px-2 py-1" name="reason" placeholder="Neden" required />
                <input className="rounded border px-2 py-1" name="risk" placeholder="Kabul edilen risk" required />
                <button className="rounded border px-2 py-1" type="submit">Risk Kabul Et</button>
              </form>
            ) : null}
          </div>
        </details>
      ) : null}

      {user.role === Role.MANAGEMENT ? <p className="mt-4 text-sm text-ink/55">Yönetim görünümü salt okunur.</p> : null}

      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-medium">Geçmiş</summary>
        <ol className="mt-2 space-y-1 text-xs text-ink/60">
          {audit.map((e) => (
            <li key={e.id}>
              {e.createdAt.toLocaleString("tr-TR")} · {e.actor?.name ?? "sistem"} · {e.action}
              {e.reason ? ` — ${e.reason}` : ""}
            </li>
          ))}
        </ol>
      </details>
    </Shell>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-sm text-ink/80">{body}</p>
    </Card>
  );
}
