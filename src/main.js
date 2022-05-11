import { defineCustomElement } from 'vue';
import Form from './components/Form.ce.vue';

const FormComponent = defineCustomElement(Form);

customElements.define('kvass-lead-form', FormComponent);
