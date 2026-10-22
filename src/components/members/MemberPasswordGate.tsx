import { useId, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatNumber } from "@/lib/members/model";
import { verifyMemberPassword, type PasswordCheck } from "@/lib/members/password";

export function MemberPasswordGate({
  number,
  check,
  onUnlock,
}: {
  number: number;
  check: PasswordCheck;
  onUnlock: () => void;
}) {
  const id = useId();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (await verifyMemberPassword(password, check)) {
        setPassword("");
        onUnlock();
      } else {
        setError("Palavra-passe incorreta. Tenta novamente.");
      }
    } catch {
      setError("Não foi possível verificar a palavra-passe. Tenta novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="member-password-form"
      onSubmit={(event) => void submit(event)}
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`}>Cartão de sócio {formatNumber(number)}</h2>
      <label htmlFor={`${id}-password`}>Palavra-passe</label>
      <div className="member-password-input">
        <input
          id={`${id}-password`}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          maxLength={256}
          required
          disabled={busy}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
        />
        <button
          type="button"
          disabled={busy}
          aria-label={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          title={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
      <p id={`${id}-error`} className="member-password-error" role="alert">
        {error}
      </p>
      <button
        type="submit"
        className="members-button members-button-primary"
        disabled={busy || !password}
      >
        {busy ? "A verificar…" : "Ver cartão"}
      </button>
      <p className="members-privacy">Se não souberes a palavra-passe, contacta a Associação 641.</p>
    </form>
  );
}
