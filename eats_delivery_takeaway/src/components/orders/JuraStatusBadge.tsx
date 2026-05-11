"use client";

import { Badge } from "@/components/ui/Badge";
import { juraStatusLabel } from "@/lib/jura";

type BadgeVariant = "success" | "error" | "default" | "info" | "primary" | "warning";

function juraStatusVariant(id: number): BadgeVariant {
  if (id === 10) return "error";
  if (id === 9) return "success";
  if (id === 7) return "info";
  if (id >= 2) return "warning";
  return "default";
}

export function JuraStatusBadge({ juraStatusId }: { juraStatusId: number | null | undefined }) {
  if (juraStatusId == null) return null;
  return <Badge variant={juraStatusVariant(juraStatusId)}>{juraStatusLabel(juraStatusId)}</Badge>;
}
