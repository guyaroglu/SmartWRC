import { describe, expect, it } from "vitest";
import { MAX_EVIDENCE_FILE_BYTES, evidenceFileHeaders, safeFileName, validateEvidenceFile } from "@/lib/evidence-file";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const PDF = Buffer.from("%PDF-1.4\n%test\n");

describe("evidence file validation", () => {
  it("accepts allowed types by extension + content and serves our MIME, not the client's", () => {
    expect(validateEvidenceFile("hero.PNG", PNG, "application/octet-stream")).toEqual({ fileName: "hero.PNG", mimeType: "image/png", size: PNG.length });
    expect(validateEvidenceFile("rapor.pdf", PDF).mimeType).toBe("application/pdf");
    expect(validateEvidenceFile("crawl.csv", Buffer.from("url,h1\n/a,0\n"), "application/vnd.ms-excel").mimeType).toBe("text/csv");
    expect(validateEvidenceFile("liste.xlsx", Buffer.from([0x50, 0x4b, 0x03, 0x04, 1]), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").mimeType).toContain("spreadsheetml");
  });

  it("rejects executables, scripts, markup and unknown types", () => {
    for (const name of ["setup.exe", "run.sh", "x.js", "page.html", "logo.svg", "macro.xlsm", "noext"]) {
      expect(() => validateEvidenceFile(name, Buffer.from("MZ..."))).toThrow("not allowed");
    }
    expect(() => validateEvidenceFile("shot.png", PNG, "text/html")).toThrow("not allowed");
  });

  it("rejects content that does not match the extension, empty and oversized files", () => {
    expect(() => validateEvidenceFile("shot.png", Buffer.from("MZ\x90\x00 not an image"))).toThrow("does not match");
    expect(() => validateEvidenceFile("rapor.pdf", Buffer.from("<script>"))).toThrow("does not match");
    expect(() => validateEvidenceFile("data.csv", Buffer.from([0x61, 0x00, 0x62]))).toThrow("does not match");
    expect(() => validateEvidenceFile("a.png", Buffer.alloc(0))).toThrow("empty");
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_EVIDENCE_FILE_BYTES)]);
    expect(() => validateEvidenceFile("big.png", big)).toThrow("too large");
  });

  it("file names are display text only: path parts and control characters are stripped", () => {
    expect(safeFileName("../../etc/passwd.png")).toBe("passwd.png");
    expect(safeFileName("C:\\Users\\x\\..\\rapor.pdf")).toBe("rapor.pdf");
    expect(safeFileName('a"b<c>\u0000.csv')).toBe("abc.csv");
    expect(safeFileName("...")).toBe("kanit");
  });

  it("images / PDF render inline, other files download; never sniffed or cached", () => {
    const img = evidenceFileHeaders({ fileName: "ekran görüntüsü.png", mimeType: "image/png", size: 10 }, false);
    expect(img["Content-Disposition"]).toMatch(/^inline;/);
    expect(img["Content-Disposition"]).toContain("filename*=UTF-8''ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.png");
    expect(img["X-Content-Type-Options"]).toBe("nosniff");
    expect(evidenceFileHeaders({ fileName: "a.png", mimeType: "image/png", size: 1 }, true)["Content-Disposition"]).toMatch(/^attachment;/);
    expect(evidenceFileHeaders({ fileName: "a.csv", mimeType: "text/csv", size: 1 }, false)["Content-Disposition"]).toMatch(/^attachment;/);
    expect(evidenceFileHeaders({ fileName: "a.pdf", mimeType: "application/pdf", size: 1 }, false)["Cache-Control"]).toBe("private, no-store");
  });
});
