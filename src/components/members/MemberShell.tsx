import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import logoWhite from "@/assets/641-logo-white.png";
import "./members.css";

export function MemberShell({
  children,
  preparation = false,
}: {
  children: ReactNode;
  preparation?: boolean;
}) {
  return (
    <div className="members-shell">
      <header className="members-header">
        <Link to="/" className="members-brand" aria-label="Associação 641, início">
          <img src={logoWhite} alt="641" />
          <span>Associação 641</span>
        </Link>
        <nav aria-label="Navegação de sócios">
          {import.meta.env.DEV && preparation && (
            <Link to="/socios" activeProps={{ "aria-current": "page" }}>
              Sócios
            </Link>
          )}
          <Link to="/" className="members-back">
            <ArrowLeft size={17} aria-hidden="true" /> Revista
          </Link>
        </nav>
      </header>
      <main className="members-main" id="members-content">
        {children}
      </main>
      <footer className="members-footer">
        <span>Feito com barulho em Oeiras.</span>
        <Link to="/">
          641.pt <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}

export function CutoutHeading({ children }: { children: string }) {
  return (
    <h1 className="members-title" aria-label={children}>
      <span aria-hidden="true">
        {Array.from(children).map((letter, index) => (
          <span key={index} className={letter === " " ? "cutout-space" : "cutout-letter"}>
            {letter}
          </span>
        ))}
      </span>
    </h1>
  );
}
