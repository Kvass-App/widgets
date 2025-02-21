import { defineCustomElement } from 'vue'
import Finn from './views/Finn.ce.vue'
import Dashboard from './views/Dashboard.ce.vue'
import Mutate from './views/Mutate/Component.ce.vue'

Finn.styles = [...Finn.styles, ...Dashboard.styles, ...Mutate.styles]

customElements.define('kvass-finn', defineCustomElement(Finn))
