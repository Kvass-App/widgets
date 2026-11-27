<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Flex,
  Spinner,
  type BadgeProps,
} from '@kvass/ui'
import { useCurrentElement } from '@vueuse/core'
import { vTooltip } from 'floating-vue'
import { useAPI } from '../api'
import { toCurrency } from '../../utils'
import { type Ad } from '../types/ad'
import {
  type ProductState,
  type Upsell,
  type UpsellProduct,
  type UpsellReceipt,
} from '../types/upsell'

const BadgeByState: Partial<Record<ProductState, BadgeProps>> = {
  PURCHASED_NOT_DELIVERED: { label: 'Bestilt', variant: 'info' },
  DELIVERED: { label: 'Aktiv', variant: 'success' },
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('nb-NO')
}

function getPeriod(start: string, days: number) {
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  return `${formatDate(start)} – ${formatDate(end)}`
}

function getDay(start: string) {
  return Math.floor((Date.now() - new Date(start).getTime()) / 86400000) + 1
}

function getAvailability(product: UpsellProduct) {
  if (!product.availableFrom) return 'Ikke tilgjengelig nå'
  return `Tilgjengelig fra ${formatDate(product.availableFrom)}`
}

const { item } = defineProps<{ item: Ad & { id: string } }>()

const element = useCurrentElement()
const API = useAPI(element)

const upsell = ref<Upsell>()
const fetching = ref(false)
const view = ref<'list' | 'details' | 'cancel' | 'history'>('list')
const selected = ref<UpsellProduct>()
const receipt = ref<UpsellReceipt>()
const promise = ref<Promise<unknown>>()
const error = ref<string>()

const products = computed(() =>
  (upsell.value?.upsellProducts || []).flatMap((group) => group.products),
)

const activeProducts = computed(() =>
  products.value.filter((product) => BadgeByState[product.productState]),
)

const availableProducts = computed(() =>
  products.value.filter((product) => !BadgeByState[product.productState]),
)

const isPublished = computed(() => Boolean(item.publishedAt && !item.preview))

const isCancel = computed(
  () => selected.value?.productState === 'PURCHASED_NOT_DELIVERED',
)

const isUnavailable = computed(
  () => selected.value?.productState === 'UNAVAILABLE',
)

const availableFromLabel = computed(() => {
  if (!selected.value?.availableFrom) return 'Ikke nå'
  return `Fra ${formatDate(selected.value.availableFrom)}`
})

const activationDescription = computed(() => {
  if (!selected.value) return
  const { headingText, durationInDays } = selected.value
  const activation = `${headingText} blir aktivert på annonsen med en gang`
  if (!durationInDays) return `${activation}.`
  return `${activation} og varer i ${durationInDays} dager.`
})

const purchaseNotice = computed(() => {
  if (!receipt.value || !selected.value) return
  const price = toCurrency(receipt.value.totalPriceWithVat)

  if (receipt.value.purchaseState !== 'COMPLETED') {
    return {
      variant: 'info' as const,
      title: `${selected.value.headingText} er bestilt for ${price} inkl. mva.`,
      content:
        'Kjøpet behandles hos Finn. Det kan ta litt tid før produktet er aktivt på annonsen.',
    }
  }

  return {
    variant: 'success' as const,
    title: `${selected.value.headingText} er kjøpt for ${price} inkl. mva.`,
    content: 'Finn sender faktura.',
  }
})

const setError = (err: Response) => {
  return err.json().then(({ message }) => (error.value = message))
}

const getData = () => {
  fetching.value = true
  error.value = undefined

  return API.getUpsell(item.id)
    .then((data) => (upsell.value = data))
    .catch(setError)
    .finally(() => (fetching.value = false))
}

const showList = () => {
  view.value = 'list'
  getData()
}

const onOpen = () => {
  receipt.value = undefined
  showList()
}

const purchase = (product: UpsellProduct) => {
  return API.purchaseUpsell(item.id, product.productUrn).then(
    (data) => (receipt.value = data),
  )
}

const onSelect = (product: UpsellProduct) => {
  selected.value = product
  receipt.value = undefined
  error.value = undefined
  view.value =
    product.productState === 'PURCHASED_NOT_DELIVERED' ? 'cancel' : 'details'
}

const onBack = () => {
  error.value = undefined
  view.value = 'list'
}

const onConfirm = () => {
  if (!selected.value) return
  error.value = undefined

  const request = isCancel.value
    ? API.cancelUpsell(item.id, selected.value.productUrn)
    : purchase(selected.value)

  promise.value = request.catch((err) => {
    setError(err)
    throw err
  })
}
</script>

