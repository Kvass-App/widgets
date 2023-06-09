function ExtractString(str, pattern, options = {}) {
  let { group = 1 } = options
  let match = str.match(pattern)
  if (!match) return
  return match[group]
}

function Wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

async function WaitUntil(func, options = {}) {
  let { interval = 200, limit = 50 } = options

  let count = 0
  let result

  while (count < limit) {
    count++
    if ((result = func())) break
    await Wait(interval)
  }

  if (count >= limit) throw new Error('Could not resolve')
  return result
}

function LoadScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return

  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src

  document.body.appendChild(script)
}

export { ExtractString, Wait, WaitUntil, LoadScript }
