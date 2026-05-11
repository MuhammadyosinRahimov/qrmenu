import type { MetadataRoute } from "next";

const SITE_URL = "https://delivery.yalla.tj";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout/",
          "/profile/",
          "/cart",
          "/login",
          "/payment/",
          "/orders/",
        ],
      },
      { userAgent: "Yandex", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
