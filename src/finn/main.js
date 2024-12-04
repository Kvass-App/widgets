import { defineCustomElement } from 'vue'
import Finn from './components/Finn.ce.vue'

customElements.define('kvass-finn', defineCustomElement(Finn))
