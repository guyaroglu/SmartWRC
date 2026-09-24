import { describe, expect, it } from "vitest";
import { auditSentence, userFacingError } from "@/lib/tr-messages";

describe("user-facing Turkish messages", () => {
  it("translates domain authorization errors instead of leaking English", () => {
    expect(userFacingError("Not allowed to edit this check")).toMatch(/ekibinin sorumluluğunda değil/);
    expect(userFacingError("SEO_GATED checks require SEO verification")).toMatch(/yalnızca SEO onaylayabilir/);
    expect(userFacingError("PRODUCTION_VERIFIED release is locked. Reopen Release is required.")).toMatch(/kilitli/);
  });

  it("translates illegal transitions with Turkish status names", () => {
    expect(userFacingError("Illegal status transition: NOT_STARTED → PASS")).toBe(
      "Görev “Açık” durumundayken “Onaylandı” durumuna geçirilemez.",
    );
  });

  it("keeps Turkish domain messages and never shows unknown English raw", () => {
    const tr = "Beklenmeyen bir durum oluştu";
    expect(userFacingError(tr)).toBe(tr);
    expect(userFacingError("Some unexpected internal failure")).not.toMatch(/unexpected/);
  });

  it("renders audit events as Turkish sentences", () => {
    expect(auditSentence({ action: "STATUS_CHANGED", oldValue: "REVIEW", newValue: "FAIL", reason: "Canonical staging" })).toBe(
      "durumu “Onay Bekliyor” → “Düzeltme Gerekli” olarak değiştirdi — Canonical staging",
    );
    expect(auditSentence({ action: "GATE_RECALCULATED", oldValue: "NOT_ASSESSED", newValue: "NO_GO", reason: null })).toBe(
      "yayın kararı yeniden hesaplandı: “Yayına Hazır Değil”",
    );
    expect(
      auditSentence({
        action: "BASELINE_COMPLETED",
        oldValue: null,
        newValue: null,
        reason: "Previous execution history existed outside WRC where applicable.",
      }),
    ).toMatch(/^mevcut canlı durumu kaydetti — Önceki çalışma geçmişi/);
  });
});
