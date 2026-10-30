// Sender forespørselen til manager, som registrerer leadet i HubSpot og sender e-post.
export async function submitRequest(endpoint, request) {
  if (!endpoint) throw new Error('Mangler endpoint')
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'dnb', ...request }),
  })
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`)
    error.status = res.status
    throw error
  }
}
