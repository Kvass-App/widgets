import { defineCustomElement } from 'vue'
import ChartSelector from './components/ChartSelector.ce.vue'

customElements.define(
  'kvass-chart-selector',
  defineCustomElement(ChartSelector),
)
