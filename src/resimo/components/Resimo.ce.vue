<script setup>
const props = defineProps({
  iframe_src: {
    type: String,
    required: true,
  },
})

console.log()
console.log()
console.log()

console.log('lastet inn!')
console.log()
console.log()
</script>

<template>
  <h2>Resimo</h2>
  <div class="kvass-resimo__wrapper">
    <iframe :src="props.iframe_src" frameborder="0" allow="fullscreen"></iframe>
  </div>
</template>

<style lang="scss">
.kvass-resimo {
  &__wrapper {
    width: 100%;
  }
}

iframe {
  width: 100%;
  height: 100vh;
}
</style>
