import { defineCustomElement } from 'vue'
import FontSelector from './components/FontSelector.ce.vue'

customElements.define('kvass-font-selector', defineCustomElement(FontSelector))
