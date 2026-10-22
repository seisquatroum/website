export type PasswordCheck = {
  algorithm: "PBKDF2-SHA256";
  iterations: 600000;
  salt: string;
  hash: string;
};

const ITERATIONS = 600000;
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export function isPasswordCheck(value: unknown): value is PasswordCheck {
  if (!value || typeof value !== "object") return false;
  const check = value as Record<string, unknown>;
  return (
    Object.keys(check).length === 4 &&
    check.algorithm === "PBKDF2-SHA256" &&
    check.iterations === ITERATIONS &&
    typeof check.salt === "string" &&
    /^[a-f0-9]{32}$/.test(check.salt) &&
    typeof check.hash === "string" &&
    /^[a-f0-9]{64}$/.test(check.hash)
  );
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    material,
    256,
  );
  return hex(new Uint8Array(bits));
}

export async function createPasswordCheck(password: string): Promise<PasswordCheck> {
  if (!password.trim() || password.length > 256)
    throw new Error("Indica uma palavra-passe com até 256 caracteres.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    algorithm: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: hex(salt),
    hash: await derive(password, salt),
  };
}

export async function verifyMemberPassword(password: string, check: PasswordCheck) {
  if (!isPasswordCheck(check) || !password || password.length > 256) return false;
  const salt = new Uint8Array(check.salt.match(/../g)!.map((byte) => Number.parseInt(byte, 16)));
  const computed = await derive(password, salt);
  let difference = 0;
  for (let index = 0; index < computed.length; index++)
    difference |= computed.charCodeAt(index) ^ check.hash.charCodeAt(index);
  return difference === 0;
}
