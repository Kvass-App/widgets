import { defineCustomElement } from 'vue'
import Finn from './views/Finn.ce.vue'
import Dashboard from './views/Dashboard.ce.vue'
import Mutate from './views/Mutate/Component.ce.vue'

import godFatherRootStyles from 'godfather/dist/godfather.css?inline'
import godFatherCustomStyles from './styles/godfather.css?inline'

import floatingUi from 'floating-vue/dist/style.css?inline'

Finn.styles = [
  godFatherRootStyles,
  godFatherCustomStyles,
  floatingUi,
  ...Finn.styles,
  ...Dashboard.styles,
  ...Mutate.styles,
]

customElements.define('kvass-finn', defineCustomElement(Finn))
