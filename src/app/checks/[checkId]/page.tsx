import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addEvidenceAction,
  blockCheckAction,
  changeOwnerAction,
  changePriorityAction,
  markNotApplicableAction,
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
  Avatar,
  Badge,
  Card,
  DangerButton,
  Eyebrow,
  FeedbackAlert,
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
  canMarkNa,
} from "@/lib/authz";
import { CheckStatus, Role } from "@prisma/client";
import { instructionLines, relativeTr } from "@/lib/format";
import { blockedByLabel, checkStatusLabel, priorityLabel, domainLabel, evidenceTypeLabel, teamLabel, verificationLabel } from "@/lib/labels";
import { auditSentence } from "@/lib/tr-messages";
import { isProductionLocked } from "@/lib/lifecycle";
import { evidenceLink } from "@/lib/evidence-view";
import { EVIDENCE_FILE_ACCEPT, evidenceFileKind, formatFileSize } from "@/lib/evidence-file";
import {
  IconBook,
  IconCheck,
  IconChevronRight,
  IconFile,
  IconImage,
  IconLink,
  IconPaperclip,
  IconPlay,
  IconRotate,
  IconSend,
  IconUpload,
} from "@/components/icons";

function EvidenceIcon({ type }: { type: string }) {
  if (type === "SCREENSHOT") return <IconImage size={16} />;
  if (type === "URL") return <IconLink size={16} />;
  if (type === "TEXT") return <IconFile size={16} />;
  return <IconPaperclip size={16} />;
}

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
    // §117: Frontend/Backend/Network/Content work is reviewed by SEO only.
    where: {
      isActive: true,
      role: { in: check.ownerTeam.key === "SEO" ? [Role.SEO_LEAD, Role.PROJECT_MANAGER, Role.SYSTEM_ADMIN, Role.TEAM_MEMBER] : [Role.SEO_LEAD] },
    },
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
  // Frontend/Backend/Network/Content work is technically approved only by SEO.
  const seoApproves = check.ownerTeam.key !== "SEO" || check.verificationType === "SEO_GATED";
  const reviewerName =
    seoApproves
      ? check.reviewerUser?.role === Role.SEO_LEAD
        ? `SEO · ${check.reviewerUser.name}`
        : "SEO"
      : check.reviewerUser?.name ?? "Atanmış doğrulayan";
  const ownerTeamName = teamLabel[check.ownerTeam.key] ?? check.ownerTeam.name;
  const foundBy = check.foundByTeam || check.foundByUser
    ? [check.foundByTeam ? teamLabel[check.foundByTeam.key] ?? check.foundByTeam.name : null, check.foundByUser?.name]
        .filter(Boolean)
        .join(" · ")
    : null;
  const affected = check.domains.map((d) => domainLabel[d] ?? d).join(", ") || "—";
  // What happens next, in plain words, for the person looking at the check.
  const nextStepHint =
    check.status === CheckStatus.NOT_STARTED
      ? "Başladığında görev “Çalışılıyor” olur. Sonra kanıt ekleyip onaya gönderirsin."
      : check.status === CheckStatus.IN_PROGRESS
        ? `Onaya gönderdiğinde ${reviewerName} kontrol eder. Onaylarsa görev tamamlanır; düzeltme isterse geri bildirim burada görünür.`
        : check.status === CheckStatus.FAIL
          ? "Düzeltmeye başla, yeni kanıt ekle ve tekrar onaya gönder."
          : check.status === CheckStatus.REVIEW
            ? `${reviewerName} kontrol ediyor. Sonuç burada görünecek.`
            : null;
  const evidenceNote =
    check.status === CheckStatus.FAIL
      ? check.evidence.length
        ? `${check.evidence.length} eski · yenisi gerekli`
        : "Kanıt gerekli"
      : check.evidence.length
        ? `${check.evidence.length} kayıt`
        : check.evidenceRequired
          ? "Kanıt gerekli"
          : "Kanıt yok";

  const primaryAction =
    canMutate && check.status === CheckStatus.FAIL
      ? { action: startCheckAction, label: "Düzeltmeye Başla", icon: <IconRotate size={17} /> }
      : canMutate && check.status === CheckStatus.NOT_STARTED
        ? { action: startCheckAction, label: "Çalışmaya Başla", icon: <IconPlay size={17} /> }
        : canMutate && check.status === CheckStatus.IN_PROGRESS
          ? { action: submitReviewAction, label: "Onaya Gönder", icon: <IconSend size={17} /> }
          : isReviewer && check.status === CheckStatus.REVIEW && canPassCheck(user, authz)
            ? { action: passCheckAction, label: "Onayla", icon: <IconCheck size={17} /> }
            : null;

  return (
    <Shell user={user}>
      <div className="flex min-h-[34px] flex-wrap items-center gap-1.5 text-[13px] text-sand-500">
        <span>{check.release.project.name}</span>
        <IconChevronRight size={14} />
        <Link href={`/releases/${check.releaseId}`} className="text-sand-500 hover:text-clay-600">
          {check.release.name}
        </Link>
        <IconChevronRight size={14} />
        <span className="font-semibold text-sand-900">{ownerTeamName} görevi</span>
      </div>

      {err ? <FeedbackAlert title="İşlem yapılamadı" body={err} /> : null}
      {locked ? <LockedBanner /> : null}

      <Card className="flex flex-col gap-3.5 px-6 py-[22px]">
        <h1 className="text-2xl font-bold tracking-tight text-sand-900" style={{ lineHeight: 1.25, textWrap: "pretty" }}>
          {check.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <OwnerChip teamKey={check.ownerTeam.key} />
          <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-chip bg-sand-100 px-2.5 text-[13px] font-semibold text-sand-800">
            {check.ownerUser ? <Avatar name={check.ownerUser.name} size={18} /> : null}
            {check.ownerUser?.name ?? "Ekip sorumluluğunda"}
          </span>
          <PriorityBadge priority={check.priority} />
          <Badge>{verificationLabel[check.verificationType]}</Badge>
          {check.source === "AD_HOC" ? <Badge tone="brand">Sonradan tespit edildi</Badge> : null}
          <span className="flex-1" />
          <StatusBadge status={check.status} />
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-2 border-t border-sand-200 pt-3.5 text-[13px] sm:grid-cols-4">
          <div>
            <dt className="text-xs text-sand-500">Sorumlu ekip</dt>
            <dd className="mt-0.5 font-bold text-sand-900">{ownerTeamName}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-500">Tespit eden</dt>
            <dd className="mt-0.5 font-bold text-sand-900">{foundBy ?? "Kontrol şablonu"}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-500">Etkilenen alan</dt>
            <dd className="mt-0.5 font-bold text-sand-900">{affected}</dd>
          </div>
          <div>
            <dt className="text-xs text-sand-500">Doğrulayan</dt>
            <dd className="mt-0.5 font-bold text-sand-900">{reviewerName}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-4">
          {!locked ? (
          <Card className="flex flex-col gap-4 px-[22px] py-5">
            <Eyebrow>{canMutate ? "Yapman gereken" : "Görev durumu"}</Eyebrow>
            {failReview && check.status === CheckStatus.FAIL ? (
              <FeedbackAlert
                title={`${check.verificationType === "SEO_GATED" ? "SEO geri bildirimi" : "Geri bildirim"} · ${failReview.actor.name} · ${relativeTr(failReview.createdAt)}`}
                body={`“${failReview.reason ?? "Gerekçe belirtilmedi."}”`}
              />
            ) : (
              <p className="text-sm text-sand-800" style={{ lineHeight: 1.5 }}>
                {canMutate
                  ? `Bu görev ${ownerTeamName} ekibinin işi. Kontrolü yap, sonucunu kanıtla ve onaya gönder.`
                  : `Bu görev ${ownerTeamName} ekibinin sorumluluğunda. Sen bu görevi değiştiremezsin.`}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-sand-500">Durum</div>
                <div className={`mt-[3px] text-sm font-bold ${check.status === CheckStatus.FAIL ? "text-rust-700" : "text-sand-900"}`}>
                  {checkStatusLabel[check.status]}
                </div>
              </div>
              <div>
                <div className="text-xs text-sand-500">Kanıt</div>
                <div className="mt-[3px] text-sm font-bold text-sand-900">{evidenceNote}</div>
              </div>
              <div>
                <div className="text-xs text-sand-500">Doğrulayan</div>
                <div className="mt-[3px] text-sm font-bold text-sand-900">{reviewerName}</div>
              </div>
            </div>
            {primaryAction ? (
              <form action={primaryAction.action} className="flex flex-wrap gap-2.5">
                <input type="hidden" name="checkId" value={check.id} />
                <PrimaryButton icon={primaryAction.icon}>{primaryAction.label}</PrimaryButton>
              </form>
            ) : null}
            {nextStepHint && (canMutate || (isReviewer && check.status === CheckStatus.REVIEW)) ? (
              <p className="text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
                {nextStepHint}
              </p>
            ) : null}
            {isReviewer && check.status === CheckStatus.REVIEW && canFailCheck(user, authz) ? (
              <form action={failCheckAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <TextInput name="reason" placeholder="Neyin düzeltilmesi gerektiğini yaz" aria-label="Düzeltme gerekçesi" required className="flex-1" />
                <DangerButton>Düzeltme İste</DangerButton>
              </form>
            ) : null}
          </Card>
          ) : null}

          <Card className="flex flex-col gap-3 px-[22px] py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-sand-900">Kanıtlar</h2>
              <span className="text-xs text-sand-500">
                {locked ? "Salt okunur" : check.status === CheckStatus.FAIL ? "Yeni kanıt gerekli" : evidenceNote}
              </span>
            </div>
            {check.evidence.length === 0 ? (
              <p className="text-[13px] text-sand-500">Henüz kanıt yok. “Yaptım” kanıt değildir.</p>
            ) : (
              check.evidence.map((e) => {
                const kind = e.fileName && e.mimeType ? evidenceFileKind(e.mimeType) : null;
                const link = kind ? null : evidenceLink(e.type, e.body);
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-row bg-sand-50 px-3 py-2.5">
                    <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-tile border border-sand-200 bg-white text-sand-800">
                      <EvidenceIcon type={e.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words text-[13px] font-bold text-sand-900" style={{ lineHeight: 1.45 }}>
                        {e.body}
                      </p>
                      <div className="mt-0.5 text-xs text-sand-500">
                        {evidenceTypeLabel[e.type] ?? e.type}
                        {kind ? ` · ${e.fileName} · ${formatFileSize(e.fileSize ?? 0)}` : ""} · {e.createdBy.name} · {relativeTr(e.createdAt)}
                      </div>
                    </div>
                    {kind && kind !== "download" ? (
                      <a
                        href={`/evidence/${e.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs font-semibold text-sand-800 hover:bg-sand-100"
                        aria-label={`${kind === "image" ? "Görüntüle" : "Aç"}: ${e.fileName} (yeni sekmede)`}
                      >
                        {kind === "image" ? "Görüntüle" : "Aç"} ↗
                      </a>
                    ) : null}
                    {kind ? (
                      <a
                        href={`/evidence/${e.id}?download=1`}
                        download={e.fileName ?? undefined}
                        className="shrink-0 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs font-semibold text-sand-800 hover:bg-sand-100"
                        aria-label={`İndir: ${e.fileName}`}
                      >
                        İndir
                      </a>
                    ) : null}
                    {link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs font-semibold text-sand-800 hover:bg-sand-100"
                        aria-label={`${link.label}: ${link.href} (yeni sekmede)`}
                        title={link.href}
                      >
                        {link.label} ↗
                      </a>
                    ) : null}
                  </div>
                );
              })
            )}
            {canMutate && canAddEvidence(user, authz) ? (
              <form
                action={addEvidenceAction}
                className="flex flex-col gap-3 rounded-panel border-[1.5px] border-dashed border-sand-300 p-[18px]"
              >
                <input type="hidden" name="checkId" value={check.id} />
                <div className="flex items-center justify-center gap-2.5 text-[13px] text-sand-500">
                  <IconUpload size={16} />
                  Kanıt ekle: açıklama, URL, test sonucu ya da dosya / ekran görüntüsü (en fazla 10 MB)
                </div>
                <div className="flex flex-wrap gap-2">
                  <SelectInput name="type" aria-label="Kanıt türü">
                    {["TEXT", "URL", "SCREENSHOT", "FILE", "TEST_RESULT"].map((t) => (
                      <option key={t} value={t}>
                        {evidenceTypeLabel[t]}
                      </option>
                    ))}
                  </SelectInput>
                  <TextInput name="body" placeholder="Bağlantı, ne gördüğün veya dosya notu" className="min-w-0 flex-1 basis-48" aria-label="Kanıt" />
                  <input
                    type="file"
                    name="file"
                    accept={EVIDENCE_FILE_ACCEPT}
                    aria-label="Kanıt dosyası (Dosya / Ekran görüntüsü)"
                    className="min-w-0 basis-full text-xs text-sand-700 file:mr-3 file:rounded-full file:border file:border-sand-200 file:bg-white file:px-3 file:py-1 file:text-xs file:font-semibold"
                  />
                  <SecondaryButton>Kanıt Ekle</SecondaryButton>
                </div>
              </form>
            ) : null}
          </Card>

          {canMutate ? (
            <Card className="flex flex-col gap-3 px-[22px] py-5">
              <h2 className="text-[15px] font-bold text-sand-900">Başka bir ekip veya taraf engelliyor mu?</h2>
              <form action={blockCheckAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                <SelectInput name="blockedBy" aria-label="Engelleyen">
                  {["BACKEND", "FRONTEND", "NETWORK", "CONTENT", "SEO", "CLIENT", "EXTERNAL"].map((b) => (
                    <option key={b} value={b}>
                      {blockedByLabel[b]}
                    </option>
                  ))}
                </SelectInput>
                <TextInput name="reason" placeholder="Engelin nedeni" aria-label="Engelin nedeni" required className="flex-1" />
                <SecondaryButton>Engellendi Olarak İşaretle</SecondaryButton>
              </form>
            </Card>
          ) : null}

          {!locked && user.role !== Role.MANAGEMENT && (canReopenCheck(user) || canWaiveCheck(user) || canChangeOwner(user)) ? (
            <details className="rounded-card border border-sand-200 bg-white shadow-card">
              <summary className="flex cursor-pointer items-center gap-2.5 px-[22px] py-4">
                <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
                <h2 className="text-[15px] font-bold text-sand-900">Yönetici işlemleri</h2>
              </summary>
              <div className="flex flex-col gap-3 px-[22px] pb-5 md:pl-12">
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
                    <SecondaryButton>Doğrulayanı Değiştir</SecondaryButton>
                  </form>
                ) : null}
                {canChangePriority(user) ? (
                  <form action={changePriorityAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <SelectInput name="priority">
                      {(["P0", "P1", "P2", "P3"] as const).map((p) => (
                        <option key={p} value={p}>
                          {p} · {priorityLabel[p]}
                        </option>
                      ))}
                    </SelectInput>
                    <TextInput name="reason" placeholder="Neden" required />
                    <SecondaryButton>Önceliği Değiştir</SecondaryButton>
                  </form>
                ) : null}
                {canMarkNa(user) ? (
                  <form action={markNotApplicableAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <TextInput name="reason" placeholder="Neden bu yayında geçerli değil" required />
                    <SecondaryButton>Uygulanamaz Olarak İşaretle</SecondaryButton>
                  </form>
                ) : null}
                {canWaiveCheck(user) ? (
                  <form action={waiveCheckAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="checkId" value={check.id} />
                    <TextInput name="reason" placeholder="Neden" required />
                    <TextInput name="risk" placeholder="Kabul edilen risk" required />
                    <SecondaryButton>Riski Kabul Edip Muaf Tut</SecondaryButton>
                  </form>
                ) : null}
              </div>
            </details>
          ) : null}

          <details className="rounded-card border border-sand-200 bg-white shadow-card">
            <summary className="flex cursor-pointer items-center gap-2.5 px-[22px] py-4">
              <IconChevronRight size={16} className="chev text-sand-500 transition-transform duration-fast ease-out" />
              <h2 className="text-[15px] font-bold text-sand-900">Geçmiş</h2>
              <span className="text-xs text-sand-500">{audit.length} kayıt</span>
            </summary>
            <ol className="flex flex-col gap-2.5 px-[22px] pb-4 text-[13px] md:pl-12">
              {audit.map((e) => (
                <li key={e.id} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
                  <span className="text-sand-500">{relativeTr(e.createdAt)}</span>
                  <span className="text-sand-800">
                    <strong className="text-sand-900">{e.actor?.name ?? "Sistem"}</strong> {auditSentence(e)}
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </div>

        <div className="flex flex-col gap-3.5 rounded-card border border-sand-200 bg-sand-50 px-5 py-[18px]">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
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
              <div className="whitespace-pre-line text-[13px] text-sand-800" style={{ lineHeight: 1.5 }}>
                {a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {user.role === Role.MANAGEMENT ? <p className="text-sm text-sand-500">Yönetim görünümü salt okunur.</p> : null}
    </Shell>
  );
}
