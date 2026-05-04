# Implementation Prompt for Claude Code

Скопируй текст ниже и вставь как первое сообщение в Claude Code,
предварительно положив рядом с ним папку `design_handoff_fc_polotsk/`
(с `FC Polotsk.html`, `assets/logo.png` и `README.md`).

---

## ПРОМПТ:

Я хочу собрать одностраничный production-сайт для футбольного клуба ФК Полоцк
на основе высокоточного HTML-прототипа.

**Контекст:**
- В папке `design_handoff_fc_polotsk/` лежит `FC Polotsk.html` — финальный
  дизайн-референс. Это **дизайн, не код для копирования** — нужно
  воссоздать его в нормальном Next.js окружении, сохраняя пиксельную точность.
- Прочитай `design_handoff_fc_polotsk/README.md` целиком — там подробное
  описание секций, токенов, data-моделей и поведения.
- Логотип клуба `design_handoff_fc_polotsk/assets/logo.png` — настоящий, надо использовать.

**Стек:**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v3
- lucide-react для иконок
- Шрифты через `next/font/google`: Bebas Neue (display), Inter (body)
- framer-motion опционально (для player-card / news-card fade-in можно
  обойтись CSS @keyframes)

**Что сделать (по порядку):**

1. Инициализируй проект: `npx create-next-app@latest fc-polotsk --typescript --tailwind --app --eslint --no-src-dir`
2. Открой `design_handoff_fc_polotsk/FC Polotsk.html` в браузере чтобы видеть эталон.
3. Скопируй `design_handoff_fc_polotsk/assets/logo.png` в `public/logo.png`.
4. Перенеси все custom-CSS из `<style>` в HTML-прототипе в `app/globals.css`
   (классы `.stadium-bg`, `.grain`, `.trim-lines`, `.wave-divider`,
   `.wave-divider-light`, `.brand-waves`, `.clamp-2`, `.underline-grow`,
   `.ph-news-1..6`, `.ph-jersey`, `.news-img`, `.player-img` и т.д.).
5. Создай `lib/types.ts` с типами `Player, Match, NewsItem, Standing, SocialChannel, Team` (модель есть в README).
6. Создай `lib/data.ts` — скопируй массивы `SQUAD, NEWS, RECENT, STANDINGS_PREVIEW, NEXT_MATCH, SOCIALS, NAV, POS_FILTERS, POS_LABEL` из HTML-прототипа, добавив типы.
7. Раздели монолитный JSX на компоненты в `components/`:
   - `Logo.tsx` (next/image), `LogoLight.tsx` (CSS mask-image)
   - `Header.tsx` (sticky, scroll-aware, mobile-меню), `Hero.tsx`, `Countdown.tsx`
   - `MatchCenter.tsx`, `News.tsx` + `NewsCard.tsx`
   - `Team.tsx` + `PlayerCard.tsx`
   - `Social.tsx` (с InstagramFrame, TelegramFrame, VKFrame внутри файла или отдельно)
   - `Results.tsx`, `Footer.tsx`, `SectionHeader.tsx`
   - `components/icons/VKIcon.tsx` (кастомный SVG из прототипа)
8. Собери всё в `app/page.tsx`.
9. Настрой шрифты в `app/layout.tsx` через `next/font/google` (Bebas Neue 400, Inter 400/500/600/700/800), пробрось CSS-переменные `--font-display`, `--font-body` в Tailwind config.
10. В `tailwind.config.ts` зарегистрируй кастомные `font-display` / `font-body`, добавь `tabular-nums` если нужно, прокинь brand-цвета (`#003399`, `#001f5c`, `#6ea8ff`, `#0a0e1a`).
11. Настрой meta/OG в `app/layout.tsx` (русский title/description — см. README).
12. Запусти `npm run dev`, открой рядом с `FC Polotsk.html` и сравнивай попиксельно секцию за секцией.

**Принципы:**
- Все цвета, отступы, размеры шрифтов, радиусы — точно как в прототипе.
- Контент (массивы данных) пока статический в `lib/data.ts` — CMS добавим позже.
- Плейсхолдеры (`ph-news-*`, `ph-jersey`) сохраняй — они работают как fallback пока нет реальных фото.
- `min-w-0`, `truncate`, `break-words`, `text-balance` уже расставлены в прототипе — не убирай, спасают от overflow.
- Поведение: sticky-header с двумя состояниями, active-section в nav, smooth scroll, countdown тикает, фильтр команды реактивен, mobile-menu тоггл — всё уже работает в прототипе, повтори.

**Не делать сейчас:**
- Не подключать CMS (Sanity / Strapi) — это следующая итерация.
- Не делать роутинг на отдельные страницы (`/news/[slug]`, `/team/[id]`) —
  MVP одностраничный.
- Не реализовывать покупку билетов — у клуба бесплатный вход, поэтому
  ticket-CTA нет (заменены на соцсети).
- Не делать админку, формы обратной связи, multi-language.

**Что должно работать в конце:**
- `npm run dev` поднимает сайт без ошибок и warnings
- Lighthouse > 90 по всем метрикам
- Mobile, tablet, desktop одинаково хорошо выглядят
- Sticky header плавно меняет состояние при скролле
- Все якорные ссылки скроллят к нужной секции
- Countdown тикает каждую секунду
- Фильтр в Team секции работает мгновенно
- Mobile-меню открывается / закрывается

Поехали — начни с пункта 1 и иди по списку. После каждого крупного шага
покажи мне дифф и попроси подтверждение прежде чем идти дальше.
