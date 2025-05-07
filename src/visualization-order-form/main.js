import { defineCustomElement } from 'vue'
import VisualizationOrderForm from './components/VisualizationOrderForm.ce.vue'

import floatingUi from 'floating-vue/dist/style.css?inline'

VisualizationOrderForm.styles = [floatingUi, ...VisualizationOrderForm.styles]

customElements.define(
  'kvass-visualization-order-form',
  defineCustomElement(VisualizationOrderForm),
)
