import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/gestao")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: import.meta.env.DEV
    ? lazyRouteComponent(() => import("@/components/members/Preparation"), "PreparationPage")
    : () => null,
  head: () => ({
    meta: [
      { title: "Preparar cartões | Associação 641" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
