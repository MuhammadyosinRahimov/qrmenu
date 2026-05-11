import type { Metadata } from "next";

const SITE_URL = "https://delivery.yalla.tj";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5079";

interface RestaurantSeo {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  workingHours?: { dayOfWeek: string; opens: string; closes: string }[];
}

async function fetchRestaurant(id: string): Promise<RestaurantSeo | null> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants/${id}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as RestaurantSeo;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}): Promise<Metadata> {
  const { restaurantId } = await params;
  const r = await fetchRestaurant(restaurantId);

  if (!r) {
    return {
      title: "Ресторан",
      description: "Доставка еды в Душанбе",
      alternates: { canonical: `/restaurants/${restaurantId}` },
    };
  }

  const name = r.name ?? "Ресторан";
  const title = `${name} — доставка из ресторана в Душанбе`;
  const description =
    (r.description?.slice(0, 160)) ??
    `Меню ${name}. Заказ еды с доставкой и самовывозом в Душанбе. Быстрая доставка, оплата картой или наличными.`;
  const image = r.imageUrl ?? r.image ?? `${SITE_URL}/assets/og-image.jpg`;
  const url = `${SITE_URL}/restaurants/${restaurantId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: name }],
      siteName: "Yalla Eats",
      locale: "ru_TJ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    keywords: [
      `${name} Душанбе`,
      `${name} доставка`,
      `${name} меню`,
      `${name} заказать`,
      `доставка ${r.cuisine ?? "еды"} Душанбе`,
      "доставка еды Таджикистан",
      "рестораны Душанбе",
    ],
    other: {
      "geo.region": "TJ-DU",
      "geo.placename": r.address ?? "Душанбе",
      ...(r.lat && r.lng
        ? {
            "geo.position": `${r.lat};${r.lng}`,
            ICBM: `${r.lat}, ${r.lng}`,
          }
        : {}),
    },
  };
}

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const r = await fetchRestaurant(restaurantId);

  const restaurantLd = r
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": `${SITE_URL}/restaurants/${restaurantId}#restaurant`,
        name: r.name,
        image: r.imageUrl ?? r.image,
        description: r.description,
        url: `${SITE_URL}/restaurants/${restaurantId}`,
        telephone: r.phone,
        priceRange: "$$",
        servesCuisine: r.cuisine ?? "International",
        address: {
          "@type": "PostalAddress",
          streetAddress: r.address ?? "Душанбе",
          addressLocality: "Душанбе",
          addressCountry: "TJ",
        },
        ...(r.lat && r.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: r.lat,
                longitude: r.lng,
              },
            }
          : {}),
        ...(r.workingHours && r.workingHours.length
          ? {
              openingHoursSpecification: r.workingHours.map((wh) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: wh.dayOfWeek,
                opens: wh.opens,
                closes: wh.closes,
              })),
            }
          : {}),
        ...(r.rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: r.rating,
                reviewCount: r.reviewCount ?? 1,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        hasMenu: `${SITE_URL}/restaurants/${restaurantId}#menu`,
        acceptsReservations: false,
        potentialAction: {
          "@type": "OrderAction",
          target: `${SITE_URL}/restaurants/${restaurantId}`,
          deliveryMethod: [
            "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
            "http://purl.org/goodrelations/v1#DeliveryModePickUp",
          ],
        },
      }
    : null;

  return (
    <>
      {restaurantLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }}
        />
      )}
      {children}
    </>
  );
}
