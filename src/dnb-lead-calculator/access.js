// SHA-256 av tilgangskoden. Bytt med: printf %s 'ny-kode' | shasum -a 256
export const accessHash =
  'd771976f4e376cc741317f2d119390f790980330e2363af74939c27c751cb84d'
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
