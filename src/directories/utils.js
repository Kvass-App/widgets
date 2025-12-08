export const getFileUrl = (file, proxy) => {
  if (!file?.url) return

  const url = new URL(proxy || file.url, window.location.origin)
  if (proxy) url.searchParams.append('target', file.url)

  return url
}
