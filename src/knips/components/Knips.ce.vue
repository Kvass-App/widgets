<script setup>
import { onMounted, ref, computed } from 'vue'

const props = defineProps({
  url: String,
  feed: String,
  shouldDisplayAuthor: {
    type: Boolean,
    default: true,
  },
  postsLayout: {
    type: String,
    default: 'grid',
  },
  postDesign: {
    type: String,
    default: 'standard',
  },
  maxNumberOfPosts: {
    type: Number,
    default: 4,
  },
  maxNumberOfColumns: {
    type: Number,
    default: 4,
  },
  background: String,
  primary: String,
  primaryContrast: String,
  surface: String,
  surfaceContrast: String,
})

const hex = /#?[\da-f]{6}/
const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i

function hslToHex(hsl) {
  // Extract the HSL values from the input string
  const [_, h, s, l] =
    hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i) || []
  if (!h || !s || !l) return null

  // Convert percentages to fractions
  const hue = Number(h.match(hsl) ? getVariable(h) : h)
  const saturation = Number(s.match(hsl) ? getVariable(s) : s) / 100
  const lightness = Number(l.match(hsl) ? getVariable(l) : l) / 100

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = lightness - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (0 <= hue && hue < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= hue && hue < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= hue && hue < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= hue && hue < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= hue && hue < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= hue && hue < 360) {
    r = c
    g = 0
    b = x
  }

  // Convert RGB to Hex and return the formatted string
  const toHex = (n) => {
    const hex = Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
    return hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const getColor = (value) => {
  let color = value?.match(hex) ? value : getVariable(value)

  if (color.match(hsl)) color = hslToHex(color)
  return color.startsWith('#') ? color.substring(1) : color
}

const getVariable = (variable) => {
  if (!variable) return '#000000'
  variable = variable.startsWith('var(--')
    ? variable.substring(6, -1)
    : variable

  return getComputedStyle(
    document.body.querySelector('.standard-project') || document.body,
  ).getPropertyValue(`--${variable}`)
}

const el = ref(null)
const src = computed(() => {
  const url = new URL(`${props.url}/embed/posts`)

  Object.entries(props).forEach(([prop, value]) => {
    if (prop === 'url') return

    const map = {
      feed: 'feedId',
      surfaceContrast: 'onSurface',
      primaryContrast: 'onPrimary',
    }

    const k = map[prop] || prop

    switch (k) {
      case 'background':
      case 'primary':
      case 'surface':
      case 'onSurface':
      case 'onPrimary':
        url.searchParams.set(k, getColor(value))
        break
      default:
        url.searchParams.set(k, value)
        break
    }
  })

  return url.toString()
})

onMounted(() => {
  window.addEventListener('message', (t) => {
    if (!/"id":"nextjs"/.test(t.data)) return

    el.value.style.height = JSON.parse(t.data).height + 'px'
  })
})
</script>

<template>
  <iframe
    ref="el"
    allowfullscreen="true"
    width="100%"
    class="knips-feed"
    :src="src"
  ></iframe>
</template>

<style lang="scss">
.knips-feed {
  border: none;
  display: block;
  min-height: 40vh;
  //set height on mobile for scroll-anchor optimize
  @media (max-width: 767px) {
    height: 50vh;

    overflow: auto;
  }
}
</style>
