import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback } from "react";
import {
  MagazineIndex,
  sectionFromPath,
} from "./-magazine";

export const Route = createFileRoute("/_zine")({
  component: ZineLayout,
});

function ZineLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const initialSection = sectionFromPath(pathname);

  const onSharePathChange = useCallback(
    (path: string) => {
      if (path === pathname) return;
      if (path === "/") {
        void navigate({ to: "/", replace: true });
        return;
      }
      const section = path.replace(/^\//, "");
      void navigate({
        to: "/$section",
        params: { section },
        replace: true,
      });
    },
    [navigate, pathname],
  );

  return (
    <>
      <MagazineIndex
        initialSection={initialSection}
        onSharePathChange={onSharePathChange}
      />
      <Outlet />
    </>
  );
}
