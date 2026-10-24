import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import ts from 'typescript'
import { parse, compileScript, registerTS } from '@vue/compiler-sfc'

// props typed with an imported type need typescript and the file system to resolve
registerTS(() => ts)

const FileSystem = {
  fileExists: existsSync,
  readFile: (file) => readFileSync(file, 'utf8'),
}

const isUICSSVariable = (name) => name.startsWith('--k-')
const isPrivateCSSVariable = (name) => name.startsWith('--__')

const toKebabCase = (name) => {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const getElement = (path) => {
  const source = readFileSync(path, 'utf8')
  const [, tag, component] = source.match(
    /customElements\.define\(\s*['"]([^'"]+)['"],\s*defineCustomElement\((\w+)\)/,
  )
  const [, file] = source.match(
    new RegExp(`import ${component} from ['"]([^'"]+)['"]`),
  )
  return { tag, file: resolve(dirname(path), file) }
}

const getAttributes = (file) => {
  const { descriptor } = parse(readFileSync(file, 'utf8'), { filename: file })
  const { bindings } = compileScript(descriptor, { id: file, fs: FileSystem })
  const { __propsAliases: aliases = {}, ...rest } = bindings

  return Object.entries(rest)
    .filter(([, type]) => type.startsWith('props'))
    .map(([name]) => toKebabCase(aliases[name] || name))
}

const getPrivateValues = (source) => {
  const values = {}
  ;[...source.matchAll(/(--[\w-]+)\s*:\s*([^;}"'`]+)/g)]
    .filter(([, name]) => isPrivateCSSVariable(name))
    .forEach(([, name, value]) => {
      if (name in values) return
      values[name] = value.trim().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
    })
  return values
}

// a private variable that is never declared leaves the property unset
const resolvePrivateValues = (value, privateValues) => {
  return value.replace(/var\(\s*(--[\w-]+)\s*\)/g, (match, name) => {
    if (!isPrivateCSSVariable(name)) return match
    if (!(name in privateValues)) return 'unset'
    return resolvePrivateValues(privateValues[name], privateValues)
  })
}

// the default can hold nested var() and calc(), so read up to the matching parenthesis
const getDefault = (source, start) => {
  let depth = 1
  let end = start
  for (; end < source.length && depth; end++) {
    if (source[end] === '(') depth++
    if (source[end] === ')') depth--
  }
  return source.slice(start, end - 1).trim()
}

const getCSSVariables = (source) => {
  const privateValues = getPrivateValues(source)
  const variables = {}

  ;[...source.matchAll(/var\((--[\w-]*)\s*,/g)]
    .filter(([, name]) => !isPrivateCSSVariable(name))
    .forEach((match) => {
      if (match[1] in variables) return
      const value = getDefault(source, match.index + match[0].length)
      variables[match[1]] = resolvePrivateValues(value, privateValues)
    })
  return variables
}

export default function Manifest(widgets) {
  let root

  return {
    name: 'kvass-widgets-manifest',
    configResolved(config) {
      root = config.root
    },
    generateBundle(_, bundle) {
      const entries = Object.entries(widgets).map(
        ([name, { path, description, isInternal }]) => {
          const { tag, file } = getElement(resolve(root, path))
          return {
            name,
            tag,
            description,
            isInternal: Boolean(isInternal),
            attributes: getAttributes(file),
            variables: Object.entries(
              getCSSVariables(bundle[`${name}.js`].code),
            ),
          }
        },
      )

      // most widgets bundle @kvass/ui, so its --k-* variables are listed once
      const manifest = {
        ui: {
          cssVariables: Object.fromEntries(
            entries.flatMap(({ variables }) =>
              variables.filter(([name]) => isUICSSVariable(name)),
            ),
          ),
        },
        widgets: Object.fromEntries(
          entries.map(({ name, variables, ...widget }) => [
            name,
            {
              ...widget,
              hasUiVariables: variables.some(([name]) => isUICSSVariable(name)),
              cssVariables: Object.fromEntries(
                variables.filter(([name]) => !isUICSSVariable(name)),
              ),
            },
          ]),
        ),
      }

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      })
    },
  }
}
