// Uploaded evidence: a small allow-list, a size cap and content sniffing. The served MIME type comes
// from this table, never from the client, and the file name is only ever display text (bytes live in
// Postgres), so there is no filesystem path to traverse.
export const MAX_EVIDENCE_FILE_BYTES = 10 * 1024 * 1024;

type Kind = "image" | "pdf" | "download";

const ALLOWED: Record<string, { mime: string; kind: Kind; magic?: (b: Buffer) => boolean; text?: boolean }> = {
  png: { mime: "image/png", kind: "image", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: "image/jpeg", kind: "image", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  jpeg: { mime: "image/jpeg", kind: "image", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  webp: { mime: "image/webp", kind: "image", magic: (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP" },
  pdf: { mime: "application/pdf", kind: "pdf", magic: (b) => b.toString("latin1", 0, 5) === "%PDF-" },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    kind: "download",
    magic: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
  csv: { mime: "text/csv", kind: "download", text: true },
  txt: { mime: "text/plain", kind: "download", text: true },
  json: { mime: "application/json", kind: "download", text: true },
};

export const EVIDENCE_FILE_ACCEPT = Object.keys(ALLOWED)
  .map((e) => `.${e}`)
  .join(",");

export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[\u0000-\u001f\u007f"<>|:*?]/g, "").replace(/^\.+/, "").trim();
  return (clean || "kanit").slice(0, 120);
}

function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

// Browser-declared types are unreliable (CSV often arrives as vnd.ms-excel), so they only veto.
const ACTIVE_CONTENT = new Set([
  "text/html",
  "application/xhtml+xml",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "image/svg+xml",
  "text/xml",
  "application/xml",
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sh",
  "application/x-bat",
]);

export function validateEvidenceFile(
  name: string,
  bytes: Buffer,
  declaredType = "",
): { fileName: string; mimeType: string; size: number } {
  const fileName = safeFileName(name);
  if (ACTIVE_CONTENT.has(declaredType.split(";")[0].trim().toLowerCase())) throw new Error("Evidence file type is not allowed");
  const rule = ALLOWED[extensionOf(fileName)];
  if (!rule) throw new Error("Evidence file type is not allowed");
  if (bytes.length === 0) throw new Error("Evidence file is empty");
  if (bytes.length > MAX_EVIDENCE_FILE_BYTES) throw new Error("Evidence file is too large");
  if (rule.magic && !rule.magic(bytes)) throw new Error("Evidence file content does not match its type");
  if (rule.text && bytes.includes(0)) throw new Error("Evidence file content does not match its type");
  return { fileName, mimeType: rule.mime, size: bytes.length };
}

export function evidenceFileKind(mimeType: string | null | undefined): Kind {
  const rule = Object.values(ALLOWED).find((r) => r.mime === mimeType);
  return rule?.kind ?? "download";
}

/** Response headers: images and PDFs may render inline, everything else downloads. Never sniffed. */
export function evidenceFileHeaders(file: { fileName: string; mimeType: string; size: number }, download: boolean): Record<string, string> {
  const inline = !download && evidenceFileKind(file.mimeType) !== "download";
  const ascii = file.fileName.replace(/[^\x20-\x7e]/g, "_");
  return {
    "Content-Type": file.mimeType,
    "Content-Length": String(file.size),
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
    ...(evidenceFileKind(file.mimeType) === "image" ? { "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'" } : {}),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
