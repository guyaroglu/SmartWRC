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
import {
  Card,
  FeedbackAlert,
  Field,
  LockedBanner,
  OwnerChip,
  PrimaryButton,
  PriorityBadge,
  SecondaryButton,
  SelectInput,
  Shell,
  StatusBadge,
  TextInput,
} from "@/components/shell";
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
import { instructionLines, relativeTr } from "@/lib/format";
import { checkStatusLabel, teamLabel, verificationLabel } from "@/lib/labels";
import { isProductionLocked } from "@/lib/lifecycle";
import { IconBook, IconChevronRight, IconPaperclip, IconUpload } from "@/components/icons";

export default async function CheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ checkId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await requireUser();
  const { checkId } = await params;
  const { err } = await searchParams;
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
  const locked = isProductionLocked(check.release);
  const canMutate = !locked && user.role !== Role.MANAGEMENT && canEditCheck(user, authz);
  const isReviewer = !locked && user.role !== Role.MANAGEMENT && (canPassCheck(user, authz) || canFailCheck(user, authz));
  const howToCheck = instructionLines(check.howToCheck);
  const reviewerName =
    check.verificationType === "SEO_GATED"
      ? check.reviewerUser
        ? `SEO · ${check.reviewerUser.name}`
        : "SEO"
      : check.reviewerUser?.name ?? "Atanmış onaylayan";
  const evidenceNote =
    check.status === CheckStatus.FAIL
      ? check.evidence.length
        ? `${check.evidence.length} kayıt · düzeltme sonrası yenisi gerekli`
        : "Kanıt gerekli"
      : check.evidence.length
        ? `${check.evidence.length} kayıt`
        : check.evidenceRequired
          ? "Kanıt gerekli"
          : "Kanıt yok";

  const primaryAction =
    canMutate && check.status === CheckStatus.FAIL
      ? { action: startCheckAction, label: "Düzelt ve Tekrar Gönder" }
      : canMutate && check.status === CheckStatus.NOT_STARTED
        ? { action: startCheckAction, label: "Çalışmaya Başla" }
        : canMutate && check.status === CheckStatus.IN_PROGRESS
          ? { action: submitReviewAction, label: "Kontrole Gönder" }
          : isReviewer && check.status === CheckStatus.REVIEW && canPassCheck(user, authz)
            ? { action: passCheckAction, label: "Onayla" }
            : null;

  return (
    <Shell user={user}>
      <div className="flex items-center gap-1.5 text-[13px] text-sand-500">
        <span>{check.release.project.name}</span>
        <IconChevronRight size={14} />
        <Link href={`/releases/${check.releaseId}`} className="no-underline hover:text-clay-600">
          {check.release.name}
        </Link>
        <IconChevronRight size={14} />
        <span className="font-semibold text-sand-900">{teamLabel[check.ownerTeam.key] ?? check.ownerTeam.name} kontrolü</span>
      </div>

      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {locked ? <LockedBanner /> : null}

      <Card className="flex flex-col gap-3.5 px-6 py-[22px]">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-sand-900">{check.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <OwnerChip teamKey={check.ownerTeam.key} />
          <span className="inline-flex h-7 items-center rounded-md bg-sand-100 px-2.5 text-[13px] font-semibold text-sand-800">
            {check.ownerUser?.name ?? "Ekip sorumluluğu"}
          </span>
          <PriorityBadge priority={check.priority} />
          <span className="inline-flex h-[22px] items-center rounded bg-sand-100 px-2 text-xs font-semibold text-sand-700">
            {verificationLabel[check.verificationType]}
          </span>
          <span className="ml-auto">
            <StatusBadge status={check.status} />
          </span>
        </div>
        <p className="text-xs text-sand-500">
          {check.controlCode} · Tespit eden:{" "}
          {check.foundByTeam ? teamLabel[check.foundByTeam.key] ?? check.foundByTeam.name : check.foundByUser?.name ?? "—"}
        </p>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 px-[22px] py-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">Yapman gereken</div>
            {failReview && check.status === CheckStatus.FAIL ? (
              <FeedbackAlert
                title={`${check.verificationType === "SEO_GATED" ? "SEO geri bildirimi" : "Geri bildirim"} · ${failReview.actor.name} · ${relativeTr(failReview.createdAt)}`}
                body={`“${failReview.reason ?? "Gerekçe belirtilmedi."}”`}
              />
            ) : (
              <p className="text-sm text-sand-800">
                Bu kontrol {teamLabel[check.ownerTeam.key] ?? check.ownerTeam.name} ekibinin işidir. Durumu güncelle, gerekli kanıtı ekle ve geçerli sonraki adımı kullan.
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-sand-500">Durum</div>
                <div className={`mt-1 text-sm font-bold ${check.status === CheckStatus.FAIL ? "text-rust-700" : "text-sand-900"}`}>
                  {checkStatusLabel[check.status]}
                </div>
              </div>
              <div>
                <div className="text-xs text-sand-500">Kanıt</div>
                <div className="mt-1 text-sm font-bold text-sand-900">{evidenceNote}</div>
              </div>
              <div>
                <div className="text-xs text-sand-500">Onaylayacak</div>
                <div className="mt-1 text-sm font-bold text-sand-900">{reviewerName}</div>
              </div>
            </div>
            {primaryAction ? (
              <form action={primaryAction.action}>
                <input type="hidden" name="checkId" value={check.id} />
                <PrimaryButton>{primaryAction.label}</PrimaryButton>
              </form>
            ) : null}
            {isReviewer && check.status === CheckStatus.REVIEW && canFailCheck(user, authz) ? (
              <form action={failCheckAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <TextInput name="reason" placeholder="Düzeltme gerekçesi" required className="flex-1" />
                <SecondaryButton className="border-rust-500 text-rust-700">Düzeltme İste</SecondaryButton>
              </form>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-3 px-[22px] py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-sand-900">Kanıtlar</h2>
              <span className="text-xs text-sand-500">{evidenceNote}</span>
            </div>
            {check.evidence.length === 0 ? (
              <p className="text-sm text-sand-500">Henüz kanıt yok. “Yaptım” kanıt değildir.</p>
            ) : (
              check.evidence.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-[10px] bg-sand-50 px-3 py-2.5">
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-sand-200 bg-white text-sand-800">
                    <IconPaperclip size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-sand-900">{e.body}</div>
                    <div className="mt-0.5 text-xs text-sand-500">
                      {e.type} · {e.createdBy.name} · {relativeTr(e.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {canMutate && canAddEvidence(user, authz) ? (
              <form action={addEvidenceAction} className="space-y-2">
                <input type="hidden" name="checkId" value={check.id} />
                <div className="flex flex-wrap gap-2">
                  <SelectInput name="type">
                    <option>URL</option>
                    <option>TEXT</option>
                    <option>SCREENSHOT</option>
                    <option>TEST_RESULT</option>
                  </SelectInput>
                  <TextInput name="body" placeholder="URL veya gözlem" required className="min-w-64 flex-1" />
                  <SecondaryButton>Kanıt Ekle</SecondaryButton>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sand-300 py-4 text-[13px] text-sand-500">
                  <IconUpload size={16} />
                  Ekran görüntüsü, URL veya dosya ekle
                </div>
              </form>
            ) : null}
          </Card>

          {canMutate ? (
            <Card className="space-y-3 px-[22px] py-5">
              <h2 className="text-sm font-bold text-sand-900">Ek işlemler</h2>
              <form action={blockCheckAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <SelectInput name="blockedBy">
                  <option>BACKEND</option>
                  <option>FRONTEND</option>
                  <option>NETWORK</option>
                  <option>CONTENT</option>
                  <option>SEO</option>
                  <option>CLIENT</option>
                  <option>EXTERNAL</option>
                </SelectInput>
                <TextInput name="reason" placeholder="Neden bloklandı?" required className="flex-1" />
                <SecondaryButton>Bloklandı</SecondaryButton>
              </form>
            </Card>
          ) : null}

          {!locked && user.role !== Role.MANAGEMENT && (canReopenCheck(user) || canWaiveCheck(user) || canChangeOwner(user)) ? (
            <details className="rounded-card border border-sand-200 bg-white p-5 text-sm shadow-card">
              <summary className="cursor-pointer font-bold text-sand-900">Gelişmiş işlemler</summary>
              <div className="mt-3 space-y-3">
                {canReopenCheck(user) ? (
                  <form action={reopenCheckAction} className="flex gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <TextInput name="reason" placeholder="Yeniden açma nedeni" required className="flex-1" />
                    <SecondaryButton>Yeniden Aç</SecondaryButton>
                  </form>
                ) : null}
                {canChangeOwner(user) ? (
                  <form action={changeOwnerAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <SelectInput name="ownerUserId">
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.team?.name})
                        </option>
                      ))}
                    </SelectInput>
                    <TextInput name="reason" placeholder="Neden" required />
                    <SecondaryButton>Sorumluyu Değiştir</SecondaryButton>
                  </form>
                ) : null}
                {canChangeReviewer(user) ? (
                  <form action={changeReviewerAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <SelectInput name="reviewerUserId">
                      {reviewerUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </SelectInput>
                    <TextInput name="reason" placeholder="Neden" required />
                    <SecondaryButton>Onaylayanı Değiştir</SecondaryButton>
                  </form>
                ) : null}
                {canChangePriority(user) ? (
                  <form action={changePriorityAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <SelectInput name="priority">
                      <option>P0</option>
                      <option>P1</option>
                      <option>P2</option>
                      <option>P3</option>
                    </SelectInput>
                    <TextInput name="reason" placeholder="Neden" required />
                    <SecondaryButton>Önceliği Değiştir</SecondaryButton>
                  </form>
                ) : null}
                {canWaiveCheck(user) ? (
                  <form action={waiveCheckAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <TextInput name="reason" placeholder="Neden" required />
                    <TextInput name="risk" placeholder="Kabul edilen risk" required />
                    <SecondaryButton>Risk Kabul Et</SecondaryButton>
                  </form>
                ) : null}
              </div>
            </details>
          ) : null}

          <details className="rounded-card border border-sand-200 bg-white shadow-card">
            <summary className="flex cursor-pointer items-center gap-2.5 px-[22px] py-4">
              <h2 className="text-[15px] font-bold text-sand-900">Geçmiş</h2>
              <span className="text-xs text-sand-500">{audit.length} kayıt</span>
            </summary>
            <ol className="space-y-2.5 px-[22px] pb-4 pl-12 text-[13px]">
              {audit.map((e) => (
                <li key={e.id} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
                  <span className="text-sand-500">{relativeTr(e.createdAt)}</span>
                  <span className="text-sand-800">
                    <strong className="text-sand-900">{e.actor?.name ?? "sistem"}</strong> {e.action}
                    {e.reason ? ` — ${e.reason}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </div>

        <div className="flex flex-col gap-3.5 rounded-card border border-sand-200 bg-sand-50 px-5 py-[18px]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">
            <IconBook size={14} />
            Standart prosedür
          </div>
          {[
            ["Bu neden önemli?", check.whyItMatters],
            ["Doğru sonuç nedir?", check.expectedResult],
            ["Nasıl kontrol edeceksin?", howToCheck.length > 1 ? howToCheck.map((l, i) => `${i + 1}. ${l}`).join("\n") : check.howToCheck],
            ["Sorun varsa nasıl düzeltilir?", check.howToFix],
            ["Ne zaman eskale edilir?", check.escalationRule],
          ].map(([q, a]) => (
            <div key={q} className="flex flex-col gap-1">
              <div className="text-[13px] font-bold text-sand-900">{q}</div>
              <div className="whitespace-pre-line text-[13px] leading-5 text-sand-800">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {user.role === Role.MANAGEMENT ? <p className="text-sm text-sand-500">Yönetim görünümü salt okunur.</p> : null}
    </Shell>
  );
}
