import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Metinden veya görselden 3D model üret
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Tripo3D motoruyla çalışan üretim platformu. Bir açıklama yaz veya bir
        görsel yükle, saniyeler içinde indirilebilir bir 3D model al.
      </p>
      <Link
        href="/generate"
        className="mt-8 rounded-full bg-foreground px-6 py-3 text-background font-medium"
      >
        Üretmeye başla
      </Link>
    </div>
  );
}
