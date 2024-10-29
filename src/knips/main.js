import { defineCustomElement } from 'vue'
import Knips from './components/Knips.ce.vue'

customElements.define('knips-feed', defineCustomElement(Knips))
