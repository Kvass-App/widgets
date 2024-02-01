import { defineCustomElement } from 'vue';
import Map from './components/Map.ce.vue'

customElements.define('kvass-map', defineCustomElement(Map));