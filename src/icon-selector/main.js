import { defineCustomElement } from 'vue'
import IconSelector from './components/IconSelector.ce.vue'
import Collection from './components/Collection.ce.vue'
import IconButton from './components/IconButton.ce.vue'

IconSelector.styles = [...IconSelector.styles, ...Collection.styles, ...IconButton.styles]

customElements.define('kvass-icon-selector', defineCustomElement(IconSelector))