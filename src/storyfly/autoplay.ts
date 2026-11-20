type Candidate = { host: Element; play: () => void }

const candidates: Candidate[] = []
let decidedPath: string | null = null

function byDocumentOrder(a: Candidate, b: Candidate) {
  return a.host.compareDocumentPosition(b.host) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1
}

export function requestAutoplay(element: Element, play: () => void) {
  if (decidedPath === location.pathname) return

  const root = element.getRootNode()
  const host = root instanceof ShadowRoot ? root.host : element
  candidates.push({ host, play })
  if (candidates.length > 1) return

  setTimeout(() => {
    decidedPath = location.pathname
    const first = candidates
      .filter(({ host }) => host.isConnected)
      .sort(byDocumentOrder)[0]
    candidates.length = 0
    first?.play()
  })
}
