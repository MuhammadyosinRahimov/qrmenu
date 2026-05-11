import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";
import { StoreHydration } from "@/components/StoreHydration";
import { CacheManager } from "@/components/layout/CacheManager";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";

const SITE_URL = "https://delivery.yalla.tj";
const SITE_NAME = "Yalla Eats";
const DEFAULT_DESCRIPTION =
  "Доставка еды в Душанбе и по всему Таджикистану — пицца, бургеры, плов, кофе, десерты, восточная кухня. Заказ онлайн с доставкой и самовывозом за 30–45 минут. Оплата картой и наличными.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yalla Eats — доставка еды в Душанбе и Таджикистане | Заказ онлайн",
    template: "%s | Yalla Eats — доставка еды в Душанбе",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "доставка еды Душанбе",
    "доставка еды Таджикистан",
    "yalla eats",
    "ялла итс",
    "yalla.tj",
    "заказать еду Душанбе",
    "доставка пиццы Душанбе",
    "доставка бургеров Душанбе",
    "доставка суши Душанбе",
    "плов на дом Душанбе",
    "рестораны Душанбе доставка",
    "ужин на дом Таджикистан",
    "обед в офис Душанбе",
    "доставка фастфуд Душанбе",
    "хушдоди ватани",
    "хӯрок дар Душанбе",
    "samovivoz Dushanbe",
    "Dushanbe food delivery",
  ],
  authors: [{ name: "Yalla Eats", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "food",
  classification: "Food Delivery",

  alternates: {
    canonical: "/",
    languages: {
      "ru-TJ": "/",
      "ru-RU": "/",
      "tg-TJ": "/",
      "x-default": "/",
    },
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ru_TJ",
    alternateLocale: ["ru_RU", "tg_TJ"],
    url: SITE_URL,
    title: "Yalla Eats — доставка еды в Душанбе и Таджикистане",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yalla Eats — доставка еды в Душанбе",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Yalla Eats — доставка еды в Душанбе и Таджикистане",
    description: DEFAULT_DESCRIPTION,
    images: ["/assets/og-image.jpg"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/logo.png", type: "image/png" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },

  other: {
    "geo.region": "TJ-DU",
    "geo.placename": "Dushanbe",
    "geo.position": "38.5598;68.7870",
    ICBM: "38.5598, 68.7870",
    "format-detection": "telephone=yes",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },

  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FC8019" },
    { media: "(prefers-color-scheme: dark)", color: "#FC8019" },
  ],
  colorScheme: "light",
};

const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo.png`,
  image: `${SITE_URL}/assets/og-image.jpg`,
  email: "support@yalla.tj",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Душанбе",
    addressLocality: "Душанбе",
    addressRegion: "Душанбе",
    postalCode: "734000",
    addressCountry: "TJ",
  },
  areaServed: [
    { "@type": "City", name: "Душанбе" },
    { "@type": "City", name: "Худжанд" },
    { "@type": "City", name: "Бохтар" },
    { "@type": "Country", name: "Таджикистан" },
  ],
  sameAs: [
    "https://www.instagram.com/yallaeats",
    "https://t.me/yallaeats",
  ],
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: ["ru-TJ", "ru-RU", "tg-TJ"],
  publisher: { "@id": `${SITE_URL}#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/restaurants?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Food delivery",
  provider: { "@id": `${SITE_URL}#organization` },
  areaServed: { "@type": "Country", name: "Таджикистан" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Доставка еды",
    itemListElement: [
      { "@type": "Offer", name: "Доставка еды" },
      { "@type": "Offer", name: "Самовывоз" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="ru-TJ" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0"
        />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="msapplication-TileColor" content="#FC8019" />
        <meta name="msapplication-TileImage" content="/assets/icon-192.png" />
        <meta httpEquiv="content-language" content="ru-TJ" />

        <link rel="alternate" hrefLang="ru-tj" href={SITE_URL} />
        <link rel="alternate" hrefLang="ru-ru" href={SITE_URL} />
        <link rel="alternate" hrefLang="tg-tj" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_LD) }}
        />
      </head>
      <body className="antialiased">
        <ConnectionStatus />
        <CacheManager />
        <StoreHydration />
        <Providers>{children}</Providers>

        {ymId && (
          <>
            <Script id="ym-counter" strategy="afterInteractive">{`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${ymId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true, ecommerce:"dataLayer" });
            `}</Script>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://mc.yandex.ru/watch/${ymId}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
              </div>
            </noscript>
          </>
        )}

        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</Script>
        )}
      </body>
    </html>
  );
}
