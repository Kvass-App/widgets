import { defineCustomElement } from 'vue'
import App from './App.ce.vue'
import Card from './components/Card.ce.vue'
import Category from './components/Category.ce.vue'
import CategorySelector from './components/CategorySelector.ce.vue'
import ProjectTypeSelector from './components/ProjectTypeSelector.ce.vue'

App.styles = [
  ...App.styles,
  ...Card.styles,
  ...Category.styles,
  ...CategorySelector.styles,
  ...ProjectTypeSelector.styles,
]

customElements.define('kvass-project-portal', defineCustomElement(App))
