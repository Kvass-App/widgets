import { defineCustomElement } from 'vue'
import Calculator from './components/Calculator.ce.vue'

customElements.define('kvass-lead-calculator', defineCustomElement(Calculator))

// Figtree lastes på dokumentnivå slik at den også er tilgjengelig i Shadow DOM.
if (!document.querySelector('link[data-kvass-calculator-font]')) {
  const font = document.createElement('link')
  font.rel = 'stylesheet'
  font.href =
    'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap'
  font.dataset.kvassCalculatorFont = ''
  document.head.append(font)
}
