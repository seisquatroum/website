import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createMemberFile,
  parseMemberFile,
  parseValidity,
  validityExpired,
} from "../src/lib/members/model.ts";
import {
  assignMissingNumbers,
  inferMapping,
  makeDrafts,
  readSpreadsheet,
  addPasswordChecks,
  validateDrafts,
} from "../src/lib/members/import.ts";
import { createPasswordCheck, verifyMemberPassword } from "../src/lib/members/password.ts";

const member = { number: 1, name: "Sócio de teste", duesStatus: "paid", validUntil: "2027-01-01" };
const headers = ["Carimbo de data/hora", "Nome Completo", "Email", "Estado Quotas", "Validade"];

test("reconhece o formato de inscrições sem inventar um número", () => {
  const mapping = inferMapping(headers);
  assert.deepEqual(mapping, { number: "", name: "1", status: "3", validity: "4", password: "" });
  const drafts = makeDrafts(
    {
      name: "Respostas",
      headers,
      rows: [
        ["2026-01-01", "Sócio de teste", "privado@example.test", "Pago", new Date(2027, 0, 1)],
      ],
    },
    mapping,
  );
  assert.equal(drafts[0].number, "");
  assert.ok(validateDrafts(drafts).errors[0].includes("número"));
  const validation = validateDrafts(assignMissingNumbers(drafts, []));
  assert.equal(validation.errors.length, 0);
  assert.deepEqual(validation.members, [member]);
  assert.ok(!JSON.stringify(createMemberFile(validation.members)).includes("privado"));
});

test("números mantêm-se com linhas reordenadas e os novos seguem a lista existente", () => {
  const drafts = [
    { row: 2, number: "", name: "Novo sócio", status: "Pago", validity: "" },
    { row: 3, number: "", name: member.name, status: "Pago", validity: "" },
  ];
  const assigned = assignMissingNumbers(drafts, [
    member,
    { ...member, number: 8, name: "Outro sócio" },
  ]);
  assert.deepEqual(
    assigned.map((row) => row.number),
    ["9", "1"],
  );
  const ambiguous = assignMissingNumbers([drafts[1]], [member, { ...member, number: 7 }]);
  assert.equal(ambiguous[0].number, "");
});

test("rejeita duplicados, estados desconhecidos, números fracionários e datas impossíveis", () => {
  const draft = { row: 2, number: "1", name: "Teste", status: "Pago", validity: "31/02/2027" };
  assert.match(validateDrafts([draft]).errors[0], /validade inválida/);
  assert.match(
    validateDrafts([{ ...draft, validity: "", status: "talvez" }]).errors[0],
    /desconhecido/,
  );
  assert.match(validateDrafts([{ ...draft, validity: "", number: "1.5" }]).errors[0], /número/);
  assert.match(
    validateDrafts([
      { ...draft, validity: "" },
      { ...draft, row: 3, validity: "" },
    ]).errors[0],
    /repetido/,
  );
});

test("validade preserva dias portugueses, números Excel e o último dia válido", () => {
  assert.equal(parseValidity("01/02/2027"), "2027-02-01");
  assert.equal(parseValidity("2027-01-01"), "2027-01-01");
  assert.equal(parseValidity(46388), "2027-01-01");
  assert.equal(parseValidity("31/04/2027"), undefined);
  assert.equal(parseValidity(""), null);
  assert.equal(validityExpired("2027-01-01", new Date("2027-01-01T20:00:00Z")), false);
  assert.equal(validityExpired("2027-01-01", new Date("2027-01-02T01:00:00Z")), true);
});

test("a publicação conserva ausentes e exporta apenas campos públicos", () => {
  const old = { ...member, number: 2, name: "Ausente da importação" };
  const output = createMemberFile(
    [{ ...member, duesStatus: "unpaid", email: "segredo@example.test" }],
    [member, old],
  );
  assert.equal(output.members.length, 2);
  assert.equal(output.members[0].duesStatus, "unpaid");
  assert.equal(output.members[1].name, old.name);
  assert.ok(!JSON.stringify(output).includes("email"));
  assert.throws(() => parseMemberFile({ ...output, internal: "privado" }), /não públicos/);
  assert.throws(
    () => parseMemberFile({ ...output, members: [{ ...member, email: "privado" }] }),
    /não públicos/,
  );
  assert.throws(() => parseMemberFile({ ...output, members: [member, member] }), /repetido/);
});

