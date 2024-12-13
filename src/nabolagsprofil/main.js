import { defineCustomElement } from 'vue'
import Nabolagsprofil from './components/Nabolagsprofil.ce.vue'
import Demographics from './components/Demographics.ce.vue'
import Distance from './components/Distance.ce.vue'
import Population from './components/Population.ce.vue'
import Qualities from './components/Qualities.ce.vue'
import Disclaimer from './components/Disclaimer.ce.vue'
import Doughnut from './components/Doughnut.ce.vue'

Nabolagsprofil.styles = [
  ...Nabolagsprofil.styles,
  ...Demographics.styles,
  ...Distance.styles,
  ...Population.styles,
  ...Qualities.styles,
  ...Disclaimer.styles,
  ...Doughnut.styles,
]

customElements.define(
  'kvass-nabolagsprofil',
  defineCustomElement(Nabolagsprofil),
)
