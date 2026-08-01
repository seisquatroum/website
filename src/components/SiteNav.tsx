import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type NavItem = {
  key: string;
  label: string;
  sectionId: string;
};

const navBtnClass = (active: boolean) =>
  `whitespace-nowrap px-1 font-mono-zine text-[10px] uppercase tracking-[0.2em] transition-colors ${
    active
      ? "text-brand-accent underline decoration-wavy underline-offset-4"
      : "text-brand-pink/70 hover:text-brand-pink"
  }`;

export function SiteNav({
  items,
  trailing,
  onNavigate,
  activeKey: controlledActiveKey,
}: {
  items: NavItem[];
  trailing?: ReactNode;
  onNavigate?: (item: NavItem) => void;
  activeKey?: string;
}) {
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? "");
  const [open, setOpen] = useState(false);
  const visibleActiveKey = controlledActiveKey ?? activeKey;

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.sectionId))
      .filter((el): el is HTMLElement => el != null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const id = visible[0].target.id;
        const match = items.find((item) => item.sectionId === id);
        if (match) setActiveKey(match.key);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (item: NavItem) => {
    setActiveKey(item.key);
    setOpen(false);
    if (onNavigate) {
      onNavigate(item);
      return;
    }
    document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-pink/25 bg-black/60 backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Desktop nav */}
        <nav className="hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => scrollTo(item)}
              className={`shrink-0 ${navBtnClass(visibleActiveKey === item.key)}`}
              style={{ fontFamily: "'Special Elite','Courier Prime',monospace" }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile / tablet hamburger */}
        <div className="flex flex-1 items-center justify-between gap-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Menu"
                className="inline-flex items-center justify-center rounded-sm border border-brand-pink/40 p-2 text-brand-pink transition-colors hover:bg-brand-pink/10"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="border-brand-pink/30 bg-zine-dark text-brand-pink"
            >
              <SheetHeader>
                <SheetTitle className="font-marker text-left text-brand-accent">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => scrollTo(item)}
                    className={`rounded-sm px-3 py-3 text-left font-mono-zine text-xs uppercase tracking-[0.2em] transition-colors ${
                      visibleActiveKey === item.key
                        ? "bg-brand-magenta/20 text-brand-accent"
                        : "text-brand-pink/80 hover:bg-brand-pink/10 hover:text-brand-pink"
                    }`}
                    style={{ fontFamily: "'Special Elite','Courier Prime',monospace" }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              {trailing ? <div className="mt-6 border-t border-brand-pink/20 pt-4">{trailing}</div> : null}
            </SheetContent>
          </Sheet>
          <span
            className="truncate font-mono-zine text-[10px] uppercase tracking-[0.2em] text-brand-pink/80"
            style={{ fontFamily: "'Special Elite','Courier Prime',monospace" }}
          >
            {items.find((i) => i.key === visibleActiveKey)?.label ?? ""}
          </span>
        </div>

        {/* Language toggle — always visible on desktop trailing; on mobile only in sheet */}
        {trailing ? (
          <div className="hidden shrink-0 lg:block">{trailing}</div>
        ) : null}
      </div>
    </header>
  );
}
