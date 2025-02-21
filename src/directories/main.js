import { defineCustomElement } from 'vue'
import Directories from './components/Directory.ce.vue'

customElements.define('kvass-directories', defineCustomElement(Directories))
