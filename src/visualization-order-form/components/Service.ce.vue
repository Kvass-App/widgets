<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import {
  Image,
  FormControl,
  Input,
  Switch,
  Alert,
  Flex,
  Button,
  Card,
  Dialog,
  RadioGroup,
  TextArea,
} from '@kvass/ui'

import Vimeo from '../../vimeo/components/Vimeo.ce.vue'

import { Clone } from '../../utils'

import { GetLabelInjectionKey } from '../keys'
import { Services } from '../enums'

const getLabel = inject(GetLabelInjectionKey)!

import type { Service } from '../types'

const props = defineProps<{
  modelValue: Service
  item: (typeof Services)[number]
}>()

const service = ref<Service>(Clone(props.modelValue))

const emit = defineEmits<{
  (e: 'update:modelValue', value: Service): void
}>()

const update = (v: Service) => {
  emit('update:modelValue', v)
}

const reset = () => {
  service.value = Clone(props.modelValue)
}
</script>

<template>
  <Card
    appearance="border"
    variant="widget"
    :title="getLabel(item.label)"
    :subtitle="getLabel(item.description)"
    class="k-service"
  >
    <template #thumbnail>
      <Image
        v-if="item.image"
        v-bind="{ aspectRatio: '16/9', size: 'cover', ...item.image }"
      ></Image>

      <Vimeo
        v-if="item.vimeo"
        v-bind="{
          aspectRatio: '16/9',
          videoState: 'play',
          loop: true,
          autoplay: true,
          controls: false,
          mute: true,
          ignoreConsent: true,
          ...item.vimeo,
        }"
      ></Vimeo>

      <iframe
        v-if="item.iframe"
        class="kvass-embed"
        :src="item.iframe.src"
        :style="`--kvass-embed-aspect-ratio: ${item.iframe.aspectRatio || '16/9'}; --kvass-embed-background-color: ${item.iframe.backgroundColor || '#fafafa'}`"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </template>

    <template #actions>
      <Flex direction="column" align="center">
        <Dialog
          :teleport="false"
          alignment="center"
          v-if="item.model"
          :title="getLabel(item.label)"
          class="model"
        >
          <template #trigger="{ triggerProps }">
            <Button
              v-bind="triggerProps"
              icon="ic:twotone-3d-rotation"
              class="model__trigger"
            />
          </template>
          <template #default>
            <iframe
              v-if="item.model"
              class="kvass-embed"
              :src="item.model.src"
              :style="`--kvass-embed-aspect-ratio: ${item.model.aspectRatio || '16/9'}; --kvass-embed-background-color: ${item.model.backgroundColor || '#fafafa'}`"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </template>
        </Dialog>
        <Dialog
          :teleport="false"
          alignment="center"
          @open="reset()"
          @close="reset()"
          :title="getLabel(item.label)"
          :subtitle="getLabel(item.description)"
        >
          <template #trigger="{ triggerProps }">
            <Button
              v-bind="triggerProps"
              :variant="modelValue.selected ? 'primary' : 'secondary'"
              :label="
                modelValue.selected ? getLabel('selected') : getLabel('select')
              "
            />
          </template>
          <template #default>
            <FormControl :label="getLabel('comment')">
              <TextArea v-model="service.comment" :rows="6" />
            </FormControl>

            <div class="k-mt-lg">{{ getLabel('priceNotIncluded') }}</div>
          </template>
          <template #actions="{ close }">
            <Button
              v-if="service.selected"
              :label="getLabel('removeSelected')"
              @click="
                () => {
                  update({
                    ...service,
                    comment: '',
                    selected: false,
                  })
                  close()
                }
              "
            />

            <Button
              :label="getLabel('cancel')"
              @click="
                () => {
                  close()
                }
              "
            />
            <Button
              variant="primary"
              :label="getLabel('confirm')"
              @click="
                () => {
                  update({
                    ...service,
                    selected: true,
                  })
                  close()
                }
              "
            />
          </template>
        </Dialog>
      </Flex>
    </template>
  </Card>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-service {
  .kvass-embed {
    width: 100%;
    aspect-ratio: var(--kvass-embed-aspect-ratio);
    background-color: var(--kvass-embed-background-color);
  }

  .model {
    --k-dialog-max-width: 80%;
    --k-dialog-min-width: 80%;

    @media (max-width: 800px) {
      --k-dialog-min-width: calc(
        100% - var(--k-dialog-card-margin-mobile, var(--k-ui-spacing-sm))
      );
    }
  }

  .model__trigger {
    font-size: 2rem;
  }
}
</style>
