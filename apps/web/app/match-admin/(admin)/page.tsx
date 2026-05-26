export default function MatchAdminHomePage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="mb-2 font-display text-2xl">Match Admin</h1>
      <p className="mb-1 text-sm text-slate-600">
        Авторизация прошла. Сессия будет жить до выхода или 12 часов.
      </p>
      <p className="text-xs text-slate-400">
        Список матчей и панель событий появятся в Фазе 2B.
      </p>
    </div>
  );
}
