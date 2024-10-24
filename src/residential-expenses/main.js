import { defineCustomElement } from 'vue'
import ResidentialExpenses from './components/ResidentialExpenses.ce.vue'

customElements.define(
  'kvass-residential-expenses',
  defineCustomElement(ResidentialExpenses),
)
