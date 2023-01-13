import { defineCustomElement } from 'vue'
import App from './App.vue'
import Card from './components/Card.vue'
import Category from './components/Category.vue'
import CategorySelector from './components/CategorySelector.vue'
import ProjectTypeSelector from './components/ProjectTypeSelector.vue'
import { LoaderComponent, Spinner } from '@kvass/loader'

App.styles = [
  ...App.styles,
  ...Card.styles,
  ...Category.styles,
  ...CategorySelector.styles,
  ...ProjectTypeSelector.styles,

  ...LoaderComponent.styles,
  ...Spinner.styles
]

customElements.define('kvass-project-portal', defineCustomElement(App))
