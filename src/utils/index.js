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

function PropEnumValidator(enums) {
  return {
    validator(value, props) {
      if (enums instanceof Array)
        return value instanceof Array
          ? value.every((v) => enums.includes(v))
          : enums.includes(value)
      return enums(value, props)
    },
  }
}

const parse = (v) => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch (err) {
    return {}
  }
}

const getLabel =
  (v = {}, d = {}) =>
  (key) =>
    parse(v)[key] || d[key] || key

const format =
  (type, options = {}) =>
  (value) => {
    switch (type) {
      case 'currency':
        const { locale, ...rest } = options
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          maximumFractionDigits: 0,
          ...rest,
        }).format(value)
      case 'number':
        return new Intl.NumberFormat(options.locale).format(value)
      case 'year':
      case 'years':
        return [
          value,
          new Intl.RelativeTimeFormat(options.locale)
            .formatToParts(value, 'year')
            .at(-1).value,
        ].join(' ')
      case 'percent':
        const { maximumFractionDigits = 0 } = options
        return [Number(value).toFixed(maximumFractionDigits), '%'].join('')
      default:
        return value
    }
  }

const getCurrencyInputProps = (options = {}) => {
  const { locale, currency } = options

  const mapperRE = /(.{1})\d{3}(\D)\d$/
  const formattedValue = format('number', { locale })(1000.1)

  let [_, thousand, decimal] = mapperRE.exec(formattedValue)

  const data = format('currency', { locale, currency })(1000.1)
  const symbol = data.replace(/[\d\s\,\.]/g, '')
  const mask = { mask: Number, thousandsSeparator: thousand }

  if (data.match(/^\d/)) return { suffix: symbol, mask }
  return { symbol, mask }
}

export {
  ExtractString,
  Wait,
  WaitUntil,
  LoadScript,
  Translate,
  PropEnumValidator,
  getLabel,
  format,
  getCurrencyInputProps,
}
