import { describe, expect, it } from "vitest";
import { EvidenceType } from "@prisma/client";
import { evidenceLink } from "@/lib/evidence-view";

describe("evidence presentation", () => {
  it("URL evidence opens the stored URL; screenshots are viewable", () => {
    expect(evidenceLink(EvidenceType.URL, " https://www.solen.com.tr/urunler?x=1 ")).toEqual({
      href: "https://www.solen.com.tr/urunler?x=1",
      label: "Aç",
    });
    expect(evidenceLink(EvidenceType.SCREENSHOT, "https://cdn.example.com/shot.png")?.label).toBe("Görüntüle");
    // “URL — note” records link the URL only
    expect(evidenceLink(EvidenceType.URL, "https://www.audi.com.tr/modeller — canonical production domainini gösteriyor")?.href).toBe(
      "https://www.audi.com.tr/modeller",
    );
  });

  it("text / test-result evidence is never turned into a link or download", () => {
    expect(evidenceLink(EvidenceType.TEXT, "Crawl: 23 H1 missing, 8 multiple H1.")).toBeNull();
    expect(evidenceLink(EvidenceType.TEST_RESULT, "https://ci.example.com/run/1")).toBeNull();
    expect(evidenceLink(EvidenceType.FILE, "report.pdf")).toBeNull(); // V0 stores no file, so no fake download
  });

  it("a URL-typed record without a real http(s) URL stays text; unsafe schemes are never linked", () => {
    expect(evidenceLink(EvidenceType.URL, "deneme.com/deneme")).toBeNull();
    expect(evidenceLink(EvidenceType.URL, "12 şablon sayfasında kırık görsel yok")).toBeNull();
    expect(evidenceLink(EvidenceType.URL, "javascript:alert(1)")).toBeNull();
    expect(evidenceLink(EvidenceType.SCREENSHOT, "data:image/png;base64,AAAA")).toBeNull();
  });
});
