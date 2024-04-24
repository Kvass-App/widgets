import { defineCustomElement } from 'vue'
import TableBuilder from './components/TableBuilder.ce.vue'

customElements.define('kvass-table-builder', defineCustomElement(TableBuilder))
