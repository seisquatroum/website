import { createFileRoute, notFound } from "@tanstack/react-router";
import { MAGAZINE_SECTION_ALIASES } from "../-magazine";

export const Route = createFileRoute("/_zine/$section")({
  beforeLoad: ({ params }) => {
    const key = params.section.toLowerCase();
    if (!MAGAZINE_SECTION_ALIASES[key]) {
      throw notFound();
    }
  },
  component: () => null,
});
