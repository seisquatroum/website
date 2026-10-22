import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { MemberShell } from "./MemberShell";
import { MemberCard } from "./MemberCard";
import { membersQueryOptions } from "@/lib/members/data";
import {
  createMemberFile,
  DUES_LABELS,
  formatDate,
  MAX_MEMBERS,
  type Member,
} from "@/lib/members/model";
import {
  assignMissingNumbers,
  addPasswordChecks,
  inferMapping,
  makeDrafts,
  readSpreadsheet,
  validateDrafts,
  type ColumnMapping,
  type Spreadsheet,
} from "@/lib/members/import";

function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PreparationPage() {
  const current = useQuery(membersQueryOptions);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [sheets, setSheets] = useState<Spreadsheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [filename, setFilename] = useState("");
  const [mapping, setMapping] = useState<ColumnMapping>({
    number: "",
    name: "",
    status: "",
    validity: "",
    password: "",
  });
  const [numbers, setNumbers] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const sheet = sheets[sheetIndex];
  const mappedColumns = Object.values(mapping).filter((column) => column !== "");
  const mappingReady =
    mapping.name !== "" &&
    mapping.status !== "" &&
    mapping.password !== "" &&
    new Set(mappedColumns).size === mappedColumns.length;
  const drafts = useMemo(
    () =>
      sheet
        ? makeDrafts(sheet, mapping).map((draft) => ({
            ...draft,
            number: numbers[draft.row] ?? draft.number,
          }))
        : [],
    [sheet, mapping, numbers],
  );
  const validation = useMemo(() => validateDrafts(drafts, { requirePasswords: true }), [drafts]);
  const existing = current.data?.members ?? [];
  const preview =
    validation.members.find((member) => member.number === selectedNumber) ?? validation.members[0];
  const existingByNumber = new Map(existing.map((member) => [member.number, member]));
  const added = validation.members.filter((member) => !existingByNumber.has(member.number)).length;
  const updated = validation.members.filter((member) => {
    const old = existingByNumber.get(member.number);
    return (
      old &&
      (old.name !== member.name ||
        old.duesStatus !== member.duesStatus ||
        old.validUntil !== member.validUntil)
    );
  }).length;
  const renamed = validation.members.filter(
    (member) =>
      existingByNumber.has(member.number) &&
      existingByNumber.get(member.number)!.name !== member.name,
  );
  const totalMembers = new Set([
    ...existing.map((member) => member.number),
    ...validation.members.map((member) => member.number),
  ]).size;
  const ready =
    current.isSuccess && mappingReady && !validation.errors.length && totalMembers <= MAX_MEMBERS;

  async function chooseFile(file: File) {
    setBusy(true);
    setError("");
    setFeedback("");
    setSheets([]);
    setConfirmed(false);
    setNumbers({});
    try {
      const parsed = await readSpreadsheet(file);
      setSheets(parsed);
      setSheetIndex(0);
      setFilename(file.name);
      setMapping(inferMapping(parsed[0].headers));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível abrir o ficheiro.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function changeMapping(key: keyof ColumnMapping, value: string) {
    setMapping({ ...mapping, [key]: value });
    setNumbers({});
    setConfirmed(false);
    setFeedback("");
  }

  async function exportJson() {
    if (!ready || !confirmed || exporting) return;
    setExporting(true);
    setError("");
    setFeedback("");
    try {
      const members = await addPasswordChecks(validation.members, drafts);
      const output = createMemberFile(members, existing);
      download(
        `${JSON.stringify(output, null, 2)}\n`,
        "socios.json",
        "application/json;charset=utf-8",
      );
      setFeedback(
        "Ficheiro gerado com os verificadores de Pass. A publicação do site ainda não foi alterada.",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível gerar o ficheiro. Tenta novamente.",
      );
    } finally {
      setExporting(false);
    }
  }

  function exportNumberedList(members: Member[]) {
    const quote = (value: string) =>
      `"${(/^[=+@\-\t\r\n]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const rows = [
      ["Número de sócio", "Nome Completo", "Estado Quotas", "Validade"],
      ...members.map((member) => [
        String(member.number),
        member.name,
        DUES_LABELS[member.duesStatus],
        member.validUntil ? formatDate(member.validUntil) : "",
      ]),
    ];
    download(
      `\uFEFF${rows.map((row) => row.map(quote).join(";")).join("\r\n")}`,
      "socios-numerados.csv",
      "text/csv;charset=utf-8",
    );
  }

  return (
    <MemberShell preparation>
      <div className="members-page-heading">
        <h1 className="members-management-title">Preparar cartões</h1>
        <p>Importação local. A publicação é feita pelo repositório.</p>
      </div>
      <fieldset className="members-preparation-fields" disabled={exporting}>
        <section className="members-preparation-section" aria-labelledby="upload-title">
          <div className="members-step-title">
            <span>1</span>
            <h2 id="upload-title">Escolher o Excel</h2>
          </div>
          <div className="members-upload">
            <FileSpreadsheet size={34} aria-hidden="true" />
            <div>
              <p>{filename || "Inscrições e quotas dos sócios"}</p>
              <span>Excel ou CSV, até 5 MB. O ficheiro é lido neste navegador.</span>
            </div>
            <label
              className={`members-button members-button-primary${busy || !mounted ? " is-disabled" : ""}`}
            >
              <Upload size={18} aria-hidden="true" />
              {busy ? "A ler…" : filename ? "Trocar ficheiro" : "Escolher ficheiro"}
              <input
                ref={inputRef}
                className="members-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={busy || !mounted}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void chooseFile(file);
                }}
              />
            </label>
          </div>
          {busy && <p role="status">A ler e validar o ficheiro…</p>}
          {error && (
            <p className="members-notice" role="alert">
              {error}
            </p>
          )}
          {sheet && (
            <>
              <div className="members-column-grid">
                <label>
                  Folha
                  <select
                    value={sheetIndex}
                    onChange={(event) => {
                      const index = Number(event.target.value);
                      setSheetIndex(index);
                      setMapping(inferMapping(sheets[index].headers));
                      setNumbers({});
                      setConfirmed(false);
                      setFeedback("");
                    }}
                  >
                    {sheets.map((item, index) => (
                      <option key={index} value={index}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                {(
                  [
                    ["number", "Número de sócio"],
                    ["name", "Nome"],
                    ["status", "Estado das quotas"],
                    ["validity", "Validade"],
                    ["password", "Pass"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <select
                      value={mapping[key]}
                      onChange={(event) => changeMapping(key, event.target.value)}
                    >
                      <option value="">
                        {key === "number"
                          ? "Atribuir na revisão"
                          : key === "validity"
                            ? "Sem validade"
                            : "Escolher coluna"}
                      </option>
                      {sheet.headers.map((header, index) => (
                        <option key={index} value={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              {!mappingReady && (
                <p className="members-notice">
                  Escolhe as colunas de nome, quotas e Pass. Cada campo deve usar uma coluna
                  diferente.
                </p>
              )}
              <p className="members-privacy">
                A Pass é usada para gerar um verificador; não é publicada em texto simples.
                Contactos, moradas, nascimento e comprovativos ficam de fora.
              </p>
              <p className="members-privacy">
                Esta comparação no navegador é apenas uma barreira visual. Os dados dos cartões
                continuam legíveis no ficheiro publicado.
              </p>
            </>
          )}
        </section>
        {sheet && mappingReady && (
          <>
            <section className="members-preparation-section" aria-labelledby="review-title">
              <div className="members-step-title">
                <span>2</span>
                <h2 id="review-title">Rever os cartões</h2>
              </div>
              {current.isError && (
                <div className="members-notice" role="alert">
                  Não foi possível ler a lista publicada.{" "}
                  <button onClick={() => void current.refetch()}>Tentar novamente</button>
                </div>
              )}
              {drafts.some((draft) => !draft.number) && (
                <div className="members-number-notice">
                  <p>
                    Há inscrições sem número. Podes preenchê-los na tabela ou atribuir os próximos
                    números disponíveis. Mantém estes números nas próximas importações.
                  </p>
                  <button
                    className="members-button"
                    disabled={!current.isSuccess}
                    onClick={() => {
                      const assigned = assignMissingNumbers(drafts, existing);
                      setNumbers(
                        Object.fromEntries(assigned.map((draft) => [draft.row, draft.number])),
                      );
                      setConfirmed(false);
                      setFeedback("");
                    }}
                  >
                    Atribuir números em falta
                  </button>
                </div>
              )}
              {!!validation.errors.length && (
                <div className="members-notice" role="alert">
                  <strong>
                    {validation.errors.length}{" "}
                    {validation.errors.length === 1
                      ? "linha precisa de revisão"
                      : "linhas precisam de revisão"}
                  </strong>
                  <ul>
                    {validation.errors.slice(0, 8).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                  {validation.errors.length > 8 && (
                    <p>Corrige também as restantes linhas no ficheiro original.</p>
                  )}
                </div>
              )}
              {renamed.length > 0 && (
                <div className="members-notice">
                  O nome vai mudar em {renamed.length}{" "}
                  {renamed.length === 1 ? "cartão existente" : "cartões existentes"}. Confirma que
                  os números continuam a pertencer às mesmas pessoas.
                </div>
              )}
              <div className="members-review-layout">
                <div
                  className="members-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Revisão dos dados públicos"
                >
                  <table className="members-review-table">
                    <thead>
                      <tr>
                        <th>N.º</th>
                        <th>Nome</th>
                        <th>Quotas</th>
                        <th>Validade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.slice(0, 100).map((draft) => (
                        <tr key={draft.row}>
                          <td>
                            <input
                              aria-label={`Número de sócio, linha ${draft.row}`}
                              inputMode="numeric"
                              value={draft.number}
                              onChange={(event) => {
                                setNumbers({ ...numbers, [draft.row]: event.target.value });
                                setConfirmed(false);
                                setFeedback("");
                              }}
                            />
                          </td>
                          <td>{draft.name || "Sem nome"}</td>
                          <td>{String(draft.status ?? "") || "Por confirmar"}</td>
                          <td>
                            {draft.validity instanceof Date
                              ? new Intl.DateTimeFormat("pt-PT").format(draft.validity)
                              : String(draft.validity ?? "") || "Por confirmar"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {drafts.length > 100 && (
                    <p>
                      A mostrar as primeiras 100 linhas. Todas as {drafts.length} linhas são
                      validadas; para editar os restantes números usa uma coluna no Excel.
                    </p>
                  )}
                </div>
                <div className="members-preview">
                  <label>
                    Pré-visualização
                    <select
                      value={preview?.number ?? ""}
                      onChange={(event) => setSelectedNumber(Number(event.target.value))}
                    >
                      {!preview && <option value="">Aguarda um número válido</option>}
                      {validation.members.map((member) => (
                        <option key={member.number} value={member.number}>
                          {member.number} — {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {preview && <MemberCard member={preview} compact />}
                </div>
              </div>
            </section>
            <section className="members-preparation-section" aria-labelledby="export-title">
              <div className="members-step-title">
                <span>3</span>
                <h2 id="export-title">Gerar a publicação</h2>
              </div>
              <p>
                {added} novos · {updated} alterados · {validation.members.length - added - updated}{" "}
                sem alterações. Os sócios já publicados que não estejam neste ficheiro serão
                conservados. As Pass dos sócios importados serão atualizadas a partir do Excel.
              </p>
              {totalMembers > MAX_MEMBERS && (
                <p role="alert" className="members-notice">
                  A lista final excede o limite de {MAX_MEMBERS} sócios.
                </p>
              )}
              <label className="members-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  disabled={!ready}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                Confirmei os números e os dados que ficarão visíveis nos cartões públicos.
              </label>
              <div className="members-actions">
                <button
                  className="members-button members-button-primary"
                  disabled={!ready || !confirmed}
                  onClick={() => void exportJson()}
                >
                  <Download size={18} aria-hidden="true" />{" "}
                  {exporting ? "A preparar…" : "Gerar socios.json"}
                </button>
                <button
                  className="members-button"
                  disabled={!ready}
                  onClick={() =>
                    exportNumberedList(createMemberFile(validation.members, existing).members)
                  }
                >
                  <Download size={18} aria-hidden="true" /> Lista numerada CSV
                </button>
                <button
                  className="members-button"
                  onClick={() => {
                    setSheets([]);
                    setFilename("");
                    setNumbers({});
                    setConfirmed(false);
                    setFeedback("");
                    setError("");
                  }}
                >
                  <X size={18} aria-hidden="true" /> Limpar
                </button>
              </div>
              <p className="members-feedback" role="status">
                {exporting ? "A preparar os verificadores das palavras-passe…" : feedback}
              </p>
              <p className="members-privacy">
                A lista numerada CSV não inclui Pass. Mantém essa coluna no Excel para as próximas
                importações.
              </p>
              <details className="members-publish-help">
                <summary>Como publicar no site</summary>
                <ol>
                  <li>
                    No repositório do GitHub, abre a pasta <code>public</code>.
                  </li>
                  <li>
                    Substitui <code>socios.json</code> pelo ficheiro gerado e confirma a alteração
                    na branch <code>main</code>.
                  </li>
                  <li>
                    Aguarda a conclusão da publicação em Actions. Os cartões ficarão disponíveis em{" "}
                    <code>/socios</code> e <code>/socios/1</code>.
                  </li>
                </ol>
                <p>
                  É necessário ter permissão para alterar o repositório. O Excel original não deve
                  ser enviado para o GitHub.
                </p>
              </details>
            </section>
          </>
        )}
      </fieldset>
    </MemberShell>
  );
}
