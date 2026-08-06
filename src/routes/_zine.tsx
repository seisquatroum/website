import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import {
  MagazineIndex,
  sectionFromPath,
} from "./-magazine";

export const Route = createFileRoute("/_zine")({
  component: ZineLayout,
});

function ZineLayout() {
  const navigate = useNavigate();
  const { setLocale } = useI18n();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const routeInfo = sectionFromPath(pathname);
  const initialSection = routeInfo?.pageKey;
  const entryLocaleAppliedRef = useRef(false);

  // English share URLs (join-us, contacts, …) flip the site to EN once on entry.
  // PT canonic sync must not reset locale afterwards.
  useEffect(() => {
    if (entryLocaleAppliedRef.current) return;
    if (!routeInfo?.locale) return;
    setLocale(routeInfo.locale);
    entryLocaleAppliedRef.current = true;
  }, [routeInfo, setLocale]);

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
