import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="w-full max-w-md rounded-card border border-sand-200 bg-white p-8 text-center shadow-raised">
        <h1 className="text-page font-bold text-sand-900">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-sand-800">Aradığın kayıt silinmiş, taşınmış ya da hiç var olmamış olabilir.</p>
        <Link href="/dashboard" className="mt-5 inline-block text-sm font-semibold">
          Genel Bakış’a dön
        </Link>
      </div>
    </div>
  );
}