<template>
  <Dialog
    :teleport="false"
    :closeOnOutsideClick="true"
    variant="prompt"
    class="upsell"
    :title="`Finn-tillegg for annonsen: ${item.name}`"
    @open="onOpen"
  >
    <template #trigger="{ triggerProps }">
      <Button
        v-bind="triggerProps"
        label="Finn-tillegg"
        size="small"
        :disabled="!isPublished"
        v-tooltip="{
          content: 'Annonsen må være publisert for å kjøpe Finn-tillegg.',
          disabled: isPublished,
          container: false,
        }"
      />
    </template>

    <template #default="{ descriptionProps }">
      <div v-bind="descriptionProps" class="upsell__content">
        <Alert v-if="error" variant="danger" :content="error" />

        <Flex v-if="fetching" justify="center">
          <Spinner size="large" />
        </Flex>

        <template v-else-if="view === 'list'">
          <Alert v-if="purchaseNotice" v-bind="purchaseNotice" />

          <section v-if="activeProducts.length" class="upsell__section">
            <strong>Aktivt på annonsen</strong>
            <div
              v-for="product in activeProducts"
              :key="product.productUrn"
              class="upsell__card"
            >
              <Flex justify="space-between" align="center">
                <strong>{{ product.headingText }}</strong>
                <Badge
                  v-bind="BadgeByState[product.productState]"
                  appearance="filled"
                />
              </Flex>

              <template
                v-if="
                  product.productState === 'DELIVERED' &&
                  product.productStartDate &&
                  product.durationInDays
                "
              >
                <Flex justify="space-between">
                  <span>
                    {{
                      getPeriod(
                        product.productStartDate,
                        product.durationInDays,
                      )
                    }}
                  </span>
                  <span>
                    Dag {{ getDay(product.productStartDate) }} av
                    {{ product.durationInDays }}
                  </span>
                </Flex>
                <div class="upsell__progress">
                  <div
                    :style="{
                      width: `${(getDay(product.productStartDate) / product.durationInDays) * 100}%`,
                    }"
                  />
                </div>
              </template>

              <Flex
                v-if="product.productState === 'PURCHASED_NOT_DELIVERED'"
                justify="space-between"
                align="center"
              >
                <span>
                  <template v-if="product.productStartDate">
                    Starter {{ formatDate(product.productStartDate) }}
                  </template>
                  <template v-if="product.durationInDays">
                    · {{ product.durationInDays }} dager
                  </template>
                </span>
                <Button label="Avbestill" @click="() => onSelect(product)" />
              </Flex>
            </div>
          </section>

          <section v-if="upsell" class="upsell__section">
            <strong>Kan kjøpes</strong>
            <p v-if="!availableProducts.length">
              Ingen produkter tilgjengelig akkurat nå.
            </p>
            <div
              v-for="product in availableProducts"
              :key="product.productUrn"
              class="upsell__card upsell__product"
            >
              <div>
                <strong>{{ product.headingText }}</strong>
                <p class="upsell__description">
                  {{ product.descriptionText }}
                </p>
                <p v-if="product.productState === 'UNAVAILABLE'">
                  {{ getAvailability(product) }}
                </p>
              </div>
              <Button
                label="Les mer"
                variant="primary"
                iconRight="fa-pro-light:arrow-right"
                @click="() => onSelect(product)"
              />
            </div>
          </section>
        </template>

        <template v-else-if="view === 'details' && selected">
          <div>
            <h3 class="upsell__title">{{ selected.headingText }}</h3>
            <p>{{ selected.descriptionText }}</p>
            <Flex gap="lg" class="k-mt-xs">
              <a
                v-if="selected.readMoreUrl"
                :href="selected.readMoreUrl"
                target="_blank"
              >
                Les mer hos Finn
              </a>
              <a
                v-if="selected.blinkPreviewUrl"
                :href="selected.blinkPreviewUrl"
                target="_blank"
              >
                Se eksempel
              </a>
            </Flex>
          </div>

          <div class="upsell__facts">
            <div v-if="selected.durationInDays">
              <span>Varighet</span>
              <strong>{{ selected.durationInDays }} dager</strong>
            </div>
            <div v-if="isUnavailable">
              <span>Kan kjøpes</span>
              <strong>{{ availableFromLabel }}</strong>
            </div>
            <div v-else>
              <span>Starter</span>
              <strong>Med en gang</strong>
            </div>
          </div>

          <Alert
            variant="info"
            icon="fa-pro-regular:exclamation-triangle"
            title="Betalt tjeneste fra Finn"
          >
            <div>Finn sender faktura. Kvass tar ikke betalt for dette.</div>
            <div class="k-mt-xs">
              <a
                href="https://www.finn.no/eiendom/prisoversikt"
                target="_blank"
              >
                Se prisene hos Finn
              </a>
            </div>
          </Alert>
        </template>

        <h3 v-else-if="view === 'cancel' && selected" class="upsell__title">
          Vil du avbestille {{ selected.headingText }}?
        </h3>

        <template v-else-if="view === 'history' && upsell">
          <div>
            <h3 class="upsell__title">Kjøpshistorikk</h3>
            <p>
              Alt som er kjøpt på denne annonsen hos Finn, også pakkene fra
              publiseringen.
            </p>
          </div>
          <ol class="upsell__timeline">
            <li
              v-for="entry in upsell.purchaseHistory"
              :key="`${entry.productUrn}-${entry.dateDelivered}`"
            >
              <strong>{{ entry.headingText }}</strong>
              <span>{{ formatDate(entry.dateDelivered) }}</span>
            </li>
          </ol>
        </template>
      </div>
    </template>

    <template #actions="{ close }">
      <Button
        v-if="view === 'details'"
        class="upsell__leading"
        label="Tilbake"
        iconLeft="fa-pro-light:chevron-left"
        @click="onBack"
      />
      <Button
        v-else-if="view === 'history'"
        class="upsell__leading"
        label="Tilbake til produktene"
        iconLeft="fa-pro-light:chevron-left"
        @click="onBack"
      />
      <Button
        v-else-if="view === 'list' && upsell?.purchaseHistory.length"
        class="upsell__leading"
        :label="`Kjøpshistorikk (${upsell.purchaseHistory.length})`"
        iconRight="fa-pro-light:chevron-right"
        @click="() => (view = 'history')"
      />

      <Dialog
        v-if="view === 'details' && selected"
        class="upsell__prompt"
        variant="prompt"
        :teleport="false"
        :title="`Vil du kjøpe ${selected.headingText}?`"
      >
        <template #trigger="{ triggerProps }">
          <Button
            v-bind="triggerProps"
            label="Kjøp"
            variant="primary"
            :disabled="isUnavailable"
          />
        </template>
        <template #default="{ descriptionProps }">
          <Alert
            v-if="error"
            variant="danger"
            :content="error"
            class="k-mb-sm"
          />
          <p v-bind="descriptionProps">
            {{ activationDescription }} Finn sender faktura for kjøpet.
          </p>
        </template>
        <template #actions="{ close: closePrompt }">
          <Button label="Nei, ta meg tilbake" @click="closePrompt" />
          <Button
            label="Ja, kjøp"
            variant="primary"
            :promise="promise"
            @click="onConfirm"
            @success="showList"
          />
        </template>
      </Dialog>
      <template v-else-if="view === 'cancel'">
        <Button label="Nei, ta meg tilbake" @click="onBack" />
        <Button
          label="Ja, avbestill"
          variant="primary"
          :promise="promise"
          @click="onConfirm"
          @success="showList"
        />
      </template>
      <Button v-else label="Lukk" @click="close" />
    </template>
  </Dialog>
