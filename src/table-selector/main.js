import { defineCustomElement } from 'vue'
import TableSelector from './components/TableSelector.ce.vue'

customElements.define(
  'kvass-table-selector',
  defineCustomElement(TableSelector),
)
