import { defineCustomElement } from 'vue'
import FacebookFeed from './components/FacebookFeed.ce.vue'

customElements.define('kvass-facebook-feed', defineCustomElement(FacebookFeed))
