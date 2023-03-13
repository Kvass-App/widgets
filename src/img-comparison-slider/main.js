import { defineCustomElement } from 'vue'
import ImgComparisonSlider from './components/ImgComparisonSlider.ce.vue'

ImgComparisonSlider.styles = [...ImgComparisonSlider.styles]

customElements.define(
  'kvass-img-comparison-slider',
  defineCustomElement(ImgComparisonSlider),
)
