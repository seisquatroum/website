import { Link, createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getOpenCallRegulamento } from "@/content/opencall/loadRegulamento";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/opencall/regulamento")({
  component: RegulamentoPage,
  head: () => {
    const { title } = getOpenCallRegulamento();
    return {
      meta: [
        { title: `${title} — Associação 641` },
        {
          name: "description",
          content:
            "Regulamento do Open Call de Bandas Residentes da Associação 641.",
        },
      ],
    };
  },
});

function RegulamentoPage() {
  const { locale } = useI18n();
  const { title, markdown } = getOpenCallRegulamento();

  return (
    <div className="regulamento-page min-h-screen bg-zine-dark text-brand-pink">
      <header className="regulamento-page-header">
        <Link
          to="/$section"
          params={{ section: "opencall" }}
          className="regulamento-back"
        >
          {locale === "pt" ? "← voltar ao open call" : "← back to open call"}
        </Link>
        <p className="regulamento-kicker">Associação 641</p>
      </header>
      <article className="regulamento-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="regulamento-h1">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="regulamento-h2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="regulamento-h3">{children}</h3>
            ),
            p: ({ children }) => <p className="regulamento-p">{children}</p>,
            a: ({ href, children }) => (
              <a
                href={href}
                className="regulamento-a"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                  href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="regulamento-ul">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="regulamento-ol">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="regulamento-li">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="regulamento-blockquote">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="regulamento-table-wrap">
                <table className="regulamento-table">{children}</table>
              </div>
            ),
            strong: ({ children }) => (
              <strong className="regulamento-strong">{children}</strong>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
        <p className="regulamento-footnote" aria-hidden>
          {title}
        </p>
      </article>
    </div>
  );
}
