import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yalla Eats — доставка еды в Душанбе",
    short_name: "Yalla Eats",
    description:
      "Доставка еды в Душанбе и Таджикистане. Заказ онлайн с доставкой и самовывозом.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#FC8019",
    lang: "ru-TJ",
    dir: "ltr",
    scope: "/",
    categories: ["food", "lifestyle", "shopping"],
    icons: [
      { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/assets/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Рестораны", url: "/restaurants", description: "Каталог ресторанов" },
      { name: "Корзина", url: "/cart", description: "Корзина" },
      { name: "Мои заказы", url: "/orders", description: "История заказов" },
    ],
  };
}
