import { defineCustomElement } from 'vue'
import ImgComparisonSlider from './components/ImgComparisonSlider.ce.vue'

customElements.define(
  'kvass-img-comparison-slider',
  defineCustomElement(ImgComparisonSlider),
)
