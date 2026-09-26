import { defineCustomElement } from 'vue'
import Walkable from './components/Walkable.ce.vue'

customElements.define('kvass-walkable', defineCustomElement(Walkable))
