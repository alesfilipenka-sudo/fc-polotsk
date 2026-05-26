import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Вход — Match Admin · ФК Полоцк",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-12 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ФК Полоцк"
            width={48}
            height={48}
            className="object-contain"
          />
          <div>
            <p className="font-display text-xl leading-none">Match Admin</p>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/60">
              ФК Полоцк
            </p>
          </div>
        </div>
        <h1 className="mb-1 font-display text-3xl">Вход</h1>
        <p className="mb-6 text-sm text-white/60">
          Доступ только в день матча для оператора.
        </p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
