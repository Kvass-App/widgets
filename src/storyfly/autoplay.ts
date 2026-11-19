type Candidate = { host: Element; play: () => void }

const candidates: Candidate[] = []
let isDecided = false

function byDocumentOrder(a: Candidate, b: Candidate) {
  return a.host.compareDocumentPosition(b.host) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1
}

export function requestAutoplay(element: Element, play: () => void) {
  if (isDecided) return

  const root = element.getRootNode()
  const host = root instanceof ShadowRoot ? root.host : element
  candidates.push({ host, play })
  if (candidates.length > 1) return

  setTimeout(() => {
    isDecided = true
    candidates
      .filter(({ host }) => host.isConnected)
      .sort(byDocumentOrder)[0]
      ?.play()
  })
}