</template>

<style lang="scss">
.upsell {
  --k-dialog-min-width: min(600px, calc(100dvw - 2 * var(--k-ui-spacing-sm)));
  --k-dialog-max-width: 600px;

  .k-dialog__title {
    padding-inline-end: var(--k-ui-spacing-xxl);
  }

  .k-card__actions {
    justify-content: flex-end;
  }

  &__leading {
    margin-inline-end: auto;
  }

  &__prompt {
    --k-dialog-min-width: min(440px, calc(100dvw - 2 * var(--k-ui-spacing-sm)));
    --k-dialog-max-width: 440px;
    --k-dialog-card-margin-desktop: 6rem var(--k-ui-spacing-xl);

    .k-card__content > p {
      margin: 0;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--k-ui-spacing-lg);

    p {
      margin: var(--k-ui-spacing-xs) 0 0;
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--k-ui-spacing-sm);
  }

  &__title {
    margin: 0;
    font-size: var(--k-ui-font-size-lg);
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: var(--k-ui-spacing-sm);
    padding: var(--k-ui-spacing) var(--k-ui-spacing-lg);
    border: 1px solid var(--k-ui-color-neutral-light);
    border-radius: var(--k-ui-rounding-lg);
  }

  &__product {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--k-ui-spacing-lg);
  }

  &__progress {
    height: 6px;
    border-radius: var(--k-ui-rounding-full);
    background-color: var(--k-ui-color-neutral-light);
    overflow: hidden;

    div {
      height: 100%;
      background-color: var(--k-ui-color-success);
    }
  }

  &__description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--k-ui-spacing-sm);

    div {
      display: flex;
      flex-direction: column;
      gap: var(--k-ui-spacing-xxs);
      padding: var(--k-ui-spacing-sm) var(--k-ui-spacing);
      border: 1px solid var(--k-ui-color-neutral-light);
      border-radius: var(--k-ui-rounding-lg);
    }

    span {
      font-size: var(--k-ui-font-size-sm);
    }
  }

  &__timeline {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--k-ui-spacing-xxs);
      padding: 0 0 var(--k-ui-spacing-lg) var(--k-ui-spacing-xxl);

      &::before {
        content: '';
        position: absolute;
        top: 0.3rem;
        left: 0;
        width: 0.75rem;
        height: 0.75rem;
        border: 2px solid var(--k-ui-color-neutral-darkest);
        border-radius: 50%;
        box-sizing: border-box;
        background-color: white;
      }

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 1.2rem;
        bottom: 0;
        left: calc(0.375rem - 1px);
        width: 2px;
        background-color: var(--k-ui-color-neutral-light);
      }
    }
  }
}
</style>
