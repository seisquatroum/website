import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CutoutHeading, MemberShell } from "@/components/members/MemberShell";
import { MemberCard } from "@/components/members/MemberCard";
import { membersQueryOptions } from "@/lib/members/data";
import { formatNumber, normalize } from "@/lib/members/model";

export const Route = createFileRoute("/socios/")({
  component: MembersPage,
  head: () => ({
    meta: [{ title: "Sócios | Associação 641" }, { name: "robots", content: "noindex, nofollow" }],
  }),
});

function MembersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = useQuery(membersQueryOptions);
  const term = normalize(search);
  const filtered = (query.data?.members ?? []).filter(
    (member) =>
      normalize(member.name).includes(term) ||
      String(member.number).includes(term) ||
      formatNumber(member.number).includes(term),
  );
  const pages = Math.ceil(filtered.length / 12);
  const currentPage = Math.min(page, Math.max(0, pages - 1));
  return (
    <MemberShell>
      <div className="members-page-heading">
        <CutoutHeading>Sócios</CutoutHeading>
        <p>A comunidade que faz a 641.</p>
      </div>
      <div className="members-toolbar">
        <label className="members-search">
          <Search size={20} aria-hidden="true" />
          <span className="members-sr-only">Procurar por nome ou número</span>
          <input
            type="search"
            placeholder="Nome ou número de sócio"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </label>
      </div>
      {query.isPending && (
        <p className="members-message" role="status">
          A carregar cartões…
        </p>
      )}
      {query.isError && (
        <div className="members-notice" role="alert">
          Não foi possível carregar os cartões.{" "}
          <button onClick={() => void query.refetch()}>Tentar novamente</button>
        </div>
      )}
      {query.isSuccess && (
        <>
          <p className="members-count" role="status">
            {filtered.length} {filtered.length === 1 ? "sócio" : "sócios"}
            {search ? " encontrados" : ""}
          </p>
          {!filtered.length ? (
            <div className="members-empty">
              <h2>{search ? "Nenhum cartão encontrado" : "Os cartões estão a caminho"}</h2>
              <p>
                {search
                  ? "Experimenta outro nome ou número de sócio."
                  : "Ainda não foram publicados cartões de sócio."}
              </p>
              {search && (
                <button
                  className="members-button"
                  onClick={() => {
                    setSearch("");
                    setPage(0);
                  }}
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          ) : (
            <ul className="members-grid">
              {filtered.slice(currentPage * 12, (currentPage + 1) * 12).map((member) => (
                <li key={member.number}>
                  <Link
                    to="/socios/$number"
                    params={{ number: String(member.number) }}
                    className="members-card-link"
                  >
                    <MemberCard member={member} compact showDetails={false} />
                    <span className="members-open-card">
                      Ver cartão <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <nav className="members-pagination" aria-label="Páginas de sócios">
              <button
                className="members-button"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={18} aria-hidden="true" /> Anterior
              </button>
              <span>
                {currentPage + 1} / {pages}
              </span>
              <button
                className="members-button"
                disabled={currentPage + 1 >= pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Seguinte <ChevronRight size={18} aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </MemberShell>
  );
}
