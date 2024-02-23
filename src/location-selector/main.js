import { defineCustomElement } from 'vue'
import Selector from './components/Selector.ce.vue'

customElements.define('kvass-location-selector', defineCustomElement(Selector))
