import { redirect } from "next/navigation";

// /restaurants previously duplicated the home page. Keep the route alive for
// existing deep links / bookmarks but funnel everyone to the canonical home
// page where restaurant browsing now lives.
export default function RestaurantsPage() {
  redirect("/");
}
