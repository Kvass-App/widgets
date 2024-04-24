import { defineCustomElement } from 'vue'
import ChartBuilder from './components/ChartBuilder.ce.vue'

customElements.define('kvass-chart-builder', defineCustomElement(ChartBuilder))
