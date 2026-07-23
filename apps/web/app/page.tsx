import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { MatchCenter } from "@/components/sections/MatchCenter";
import { News } from "@/components/sections/News";
import { Team } from "@/components/sections/Team";
import { Social } from "@/components/sections/Social";
import { Results } from "@/components/sections/Results";

// Главная должна рефрешиться при обновлении CMS. Без этого экспорта Next.js
// собирает страницу один раз на build и держит её в статическом кэше — тогда
// новые данные (slug'и, состав, live-статус) не появляются до нового деплоя.
// 60 сек = разумный баланс между свежестью и нагрузкой на Sanity.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <MatchCenter />
        <News />
        <Team />
        <Social />
        <Results />
      </main>
      <Footer />
    </>
  );
}
