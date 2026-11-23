# @kvass/widgets

Embeddable widgets as Vue 3 custom elements (`<kvass-contact>`, `<kvass-map>`, `<kvass-flatfinder>` …), one ES module per widget in `dist/`. They run on customer sites, in nuxt-templates, client-admin and server presets, and inside other `@kvass/*` packages. Built with Vite and published to npm by semantic-release.

## How it's used

- No app installs it as a dependency. Pages load a widget by URL, mostly `https://unpkg.com/@kvass/widgets@latest/dist/<widget>.js`. A release reaches every `@latest` user at once, so a breaking change ships to every site.
- A few places pin a version (manager-client's DNB calculator and some server presets). They need a manual bump.
- The server MCP reads `dist/manifest.json` from the latest release to describe the widgets to agents.

## Run and check

- `npm run dev` starts Vite on port 3010. `index.html` is the playground: put the widget's tag and its `src/<widget>/main.js` there.
- `npm run build` builds every widget and the manifest.
- There is no lint, type check or tests.

## Branches and release

- PRs go against `development`. A release is a PR from `development` into `master`. semantic-release publishes every push to `master` (`.github/workflows/semantic-release.yml`, built by `prepublishOnly`): `fix:` gives a patch, `feat:` a minor.
- Conventional Commits with a scope: `fix(contact): send the selected projects (PD-12)`.

## Layout

| Path | What it is |
| --- | --- |
| `widgets.config.js` | Every widget's entry, description and `isInternal`. It drives the build inputs and the manifest |
| `src/<widget>/main.js` | `customElements.define('kvass-<name>', defineCustomElement(Component))` |
| `src/<widget>/components/*.ce.vue` | The widget's components. Some widgets also have `api.js`, types and a README |
| `src/utils/index.js` | `Translate`, `getLanguage`, `getLabel`, formatting helpers |
| `plugins/manifest.js` | Builds `manifest.json`: tag, attributes and CSS variables per widget |
| `i18n/` | Translations from Tolgee (tag `widgets`) |

## Adding or changing a widget

- Add it to `widgets.config.js`. The README's note about editing `vite.config.js` is outdated.
- Keep the exact `customElements.define('kvass-<name>', defineCustomElement(Component))` form in `main.js`. The manifest finds the tag and component with a regex.
- Attributes come from the root component's props, in kebab-case. Data comes in through attributes (`account-url`, `project-id` …), and the widget calls `<account-url>/api/graphql` or integration callbacks itself.
- CSS variables: `--kvass-<widget>-*` are public and listed in the manifest, `--__kvass-*` are private and left out.

## Shadow DOM

- Every `.ce.vue` file's CSS ends up in the component's `styles`. The root component must merge its children's styles in `main.js` (`Form.styles = [...Form.styles, ...Field.styles]`), or the children render unstyled.
- `@kvass/ui` CSS comes in with `@import url('@kvass/ui/style.css')` in the component's style block. Fonts load at document level.

## Pitfalls

- Assets that Vite emits get absolute paths that break on unpkg. Inline them instead.
- `Translate` falls back to `nb`, and `getLanguage` falls back to `en`.

## i18n

- Never hardcode user-facing strings. Use `Translate(key)`, which reads `<html lang>`. Keys are flat camelCase English and need the Tolgee tag `widgets`.
- Sites can override labels through the `labels` or `label-*` attributes (`getLabel`).

## Code style

Prettier from `.prettierrc`: no semicolons, single quotes, width 80, trailing commas, 2 spaces. Don't reformat lines you don't change.

These rules apply to code you write or change for the task. Leave existing code that doesn't match them alone, also in the same file: a style cleanup is a task of its own.

- **Components:** `<script setup lang="ts">`, block order script, template, style.
- **Props, emits and models** as in `@kvass/ui`: destructure the props with the defaults in the destructure, no `withDefaults` and no runtime `defineProps({})`. Use the props directly, and pass a getter to `watch`. Type emits with a call signature, and use `defineModel` for v-model.
- **State:** `ref`, not `reactive`. Handlers and helpers that use props or state are arrow consts.
- **TypeScript:** minimal annotations. No return types and no annotations on inferable values. `type` aliases, no `enum`. No TypeScript in templates.
- **Building blocks:** use `@kvass/ui` before writing your own primitive.
- **SCSS:** `<style lang="scss">`, not `scoped`. One root class named after the component, BEM `&__elem` / `&--mod`, nested at most ~3 levels.
- **Comments:** none by default. When a line truly needs one, one short lowercase line. No commented-out code or leftover `console.log`.
- **Control flow:** early returns on one line, no `else` after a return, a bare `return` instead of `return null`. `Boolean(x)`, not `!!x`. `if (!items.length)`, not `.length === 0`. `||` for fallbacks, `??` only when `false`, `0` or `''` must pass through. `const` by default.
- **Naming:** after the domain. Booleans `is` / `has` / `can` / `show`, handlers `on*`, the error variable `err`.
