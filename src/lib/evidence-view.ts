import type { EvidenceType } from "@prisma/client";

// Evidence is stored as `body` text (V0 has no file storage). Only link-type evidence whose body is a
// real http(s) URL becomes a link; everything else is shown as full, readable text. No href is
// invented for plain text, and non-http schemes (javascript:, data:) are never linked.
const LINK_ACTION: Partial<Record<EvidenceType, string>> = {
  URL: "Aç",
  SCREENSHOT: "Görüntüle",
  EXTERNAL_TICKET: "Aç",
};

export function evidenceLink(type: EvidenceType, body: string): { href: string; label: string } | null {
  const label = LINK_ACTION[type];
  if (!label) return null;
  try {
    // Records are often “URL — note”: link the leading URL only, the full text stays visible.
    const url = new URL(body.trim().split(/\s+/)[0]);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { href: url.href, label };
  } catch {
    return null;
  }
}
