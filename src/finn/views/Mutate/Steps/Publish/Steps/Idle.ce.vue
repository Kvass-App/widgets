<script setup lang="ts">
import { Card, Alert, Button, Icon, Dialog, Dropdown } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

const emit = defineEmits<{
  (event: 'publish', payload: void): void
  (event: 'goto', payload: string): void
}>()
</script>

<template>
  <Card
    v-if="!modelValue.id || modelValue.preview"
    class="publish"
    appearence="border"
    variant="default"
    title="Forhåndsvis annonsen og publiser!"
    subtitle="Her kan du se annonsen din, om du er fornøyd med resultatet kan du aktivere annonsen på Finn!"
    thumbnail="https://assets.kvass.no/67aa2b433aee3cb55c8e7408"
  >
    <template #default>
      <Alert
        icon="fa-pro-regular:exclamation-triangle"
        variant="info"
        title="Ved publisering aktiveres en betalt tjeneste fra Finn."
        content="Når du aktiverer annonsen vil du nå motta faktura og kostnader fra Finn. Bindingstiden varierer i henhold til din avtale med Finn"
      >
      </Alert>
    </template>
    <template #actions>
      <Button
        label="Redigering"
        iconLeft="fa-pro-light:chevron-left"
        @click="() => emit('goto', 'ad')"
      />

      <Dropdown
        label="Forhåndsvis annonser"
        v-if="modelValue.units.some((v) => v.url)"
      >
        <template #default>
          <Button
            variant="tertiary"
            iconRight="fa-pro-light:arrow-up-right-from-square"
            label="Prosjektannonse"
            target="_blank"
            is="a"
            :href="modelValue.url"
          />
          <Button
            variant="tertiary"
            v-for="unit in modelValue.units"
            :label="`${unit.name}`"
            target="_blank"
            is="a"
            :href="unit.url"
            iconRight="fa-pro-light:arrow-up-right-from-square"
          />
        </template>
      </Dropdown>

      <Button
        v-else
        :disabled="!Boolean(modelValue.url)"
        label="Forhåndsvis annonse"
        iconRight="fa-pro-light:arrow-up-right-from-square"
        target="_blank"
        is="a"
        :href="modelValue.url"
      />

      <Dialog
        class="publish__dialog"
        alignment="center"
        variant="prompt"
        :teleport="false"
        title="Du er i ferd med å aktivere en Finn.no annonse"
      >
        <template #trigger="{ triggerProps }">
          <Button
            label="Publiser annonse"
            variant="primary"
            iconRight="fa-pro-light:arrow-right-long"
            v-bind="triggerProps"
          />
        </template>
        <template #default="{ descriptionProps }">
          <!-- @vue-expect-error -->
          <p v-bind="descriptionProps">
            Når du publiserer annonsen, aktiveres en betalt tjeneste fra FINN.
            Du vil da motta faktura og påløpende kostnader. Bindingstiden
            avhenger av avtalen din i Finn.
          </p>
          <p>
            <span> Du kan lese mer om Finn.no sine priser </span>
            <a target="_blank" href="https://www.finn.no/eiendom/prisoversikt"
              >her</a
            >
          </p>
        </template>
        <template #actions="{ close }">
          <Button label="Nei, ta meg tilbake" @click="close" />
          <Button
            label="Ja, dette er ok"
            variant="primary"
            @click="() => emit('publish')"
          />
        </template>
      </Dialog>
    </template>
  </Card>
  <Card
    v-else
    class="publish publish--update"
    appearence="border"
    variant="default"
    title="Oppdater annonsen med nye endringer"
    subtitle="Send inn nye endringer til Finn!"
  >
    <template #thumbnail>
      <Icon icon="fa-pro-light:pen-paintbrush"></Icon>
    </template>
    <template #actions>
      <Button
        label="Oppdater annonsen"
        variant="primary"
        iconRight="fa-pro-light:arrow-right-long"
        @click="() => $emit('publish')"
      />
    </template>
  </Card>
</template>

<style lang="scss">
.publish {
  margin: 0 auto;
  min-width: 600px;

  &--update {
    .k-card__thumbnail {
      display: flex;
      justify-content: center;

      background-color: #d3e6f7;
      padding-block: 7rem;
      font-size: 7rem;

      svg {
        color: #6ba3d6;
      }
    }
  }

  &__dialog {
    // --k-dialog-min-width: 500px;
    // --k-dialog-max-width: 500px;

    .k-card__content {
      & > p:first-of-type {
        margin-top: 0;
      }
      & > p:last-of-type {
        margin-bottom: 0;
      }
    }
  }
}
</style>
