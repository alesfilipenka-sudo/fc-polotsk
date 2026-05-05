# FC Polotsk

Official website for FC Polotsk — Belarusian football club, Premier League.

## Stack

- **Web**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v3
- **CMS**: Sanity v3 (apps/studio)
- **Hosting**: Vercel (web + studio = 2 проекта в 1 репо)
- **Package manager**: pnpm 9 workspaces
- **Node**: 20+

## Repo layout

```
fc-polotsk/
├── apps/
│   ├── web/              # Next.js site (Phase 1 ✅)
│   └── studio/           # Sanity Studio + schemas + seed (Phase 2 ✅)
├── packages/
│   └── shared/           # types, GROQ, sanity client (Phase 3)
└── docs/
    └── handoff/          # design reference (HTML prototype + logo)
```

## Quick start

```bash
pnpm install                # install workspace deps

# Web
pnpm dev                    # → http://localhost:3000

# Studio
pnpm studio                 # → http://localhost:3333
pnpm studio:seed            # naполнить плейсхолдерами

# Quality
pnpm typecheck
pnpm lint
pnpm build
```

## Phase status

- [x] Phase 0 — Prep (repo, accounts, domain)
- [x] Phase 1 — Web frontend scaffolding & landing shell
- [x] Phase 2 — Sanity Studio + schemas + seed
- [ ] Phase 3 — Wire site to Sanity (RSC + GROQ + ISR + revalidate webhook)
- [ ] Phase 4 — Custom domain & SSL
- [ ] Phase 5 — Polish (sitemap, OG, 404)

См. [`ACTION_PLAN.md`](./ACTION_PLAN.md) для полного плана.

## Sanity setup (Phase 2)

1. **Создай проект** на https://www.sanity.io/manage → New project → name "FC Polotsk", dataset `production`, public.
2. **Скопируй** Project ID из Settings.
3. **Создай write-токен** в API → Tokens → Add API token → Permissions: Editor.
4. **`apps/studio/.env.local`** — скопируй из `.env.local.example` и заполни:
   ```
   SANITY_STUDIO_PROJECT_ID=xxxxxxxx
   SANITY_STUDIO_DATASET=production
   SANITY_STUDIO_WRITE_TOKEN=skXXXXX...
   ```
5. **`pnpm install`** в корне.
6. **`pnpm studio:seed`** — наполнит dataset плейсхолдерами (teams, players, news, matches, standings, socials, siteSettings).
7. **`pnpm studio`** → откроется Studio на :3333. Залогинься через GitHub.

### Schemas (apps/studio/schemas/)

| Schema | Singleton? | Назначение |
|---|---|---|
| `team` | — | ФК Полоцк + соперники (с logo и short fallback) |
| `player` | — | Состав, фильтр по позиции (GK/DF/MF/FW) |
| `match` | — | Матчи (home/away → ref team), статус, счёт |
| `news` | — | Новости (slug, portable text body, cover/placeholder) |
| `standingsTable` | ✅ | Турнирная таблица — array rows внутри одного документа |
| `socialChannel` | — | IG / TG / VK / YouTube |
| `siteSettings` | ✅ | Hero copy, nextMatch ref, контакты, footer |

## Design reference

Оригинальный handoff (HTML прототип + logo + спека) в [`docs/handoff/`](./docs/handoff/). Read-only — источник истины для пиксельной точности, не для копирования кода.

## Brand

Brand primary: `#234794` (из логотипа). Полная палитра в `apps/web/tailwind.config.ts` под namespace `polotsk` и зеркалом `primary`.

## Безопасность

- `.env.local` всегда в `.gitignore`. Ни в коем случае не коммить write-токены.
- Если токен утёк — реврлируй в `sanity.io/manage` → API → Tokens.
- Public dataset = read доступен по проекту/датасету без токена. Write всегда требует Editor token.
