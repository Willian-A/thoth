// O navegador pode recusar o localStorage (aba anônima, dados bloqueados); nesse caso seguimos sem guardar.

const hostKeyKey = (slug: string) => `thoth:host-key:${slug}`;
const LAST_NAME_KEY = "thoth:last-name";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento, quem criou a sala só perde a marca de criador ao recarregar.
  }
}

export const storage = {
  getHostKey: (slug: string) => read(hostKeyKey(slug)) ?? undefined,
  saveHostKey: (slug: string, hostKey: string) => write(hostKeyKey(slug), hostKey),
  getLastName: () => read(LAST_NAME_KEY) ?? "",
  saveLastName: (name: string) => write(LAST_NAME_KEY, name),
};
