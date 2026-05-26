"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

interface LoginFormProps {
  from?: string;
}

const initial: LoginState = {};

export function LoginForm({ from }: LoginFormProps) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="from" value={from ?? "/match-admin"} />
      <label className="block">
        <span className="mb-1.5 block text-[10px] uppercase tracking-eyebrow text-white/60">
          Пароль
        </span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/20 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-polotsk-300 focus:bg-white/[0.1]"
          placeholder="••••••••"
        />
      </label>
      {state.error && (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <p className="font-semibold">{state.error}</p>
          {state.hint && <p className="mt-1 text-red-200/80">{state.hint}</p>}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-polotsk-700 transition hover:bg-polotsk-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Проверяю…" : "Войти"}
      </button>
    </form>
  );
}
