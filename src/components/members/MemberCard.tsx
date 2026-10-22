import { BadgeCheck, CircleHelp, Clock3, ShieldCheck } from "lucide-react";
import logoWhite from "@/assets/641-logo-white.png";
import drummer from "@/assets/member-drummer.png";
import {
  DUES_LABELS,
  formatDate,
  formatNumber,
  validityExpired,
  type Member,
} from "@/lib/members/model";

export function MemberCard({
  member,
  compact = false,
  showDetails = true,
}: {
  member: Member;
  compact?: boolean;
  showDetails?: boolean;
}) {
  const StatusIcon =
    member.duesStatus === "paid"
      ? BadgeCheck
      : member.duesStatus === "unpaid"
        ? Clock3
        : member.duesStatus === "exempt"
          ? ShieldCheck
          : CircleHelp;
  const expired = validityExpired(member.validUntil);
  return (
    <article
      className={`member-card${compact ? " member-card-compact" : ""}`}
      aria-label={`Cartão de sócio ${member.number}`}
    >
      <header className="member-card-header">
        <img src={logoWhite} alt="641" />
        <span>
          Associação 641
          <br />
          <b>Cartão de sócio</b>
        </span>
      </header>
      <div className="member-card-identity">
        <div className="member-card-number">
          <span>Sócio n.º</span>
          <strong>{formatNumber(member.number)}</strong>
        </div>
        <div className="member-card-name">
          <span>Nome</span>
          <h2>{member.name}</h2>
        </div>
      </div>
      <img
        className="member-card-instruments"
        src={drummer}
        alt=""
        aria-hidden="true"
        width={523}
        height={420}
      />
      {showDetails && (
        <dl className="member-card-details">
          <div>
            <dt>Quotas</dt>
            <dd className={`member-dues member-dues-${member.duesStatus}`}>
              <StatusIcon size={19} aria-hidden="true" />
              {DUES_LABELS[member.duesStatus]}
            </dd>
          </div>
          <div>
            <dt>Validade</dt>
            <dd>
              {member.validUntil ? (
                <time dateTime={member.validUntil}>{formatDate(member.validUntil)}</time>
              ) : (
                "Por confirmar"
              )}
              {expired && <span className="member-expired">Terminada</span>}
            </dd>
          </div>
        </dl>
      )}
      <footer className="member-card-footer">
        <span>Oeiras, Portugal</span>
        <span>641.pt</span>
      </footer>
      <span className="member-card-tape" aria-hidden="true" />
    </article>
  );
}
