import Godfather from 'godfather/dist/godfather'
import 'godfather/dist/godfather.css'

export default {
  mounted(el, binding) {
    el._godfather = Godfather.register(
      binding.value.id,
      el,
      binding.value.options,
    )
  },
  beforeUnmount(el) {
    if (el._godfather) el._godfather.unregister()
  },
}
