import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Printer } from "lucide-react";
import { MemberShell } from "@/components/members/MemberShell";
import { MemberCard } from "@/components/members/MemberCard";
import { MemberPasswordGate } from "@/components/members/MemberPasswordGate";
import { membersQueryOptions } from "@/lib/members/data";
import { parseNumber } from "@/lib/members/model";

export const Route = createFileRoute("/socios/$number")({
  component: MemberPage,
  head: () => ({
    meta: [
      { title: "Cartão de sócio | Associação 641" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function MemberPage() {
  const params = Route.useParams();
  const number = parseNumber(params.number);
  const query = useQuery({ ...membersQueryOptions, enabled: number !== null });
  const member = query.data?.members.find((item) => item.number === number);
  const [unlockedCheck, setUnlockedCheck] = useState("");
  const accessKey = member?.passwordCheck ? `${member.number}:${member.passwordCheck.hash}` : "";
  const canView = Boolean(accessKey && unlockedCheck === accessKey);
  return (
    <MemberShell>
      <div className="member-single">
        <h1 className="members-sr-only">
          Cartão de sócio{canView && member ? ` de ${member.name}` : ""}
        </h1>
        {!number ? (
          <div className="members-empty">
            <h2>Número de sócio inválido</h2>
            <p>Confirma o endereço do cartão.</p>
          </div>
        ) : query.isPending ? (
          <p role="status">A carregar cartão…</p>
        ) : query.isError ? (
          <div className="members-notice" role="alert">
            Não foi possível carregar o cartão.{" "}
            <button onClick={() => void query.refetch()}>Tentar novamente</button>
          </div>
        ) : !member ? (
          <div className="members-empty">
            <h2>Cartão não encontrado</h2>
            <p>Não existe um cartão publicado com este número.</p>
          </div>
        ) : !member.passwordCheck ? (
          <div className="members-empty">
            <h2>Acesso por configurar</h2>
            <p>Contacta a associação para configurar a palavra-passe deste cartão.</p>
          </div>
        ) : !canView ? (
          <MemberPasswordGate
            key={accessKey}
            number={member.number}
            check={member.passwordCheck}
            onUnlock={() => setUnlockedCheck(accessKey)}
          />
        ) : (
          <>
            <MemberCard member={member} />
            <div className="members-actions">
              <button className="members-button" onClick={() => window.print()}>
                <Printer size={18} aria-hidden="true" /> Imprimir cartão
              </button>
            </div>
          </>
        )}
      </div>
    </MemberShell>
  );
}
