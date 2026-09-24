"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="w-full max-w-md rounded-card border border-sand-200 bg-white p-8 text-center shadow-raised">
        <h1 className="text-page font-bold text-sand-900">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm text-sand-800">İşlem tamamlanamadı. Sayfayı yeniden deneyebilirsin; sorun sürerse sistem yöneticisine haber ver.</p>
        <button type="button" onClick={reset} className="mt-5 text-sm font-semibold text-clay-600 hover:text-clay-700">
          Yeniden dene
        </button>
      </div>
    </div>
  );
}
