import { defineCustomElement } from 'vue';
import Flatfinder from './components/Flatfinder.ce.vue'

customElements.define('kvass-flatfinder', defineCustomElement(Flatfinder));