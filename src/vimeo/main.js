import { defineCustomElement } from 'vue'
import Vimeo from './components/Vimeo.ce.vue'

customElements.define('kvass-vimeo', defineCustomElement(Vimeo))
