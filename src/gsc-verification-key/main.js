import { defineCustomElement } from 'vue'
import VerificationKeyForm from './components/VerificationKeyForm.ce.vue'

customElements.define(
  'kvass-gsc-verification-key-form',
  defineCustomElement(VerificationKeyForm),
)
