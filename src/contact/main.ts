import { defineCustomElement } from 'vue';
import Checkbox from './components/Checkbox.ce.vue';
import Field from './components/Field.ce.vue';
import Fieldset from './components/Fieldset.ce.vue';
import Form from './components/Form.ce.vue';

Form.styles = [...Form.styles, ...Field.styles, ...Fieldset.styles, ...Checkbox.styles]

customElements.define('kvass-contact', defineCustomElement(Form));
