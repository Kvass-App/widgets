import en from '../../i18n/en.json'
import nb from '../../i18n/nb.json'
import fr from '../../i18n/fr.json'
import da from '../../i18n/da.json'
import sv from '../../i18n/sv.json'


import Hash from 'object-hash'
import { VueComponentUpload as upload } from '@kvass/storage'

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
function transformBoolean(value) {
  if (value === 'false') return false
  if (value === 'true') return true
  return value
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

function LoadScript(src, options = { type: 'text/javascript' }) {
  if (!document) return

  if (document.querySelector(`script[src="${src}"]`)) return

  let { type } = options

  let script = document.createElement('script')
  script.type = type
  script.src = src

  document.body.appendChild(script)
}

function Translate(key, plural = 1, options = {}) {

  const messages = { en, nb, fr, da, sv }

  const lang = document.documentElement.getAttribute('lang') || 'nb'
  let value = messages[lang]?.[key] || key

  if (value?.includes('|')) {
    const split = value.split('|')
    value = split[plural - 1]
  }

  if (options instanceof Array) {
    const splitPattern = /\{.*?\}/
    const replaceValues = value.match(splitPattern)


    replaceValues.forEach((i, index) => {
      value = value.replace(i, options[index])
    })
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

function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

function PartialUpdate(result, replacer, options = {}) {
  if (!result) result = {}
  const { strict } = options

  const canWrite = (key, target, value) => {
    if (strict && !(key in target)) return false // Prevent property adding
    if (
      strict &&
      isObject(target[key]) &&
      [null, undefined].includes(value[key])
    )
      return false // Prevent object overrides

    return true
  }

  Object.entries(replacer)
    .filter(([key]) => canWrite(key, result, replacer))
    .forEach(([key, value]) => {
      if (result[key] && isObject(value))
        return (result[key] = PartialUpdate(result[key], value, options))

      return (result[key] = value)
    })

  return result
}

function Diff(a, b, options = {}) {
  if (!b || !isObject(b)) return a

  let { ignoreMissing = false } = options

  let diffs = {}

  let arraysMatch = (a, b) => {
    return a.length === b.length && Hash(a.slice()) === Hash(b.slice())
  }

  let compare = function (previous, current, key) {
    // Get the object type
    let previousType = Object.prototype.toString.call(previous)
    let currentType = Object.prototype.toString.call(current)

    // If items are different types
    if (previousType !== currentType) {
      diffs[key] = current
      return
    }
    // If an object, compare recursively
    if (previousType === '[object Object]') {
      let objDiff = Diff(previous, current, options)
      if (Object.keys(objDiff).length) diffs[key] = objDiff
      return
    }

    // If an array, compare
    if (previousType === '[object Array]') {
      if (!arraysMatch(previous, current)) diffs[key] = current
      return
    }

    // Else if it's a function, convert to a string and compare
    if (previousType === '[object Function]') {
      if (previous.toString() !== current.toString()) diffs[key] = current
      return
    }

    // Otherwise, just compare
    if (previous !== current) diffs[key] = current
  }

  // Loop through the first object
  for (let key in a) {
    if (Object.hasOwn(a, key)) compare(a[key], b[key], key)
  }

  if (!ignoreMissing) {
    for (let key in b) {
      if (Object.hasOwn(b, key) && !(key in a)) diffs[key] = b[key]
    }
  }

  // Return the object of differences
  return diffs
}

function hasDiff(...args) {
  return Boolean(Object.keys(Diff(...args)).length)
}

const Clone = function () {
  return JSON.parse(JSON.stringify.apply(this, arguments))
}

function uploadFunction(rawFile, onProgress, options) {
  return upload(rawFile, onProgress, options)
}

function toCurrency(
  value,
  locale = document.documentElement.getAttribute('lang') || 'nb',
) {
  if (!value && value !== 0) return '-'
  return value.toLocaleString(locale, {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
  })
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

function Debounce(fn, wait = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}

function Slugify(str) {
  if (!str) return
  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
  const to = 'aaaaeeeeiiiioooouuuunc------'
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes

  return str
}
export {
  ExtractString,
  Wait,
  WaitUntil,
  LoadScript,
  Translate,
  PropEnumValidator,
  Diff,
  PartialUpdate,
  Clone,
  uploadFunction,
  toCurrency,
  hasDiff,
  getLabel,
  format,
  getCurrencyInputProps,
  transformBoolean,
  Debounce,
  Slugify,
}
