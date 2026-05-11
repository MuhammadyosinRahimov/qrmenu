import type { MetadataRoute } from "next";

const SITE_URL = "https://delivery.yalla.tj";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5079";

interface RestaurantStub {
  id: string;
  slug?: string;
  updatedAt?: string;
}

async function fetchRestaurants(): Promise<RestaurantStub[]> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants?activeOnly=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/restaurants`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/delivery/address`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const restaurants = await fetchRestaurants();
  const restaurantRoutes: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${SITE_URL}/restaurants/${r.slug ?? r.id}`,
    lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...restaurantRoutes];
}
