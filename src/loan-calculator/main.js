import { defineCustomElement } from 'vue'
import LoanCalculator from './components/LoanCalculator.ce.vue'

customElements.define(
  'kvass-loan-calculator',
  defineCustomElement(LoanCalculator),
)
