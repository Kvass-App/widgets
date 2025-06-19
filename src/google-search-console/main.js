import { defineCustomElement } from 'vue'
import GoogleSearchConsole from './components/GoogleSearchConsole.ce.vue'

customElements.define(
  'kvass-google-search-console',
  defineCustomElement(GoogleSearchConsole),
)
