// SHA-256 av tilgangskoden. Bytt med: printf %s 'ny-kode' | shasum -a 256
export const accessHash =
  '4e54d3e67aefabcf1d05ac55981d7d9e303b4feddc42e0b5d6956ea714d87c52'
const storageKey = 'kvass-calculator-access'

export async function hashCode(code) {
  const bytes = new TextEncoder().encode(code.trim())
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
export async function checkCode(code, hash = accessHash) {
  return (await hashCode(code)) === hash
}
// Lagrer hashen, så en ny kode låser ute nettlesere som brukte den gamle.
export function hasAccess() {
  try {
    return localStorage.getItem(storageKey) === accessHash
  } catch {
    return false
  }
}
export function rememberAccess() {
  try {
    localStorage.setItem(storageKey, accessHash)
  } catch {}
}
