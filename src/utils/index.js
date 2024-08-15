import en from '../../i18n/en.json'
import nb from '../../i18n/nb.json'

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

function Translate(key, plural = 1) {
  const messages = { en, nb }

  const lang = document.documentElement.getAttribute('lang') || 'nb'
  let value = messages[lang]?.[key] || key

  if (value.includes('|')) {
    const split = value.split('|')
    value = split[plural - 1]
  }
  return value
}

export { ExtractString, Wait, WaitUntil, LoadScript, Translate }
