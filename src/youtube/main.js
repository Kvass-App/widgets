import { defineCustomElement } from 'vue'
import Youtube from './components/Youtube.ce.vue'

customElements.define('kvass-youtube', defineCustomElement(Youtube))
