import { defineCustomElement } from 'vue'
import Form from './components/Form.ce.vue'

customElements.define('kvass-form', defineCustomElement(Form))
