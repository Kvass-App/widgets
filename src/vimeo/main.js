import { defineCustomElement } from 'vue'
import Vimeo from './components/vimeo.ce.vue'

customElements.define('kvass-vimeo', defineCustomElement(Vimeo))
