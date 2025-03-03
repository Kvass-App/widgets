import { defineCustomElement } from 'vue'
import Finn from './views/Finn.ce.vue'
import Dashboard from './views/Dashboard.ce.vue'
import Mutate from './views/Mutate/Component.ce.vue'

import godFatherRootStyles from 'godfather/dist/godfather.css?inline'
import godFatherCustomStyles from './styles/godfather.css?inline'

Finn.styles = [
  ...Finn.styles,
  ...Dashboard.styles,
  ...Mutate.styles,
  godFatherRootStyles,
  godFatherCustomStyles,
]

customElements.define('kvass-finn', defineCustomElement(Finn))
