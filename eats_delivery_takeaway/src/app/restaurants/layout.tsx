import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Все рестораны Душанбе — каталог с доставкой и самовывозом",
  description:
    "Каталог ресторанов Душанбе с доставкой еды на дом и самовывозом. Пицца, бургеры, плов, суши, кофе, восточная кухня. Сравните цены, рейтинги и время доставки.",
  alternates: { canonical: "/restaurants" },
  openGraph: {
    title: "Каталог ресторанов Душанбе с доставкой",
    description: "Все рестораны Душанбе с онлайн-заказом. Доставка и самовывоз.",
    url: "/restaurants",
    type: "website",
  },
  keywords: [
    "рестораны Душанбе",
    "каталог ресторанов Таджикистан",
    "доставка еды каталог",
    "лучшие рестораны Душанбе",
    "рестораны с доставкой",
    "рестораны Душанбе доставка",
  ],
};

export default function RestaurantsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
