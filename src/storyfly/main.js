import { defineCustomElement } from 'vue'
import StoryFly from './components/StoryFly.ce.vue'

customElements.define('kvass-storyfly', defineCustomElement(StoryFly))
