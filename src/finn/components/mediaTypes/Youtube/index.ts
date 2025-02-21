import Create from './Create.ce.vue'
import CreateTrigger from './CreateTrigger.ce.vue'
import Thumbnail from './Thumbnail.ce.vue'
import Preview from './Preview.ce.vue'

import { type MediaItem as Media } from '@kvass/ui'

import { markRaw } from 'vue'

export default {
  name: 'Youtube',
  condition: (x: Media) => {
    return /^youtube/i.test(x.type)
  },
  components: {
    Create: markRaw(Create),
    CreateTrigger: markRaw(CreateTrigger),
    Thumbnail: markRaw(Thumbnail),
    Preview: markRaw(Preview),
  },
}
