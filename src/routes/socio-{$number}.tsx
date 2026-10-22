import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/socio-{$number}")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/socios/$number", params: { number: params.number }, replace: true });
  },
});