test("lê CSV numerado com acentos e descarta colunas privadas", async () => {
  const csv =
    "\uFEFFNúmero de sócio;Nome Completo;Email;Estado Quotas;Validade\r\n7;José Teste;privado@example.test;Pago;01/02/2027";
  const sheets = await readSpreadsheet(new File([csv], "socios.csv"));
  const drafts = makeDrafts(sheets[0], inferMapping(sheets[0].headers));
  const result = validateDrafts(drafts);
  assert.deepEqual(result.errors, []);
  assert.equal(result.members[0].name, "José Teste");
  assert.equal(result.members[0].validUntil, "2027-02-01");
  assert.ok(!JSON.stringify(result.members).includes("privado"));
});

test("rejeita formatos e tamanhos inválidos antes de ler", async () => {
  await assert.rejects(readSpreadsheet(new File(["x"], "inscricoes.exe")), /Escolhe/);
  await assert.rejects(
    readSpreadsheet(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "inscricoes.xlsx")),
    /5 MB/,
  );
});

test("reconhece Pass e bloqueia exportação quando falta uma palavra-passe", () => {
  const mapping = inferMapping([
    "Número de sócio",
    "Nome Completo",
    "Estado Quotas",
    "Validade",
    "Pass",
  ]);
  assert.equal(mapping.password, "4");
  const drafts = makeDrafts(
    {
      name: "Sócios",
      headers: ["Número de sócio", "Nome Completo", "Estado Quotas", "Validade", "Pass"],
      rows: [[1, "Teste", "Pago", "", ""]],
    },
    mapping,
  );
  assert.match(validateDrafts(drafts, { requirePasswords: true }).errors[0], /Pass/);
  assert.equal(
    validateDrafts([{ ...drafts[0], password: 123 }], { requirePasswords: true }).errors.length,
    0,
  );
});

test("lê a coluna Pass num CSV UTF-8 sem BOM", async () => {
  const csv = "Número de sócio;Nome Completo;Estado Quotas;Validade;Pass\n3;José Teste;Pago;01/02/2027;Passe-teste";
  const sheet = (await readSpreadsheet(new File([csv], "socios.csv")))[0];
  const drafts = makeDrafts(sheet, inferMapping(sheet.headers));
  assert.equal(drafts[0].number, "3");
  assert.equal(drafts[0].password, "Passe-teste");
  assert.equal(validateDrafts(drafts, { requirePasswords: true }).errors.length, 0);
});

test("compara a palavra-passe exata e publica apenas um verificador com salt", async () => {
  const secret = "Teste-641-secreto";
  const check = await createPasswordCheck(secret);
  const another = await createPasswordCheck(secret);
  assert.notEqual(check.salt, another.salt);
  assert.notEqual(check.hash, another.hash);
  assert.equal(await verifyMemberPassword(secret, check), true);
  assert.equal(await verifyMemberPassword("errada", check), false);
  assert.equal(await verifyMemberPassword(secret.toLowerCase(), check), false);
  assert.equal(await verifyMemberPassword(secret + " ", check), false);
  assert.equal(await verifyMemberPassword("", check), false);
  assert.equal(await verifyMemberPassword(secret, { ...check, iterations: 1 }), false);
  const file = createMemberFile([{ ...member, passwordCheck: check }]);
  assert.deepEqual(parseMemberFile(file).members[0].passwordCheck, check);
  assert.ok(!JSON.stringify(file).includes(secret));
  assert.throws(
    () => parseMemberFile({ ...file, members: [{ ...member, password: secret }] }),
    /não públicos/,
  );
});

test("importa Pass numérica e mantém o verificador numa atualização e nos sócios ausentes", async () => {
  const drafts = [
    { row: 2, number: "1", name: member.name, status: "Pago", validity: "", password: 1234 },
  ];
  const protectedMembers = await addPasswordChecks([member], drafts);
  assert.equal(await verifyMemberPassword("1234", protectedMembers[0].passwordCheck), true);
  assert.equal(await verifyMemberPassword("01234", protectedMembers[0].passwordCheck), false);
  const other = { ...member, number: 2, name: "Outro" };
  const file = createMemberFile([other], protectedMembers);
  assert.deepEqual(file.members[0].passwordCheck, protectedMembers[0].passwordCheck);
  assert.equal(file.members[1].passwordCheck, undefined);
});
