import { HeaderClient } from "./HeaderClient";
import { getSocialUrls } from "@/lib/social-urls";

/**
 * Server-обёртка: фетчит URL'ы соцсетей из Sanity (socialChannel docs)
 * и пробрасывает в client-компонент с интерактивом (scroll, mobile menu).
 *
 * Источник правды один — те же документы socialChannel что рендерит
 * большая секция «Соцсети» на главной. Изменил URL в Studio →
 * автоматом обновится в шапке во всех страницах через 5 минут (revalidate).
 */
export async function Header() {
  const socials = await getSocialUrls();
  return <HeaderClient socials={socials} />;
}
