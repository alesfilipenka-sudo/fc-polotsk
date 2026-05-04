# FC Polotsk — Action Plan & Tips

> Реальный production-сайт на Next.js 15 + TS + Tailwind по дизайн-референсу
> `design_handoff_fc_polotsk/FC Polotsk.html` + headless CMS Sanity для самостоятельного
> ведения новостей, состава, расписания клубом.

## Стек (зафиксировано)

| Слой | Что |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind v3 |
| CMS | Sanity (free tier, dataset `production`) |
| Hosting | Vercel (две проекта: `web` и `studio`) |
| Repo | GitHub, личный аккаунт, монорепо pnpm workspaces |
| Иконки | lucide-react + кастомный VKIcon |
| Шрифты | Bebas Neue (display), Inter (body) через `next/font/google` |

## Архитектура

**Monorepo с pnpm workspaces:**

```
fc-polotsk/
├── apps/
│   ├── web/                 # Next.js сайт
│   └── studio/              # Sanity Studio
├── packages/
│   └── shared/              # types, GROQ queries, sanity client
├── docs/
│   └── handoff/             # design_handoff_fc_polotsk (read-only reference)
├── .github/
│   └── workflows/ci.yml     # lint + typecheck + build
├── .gitignore
├── package.json
└── pnpm-workspace.yaml
```

**Data flow:**
```
Sanity Studio (admin) → Sanity Content Lake → GROQ fetch (RSC, ISR 60s)
                                            ↓
                                      Webhook on publish
                                            ↓
                            POST /api/revalidate → revalidatePath()
```

## Action Order

### Phase 0 — Prep (30 мин)
- [ ] GitHub: создать private repo `fc-polotsk`
- [ ] sanity.io: project «FC Polotsk», dataset `production`
- [ ] Vercel: team подключён к GitHub
- [ ] Сохранить в менеджере паролей: `projectId`, `dataset`, API tokens
  (Editor для writes, Viewer для reads)
- [ ] Купить/проверить домен (`fcpolotsk.by` или альтернатива)

### Phase 1 — Сайт по дизайну (3–5 ч)
- [ ] Init monorepo с pnpm workspaces
- [ ] `cd apps/web && pnpm create next-app@latest . --ts --tailwind --app --eslint --no-src-dir`
- [ ] Идти строго по `IMPLEMENTATION_PROMPT.md` пункты 3–12
- [ ] Коммитить после каждой секции (conventional commits)
- [ ] Контроль: `pnpm dev` пиксель-в-пиксель, Lighthouse > 90
- [ ] Push в GitHub, deploy `apps/web` на Vercel

### Phase 2 — Sanity Studio (2–3 ч)
- [ ] `cd apps/studio && pnpm create sanity@latest`
- [ ] Schemas: `player, team, match, news, standing, socialChannel, siteSettings`
- [ ] Plugins: `@sanity/vision`, `@sanity/preview-url-secret`
- [ ] Deploy `apps/studio` на Vercel (отдельный проект)
- [ ] Roles: ты — Admin, клуб — Editor, фотограф — Contributor

### Phase 3 — Wire site to Sanity (2–4 ч)
- [ ] `packages/shared/sanityClient.ts` (prod + preview)
- [ ] `packages/shared/queries.ts` — GROQ для каждой секции
- [ ] Replace `lib/data.ts` → server fetches в RSC
- [ ] `app/api/revalidate/route.ts` + webhook в Sanity
- [ ] **Migration script** `apps/studio/scripts/seed.ts` — заливка из захардкоженных
      массивов через `@sanity/client`. Не вбивать через UI.
- [ ] Контроль: новость в Studio → < 60s видна на проде

### Phase 4 — Deploy & domain (1 ч)
- [ ] Env vars в Vercel: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
      `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`
- [ ] Domain `fcpolotsk.by` → web проект, `studio.fcpolotsk.by` → studio
- [ ] SSL автоматом через Let's Encrypt
- [ ] Vercel Analytics ON

### Phase 5 — Polish
- [ ] `next-sitemap` + robots.txt
- [ ] `app/opengraph-image.tsx`
- [ ] 404/error pages с дизайном клуба
- [ ] README для клуба: как завести новость / игрока (со скриншотами Studio)

## Sanity schemas (mapping → TS-типы)

| TS type           | Sanity document    | Notes                                          |
|-------------------|--------------------|------------------------------------------------|
| `Player`          | `player`           | image с hotspot, country select из enum        |
| `Team`            | `team`             | logo image, short = string max 4               |
| `Match`           | `match`            | home/away → reference team, isPolotskHome bool |
| `NewsItem`        | `news`             | slug, body PortableText, coverImage опционально|
| `Standing`        | внутри `standings` | array в одном singleton-doc, не отдельные      |
| `SocialChannel`   | `socialChannel`    | id select из enum                              |
| `siteSettings`    | singleton          | nextMatch ref, hero copy, контакты             |

## Тонкие места

- **Studio preview**: `draftMode()` + `previewClient` с `perspective: 'previewDrafts'`
- **Migration**: всегда скриптом, не UI
- **Image hotspot**: `hotspot: true` в schema, `?fit=crop&crop=focalpoint` в URL
- **Locale**: если будет EN — `@sanity/document-internationalization` сразу
- **Лицензии**: формализовать владение logo.png и копирайт когда передаём клубу
- **Бесплатный лимит Sanity**: 10k docs, 5GB assets, 100k req/мес — клубу хватит
- **.gitignore**: `.env.local`, `.next/`, `node_modules/`, `dist/`, `.sanity/`
- **Не дописывать кастомную админку** — всё через Sanity Studio
- **CI с самого начала**: GitHub Actions `lint + typecheck + build` на PR

## Ссылки которые понадобятся

- Sanity docs: https://www.sanity.io/docs
- Next.js + Sanity template: https://github.com/sanity-io/next-template
- Vercel monorepo: https://vercel.com/docs/monorepos/pnpm
- Image URL builder: https://www.sanity.io/docs/image-url
- GROQ cheat sheet: https://www.sanity.io/docs/query-cheat-sheet

## Бюджет времени (оценка)

| Phase | Время | Что в итоге |
|---|---|---|
| 0 | 30 мин | Аккаунты, домен |
| 1 | 3–5 ч | Сайт со статикой, deployed |
| 2 | 2–3 ч | Studio с schemas, deployed |
| 3 | 2–4 ч | Сайт читает из Sanity, webhooks |
| 4 | 1 ч | Кастомный домен, SSL |
| 5 | 1–2 ч | Polish |
| **Итого** | **10–15 ч** | Production-ready клубный сайт с CMS |
