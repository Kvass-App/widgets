<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  inject,
  type WatchHandle,
} from 'vue'
import {
  Input,
  FormControl,
  Flex,
  Grid,
  Card,
  Alert,
  Expandable,
  Media,
  Button,
  Icon,
  Checkbox,
  Spinner,
  File,
  Dropdown,
  RichText,
  Switch,
  Dialog,
  Image,
} from '@kvass/ui'

import Tooltip from '../../../components/Tooltip.ce.vue'
import { vTooltip } from 'floating-vue'

import Categories from '../../../enums/categories.ts'
import UnitTable from '../../../components/units/UnitTable.ce.vue'
import ExpandableList from '../../../components/ExpandableList.ce.vue'
import RichTextMultiple from '../../../components/RichTextMultiple.ce.vue'

import { Clone, uploadFunction, hasDiff } from '../../../../utils/index.js'

import Validator from '../../../composeable/Validator'

import Properties from '../../../enums/PropertyType.ts'
import OwnershipTypes from '../../../enums/OwnershipTypes.ts'
import LeisureSituation from '../../../enums/LeisureSituation.ts'
import { energyLabel, energyLabelColor } from '../../../enums/EnergyLabels.ts'

import { type Ad, Facility } from '../../../types/ad'
import { type Webcomponent } from '../../../types/webcomponent'

import { PropsInjectionKey } from '../../../keys'
import { useAPI, type Fields } from '../../../api'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const webcomponentProps = inject<Webcomponent>(
  PropsInjectionKey,
) as Webcomponent

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

const reset = () => {
  modelValue.value.fields = {}
  modelValue.value.units.forEach((u) => (u.fields = {}))

  getData()
}

const displayProperties = computed(() => {
  return Properties.filter(
    (v) =>
      v.categories.includes(modelValue.value.type as any) &&
      (v.condition ? v.condition(modelValue.value) : true),
  )
})

const data = ref<Ad['fields']>({})
const initialFields = ref<Ad['fields']>({})

const units = ref<Fields['units']>([])
const initialUnitFields = ref<Fields['fields'][]>([])

const facilities = ref<Facility[]>([])
const unitFacilities = computed(() => {
  return facilities.value.filter((v) =>
    v.categories.includes(
      //@ts-ignore
      Categories.find((v) => v.type === modelValue.value.type)?.unitType,
    ),
  )
})

const fetching = ref(true)
const watcherCleanups = ref<WatchHandle[]>([])

const rules = ref<Record<string, string>>({})
const labels = ref<Record<string, string>>({})

const validatorData = computed(() => {
  return {
    ...data.value,
    units: units.value.map((v) => v.fields),
  }
})

const customMessages = computed(() => {
  return {
    required_if: 'Feltet ":attribute" er påkrevd når ":other" er avhuket',
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: validatorData,
  customMessages: customMessages,
})

const { bind: validate } = validator

const brokerError = computed(() => {
  const totalBrokers = (data.value.BROKER || []).length
  if (!totalBrokers) return 'Kundebehandler er påkrevd'

  return Array.from({ length: totalBrokers }, (_, index) => {
    return validator.errors.value.errors[`BROKER.${index}.PHONE`]
  })
    .filter(Boolean)
    .flat()
    .join('')
})

const addressError = computed(() => {
  const addressErrors = [
    'MAP_COORDINATE.EASTING',
    'MAP_COORDINATE.NORTHING',
    'STREETADDRESS',
    'ZIPCODE',
  ].some((v) => {
    return validator.errors.value.errors[v]
  })

  return addressErrors ? 'Adresse og koordinater er påkrevd' : ''
})

const hasField = (field) => Boolean(data.value.hasOwnProperty(field))

const hasFields = (...args) => args.some(hasField)

const isEdited = (field) => modelValue.value.fields.hasOwnProperty(field)

const getIsEditedBind = (field) => {
  return isEdited(field)
    ? {
        icon: 'fa-pro-regular:cloud-xmark',
        label: 'Ikke synkronisert',
      }
    : {
        icon: 'fa-pro-regular:cloud-check',
        label: 'Synkronisert',
      }
}

const getData = () => {
  fetching.value = true

  return API.fields(modelValue.value)
    .then((value) => {
      facilities.value = value.facilities

      initialFields.value = Clone(value.fields)

      // TODO, Partial update ?
      // Hva om man går fram og tilbake ?
      data.value = Clone({ ...value.fields, ...modelValue.value.fields })

      watcherCleanups.value.forEach((watcherCleanup) => watcherCleanup())
      watcherCleanups.value = []

      Object.keys(value.fields).forEach((key) => {
        const watcherCleanup = watch(
          () => data.value[key],
          (newValue, oldValue) => {
            modelValue.value.fields[key] = newValue

            if (
              !hasDiff({ value: newValue }, { value: initialFields.value[key] })
            ) {
              delete modelValue.value.fields[key]
            }
          },
          { deep: true },
        )
        watcherCleanups.value.push(watcherCleanup)
      })

      initialUnitFields.value = Clone(value.units.map((v) => v.fields))

      units.value = Clone(
        value.units.map((v, index) => {
          return {
            ...v,
            fields: {
              ...v.fields,
              ...(modelValue.value.units.find(
                (u) => u.id === v.fields.USER_REFERENCE,
              )?.fields || {}),
            },
          }
        }),
      )

      const unitRules = value.units
        .map((v) => v.rules)
        .map((r) => {
          return Object.fromEntries(
            Object.entries(r).map(([k, v]) => {
              return [`units.*.${k}`, v]
            }),
          )
        })

      const unitLabels = value.units.map(
        (
          { fields: unitFields, labels: unitLabels, rules: unitRules },
          index,
        ) => {
          const unitName = `Enhet ${unitFields.HOUSING_UNIT_REF || index + 1}`

          return Object.fromEntries(
            Object.entries(unitLabels).map(([k, v]) => {
              return [`units.${index}.${k}`, `${unitName} ${v}`]
            }),
          )
        },
      )

      rules.value = Object.assign({}, value.rules, ...unitRules)

      labels.value = Object.assign({}, value.labels, ...unitLabels)
    })
    .catch((err) => {
      console.error(err)
      props.onPrev()
    })
    .finally(() => {
      fetching.value = false
    })
}

const getNextLabel = () => {
  if (
    !modelValue.value.id ||
    modelValue.value.preview ||
    !modelValue.value.code
  )
    return 'Generer forhåndsvisning'

  return 'Neste'
}

const getProjectStepUrl = (step: string) => {
  const url = new URL(
    `${webcomponentProps.tenant}/projects/${webcomponentProps.project}/edit/${step}`,
  )

  return url.toString()
}

function onTabChange() {
  if (document.visibilityState === 'visible') {
    getData() // Refetch when user comes back
  }
}

const formContainer = ref()

const editDialogAccepted = ref(
  Object.keys(modelValue.value.fields).length ? true : false,
)
const editDialog = ref()

function onFocus(e) {
  if (
    e.target.classList.contains('k-expandable__header') ||
    e.target.classList.contains('disable-focus-modal')
  )
    return
  editDialog.value.open()
}

const setExpandableElements = (state: boolean) => {
  //@ts-ignore
  const items = element.value.querySelectorAll('.k-expandable--expandable')

  items.forEach((el) => {
    state
      ? el.addEventListener('focusin', onFocus)
      : el.removeEventListener('focusin', onFocus)
  })
}
const deleteFocusEvents = () => {
  setExpandableElements(false)
}

const acceptEditDialog = () => {
  editDialogAccepted.value = true

  deleteFocusEvents()
}

onMounted(() => {
  window.addEventListener('visibilitychange', onTabChange)
  getData().then(() => {
    if (editDialogAccepted.value) return

    setExpandableElements(true)
  })
})

onUnmounted(() => {
  window.removeEventListener('visibilitychange', onTabChange)
  deleteFocusEvents()
})

const savingDraftPromise = ref()
const loading = ref()

const saveDraft = () => {
  savingDraftPromise.value = new Promise((resolve, reject) => {
    loading.value = true

    API.publish(modelValue.value, { publish: false }).then((response) => {
      response.on('message', (data) => {
        if (data.id) {
          modelValue.value.id = data.id
        }

        response.on('error', (data) => {
          reject(data)
        })

        response.on('finished', () => {
          response.cancel()
          resolve(modelValue.value.id)
          loading.value = false
        })
      })
    })
  })
}
</script>

<template>
  <div class="ad" ref="formContainer">
    <Dialog
      :teleport="false"
      ref="editDialog"
      title="Du er i ferd med å tilpasse annonsen"
      variant="prompt"
    >
      <template #trigger="{ triggerProps }">
        <Button v-bind="triggerProps" style="display: none"></Button>
      </template>
      <template #default>
        <p>
          Du er nå i ferd med å tilpasse annonsen. Når dette gjøres vil du se at
          dette ikonet skifer til et annet, dette ikonet indikerer at dette
          feltet, ikke lengre henter informasjon fra prosjektsiden.
        </p>
        <Image
          src="https://assets.kvass.no/67c59b8a92504cdf70ab97d2"
          size="contain"
          width="100%"
          aspectRatio="16/9"
        ></Image>
      </template>
      <template #actions="{ close }">
        <Button label="Nei, ta meg tilbake" @click="close"></Button>
        <Button
          label="Ja, den er grei!"
          variant="primary"
          @click="
            () => {
              acceptEditDialog()
              close()
            }
          "
        ></Button>
      </template>
    </Dialog>
    <Alert
      title="Tilpasset annonse eller automatisert annonse"
      variant="info"
      class="ad__alert"
      icon="fa-pro-regular:exclamation-circle"
    >
      <template #default>
        <p style="margin-top: 0">
          Basert på informasjon du har fylt ut til prosjektsiden har vi
          opprettet en Finn-annonse basert på dette.
        </p>
        <p>
          Dersom du ønsker å tilpasse prosjektet med nye bilder og tekster, vær
          klar over at prosjektsiden og Finn-annonsen ikke lengre vil
          synkroniseres. Det betyr at dersom du endrer tekst under
          prosjektsiden, for eksempel under steget presentasjon, vil det ikke
          automatisk oppdateres på Finn.no.
        </p>
        <p>
          Om du ønsker å benytte den ferdigutfylte Finn-annonsen vi tilbyr
          trenger du ikke gjøre endringer på denne siden. Dersom du tidligere
          har gjort endringer og ønsker å tilbakestille til vår ferdig utfylte
          annonse kan du gjøre dette under knappen "Handlinger" og "Tilbakestill
          innhold"
        </p>
      </template>
    </Alert>

    <KeepAlive>
      <Flex
        v-if="fetching"
        justify="center"
        style="background-color: whitesmoke"
        class="k-py-3xl"
      >
        <Spinner size="large"></Spinner>
      </Flex>

      <Card variant="prompt" appearance="shadow" v-else>
        <template #header>
          <div class="k-card__title ad__title">
            <span>Innhold i Finn-annonsen</span>

            <Button
              class="ad__go-back"
              icon="fa-pro-light:chevron-left"
              label="Gå tilbake"
              variant="secondary"
              @click="onPrev"
            />

            <Dialog
              alignment="center"
              :teleport="false"
              title="Tilbakestill endringer"
              subtitle="Tilbakestill alle endringer du har gjort, slik at at alle feltene blir synkronisert igjen"
            >
              <template #trigger="{ triggerProps }">
                <Button
                  class="ad__reset"
                  label="Tilbakestill innhold"
                  variant="secondary"
                  v-bind="triggerProps"
                />
              </template>
              <template #actions="{ close }">
                <Button
                  class="ad__reset"
                  label="Nei, gå tilbake"
                  variant="secondary"
                  @click="close"
                />

                <Button
                  class="ad__reset"
                  label="Ja, tilbakestill innhold"
                  variant="primary"
                  @click="
                    () => {
                      reset()
                      close()
                    }
                  "
                />
              </template>
            </Dialog>

            <Button
              v-if="!modelValue.code"
              class="ad__reset"
              :label="'Lagre utkast'"
              variant="secondary"
              @click="saveDraft"
              :promise="savingDraftPromise"
            >
            </Button>
          </div>
          <div class="k-card__subtitle">
            <div>
              Her kan du få et overblikk over informasjonen som sendes til Finn,
              og hvor den finnes i løsningen.
            </div>
            <div>Her kan du også justere detaljer tilknyttet din annonse.</div>
          </div>
        </template>

        <template #default>
          <Flex direction="column" gap="2rem">
            <Expandable
              :expanded="true"
              v-if="hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF', 'HEADING')"
            >
              <template #title>
                <span>
                  {{
                    hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                      ? 'Hovedtittel og undertittel'
                      : 'Hovedtittel'
                  }}
                </span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="
                    hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                      ? 'Teksten du skriver her vises som hovedtittelen og undertittel i annonsen.'
                      : 'Teksten du skriver her vises som hovedtittel i annonsen.'
                  "
                  src="https://assets.kvass.no/67c7181792504cdf70aba68d"
                />
              </template>
              <template #default>
                <FormControl
                  v-if="hasField('HOUSING_UNIT_REF')"
                  v-bind="validate('HOUSING_UNIT_REF')"
                  :label="
                    hasField('PROJECT_NAME')
                      ? 'Leilighetsnr'
                      : 'Hovedtittel for annonsen'
                  "
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('HOUSING_UNIT_REF') },
                  ]"
                >
                  <Input v-model="data.HOUSING_UNIT_REF">
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('HOUSING_UNIT_REF').icon"
                        v-tooltip="{
                          content: getIsEditedBind('HOUSING_UNIT_REF').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>

                <FormControl
                  v-if="hasField('PROJECT_NAME')"
                  v-bind="validate('PROJECT_NAME')"
                  label="Hovedtittel for annonsen"
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('PROJECT_NAME') },
                  ]"
                >
                  <Input v-model="data.PROJECT_NAME">
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('PROJECT_NAME').icon"
                        v-tooltip="{
                          content: getIsEditedBind('PROJECT_NAME').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>
                <!-- 
                BOLIGNUMMER does not show up on the finn ads
              <FormControl
                v-if="hasField('BOLIGNUMMER')"
                v-bind="validate('BOLIGNUMMER')"
                label="Hovedtittel for annonsen"
                :class="[
                  'ad__field',
                  { 'ad__field--edited': isEdited('BOLIGNUMMER') },
                ]"
              >
                <Input v-model="data.BOLIGNUMMER">
                  <template #suffix>
                      <Icon
                          :icon="getIsEditedBind('BOLIGNUMMER').icon"
                          v-tooltip="{
                            content: getIsEditedBind('BOLIGNUMMER').label,
                            container: false,
                          }"
                        ></Icon>
                  </template>
                </Input>
              </FormControl> -->

                <FormControl
                  v-if="hasField('HEADING')"
                  v-bind="validate('HEADING')"
                  :label="
                    hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                      ? 'Undertittel'
                      : 'Hovedtittel'
                  "
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('HEADING') },
                  ]"
                >
                  <Input v-model="data.HEADING">
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('HEADING').icon"
                        v-tooltip="{
                          content: getIsEditedBind('HEADING').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              v-if="
                hasFields(
                  'PRICE_SUGGESTION',
                  'COLLECTIVE_DEBT',
                  'SALES_COST_SUM',
                  'TOTAL_PRICE',
                )
              "
            >
              <template #title>
                <span>Prisantydning</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Prisantydning vises slik i Finn annonsen"
                  src="https://assets.kvass.no/67d03cc19b29de28ddebeebf"
                />
              </template>
              <template #default>
                <FormControl
                  v-if="hasField('PRICE_SUGGESTION')"
                  v-bind="validate('PRICE_SUGGESTION')"
                  label="Prisantydning"
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('PRICE_SUGGESTION') },
                  ]"
                >
                  <Input
                    :modelValue="data.PRICE_SUGGESTION"
                    @update:modelValue="
                      (v) =>
                        (data.PRICE_SUGGESTION = Number.isNaN(v) ? null : v)
                    "
                    :mask="{
                      mask: Number,
                      min: 0,
                      scale: 0,
                    }"
                  >
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('PRICE_SUGGESTION').icon"
                        v-tooltip="{
                          content: getIsEditedBind('PRICE_SUGGESTION').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>

                <FormControl
                  v-if="hasField('SALES_COST_SUM')"
                  v-bind="validate('SALES_COST_SUM')"
                  label="Omkostninger"
                  :class="[
                    'ad__field',
                    {
                      'ad__field--edited': isEdited('SALES_COST_SUM'),
                    },
                  ]"
                >
                  <Input
                    :modelValue="data.SALES_COST_SUM"
                    @update:modelValue="
                      (v) => (data.SALES_COST_SUM = Number.isNaN(v) ? null : v)
                    "
                    :mask="{
                      mask: Number,
                      min: 0,
                      scale: 0,
                    }"
                  >
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('SALES_COST_SUM').icon"
                        v-tooltip="{
                          content: getIsEditedBind('SALES_COST_SUM').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>

                <FormControl
                  v-if="hasField('COLLECTIVE_DEBT')"
                  v-bind="validate('COLLECTIVE_DEBT')"
                  label="Fellesgjeld"
                  :class="[
                    'ad__field',
                    {
                      'ad__field--edited': isEdited('COLLECTIVE_DEBT'),
                    },
                  ]"
                >
                  <Input
                    :modelValue="data.COLLECTIVE_DEBT"
                    @update:modelValue="
                      (v) => (data.COLLECTIVE_DEBT = Number.isNaN(v) ? null : v)
                    "
                    :mask="{
                      mask: Number,
                      min: 0,
                      scale: 0,
                    }"
                  >
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('COLLECTIVE_DEBT').icon"
                        v-tooltip="{
                          content: getIsEditedBind('COLLECTIVE_DEBT').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>

                <FormControl
                  v-if="hasField('TOTAL_PRICE')"
                  v-bind="validate('TOTAL_PRICE')"
                  label="Totalpris"
                  :class="[
                    'ad__field',
                    {
                      'ad__field--edited': isEdited('TOTAL_PRICE'),
                    },
                  ]"
                >
                  <Input
                    :modelValue="data.TOTAL_PRICE"
                    @update:modelValue="
                      (v) => (data.TOTAL_PRICE = Number.isNaN(v) ? null : v)
                    "
                    :mask="{
                      mask: Number,
                      min: 0,
                      scale: 0,
                    }"
                  >
                    <template #suffix>
                      <Icon
                        :icon="getIsEditedBind('TOTAL_PRICE').icon"
                        v-tooltip="{
                          content: getIsEditedBind('TOTAL_PRICE').label,
                          container: false,
                        }"
                      ></Icon>
                    </template>
                  </Input>
                </FormControl>
              </template>
            </Expandable>

            <Expandable :expanded="true">
              <template #title>
                <span> Nøkkelinformasjon</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Nøkkelinformasjon vises slik i Finn annonsen"
                  src="https://assets.kvass.no/67c8077992504cdf70aba6f6"
                />
              </template>
              <template #default>
                <Grid columns="2">
                  <FormControl
                    label="Er hytte"
                    v-if="hasField('IS_LEISURE')"
                    v-bind="validate('IS_LEISURE')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('IS_LEISURE'),
                        },
                      ]"
                      :label="data.IS_LEISURE ? 'Ja' : 'Nei'"
                      :items="[
                        {
                          label: 'Nei',
                          action: () => {
                            data.IS_LEISURE = null

                            if (!Array.isArray(data.PROPERTY_TYPE)) return

                            data.PROPERTY_TYPE = data.PROPERTY_TYPE.filter(
                              (v) =>
                                displayProperties.some((p) => p.value === v),
                            )
                          },
                        },
                        {
                          label: 'Ja',
                          action: () => {
                            data.IS_LEISURE = true

                            if (!Array.isArray(data.PROPERTY_TYPE)) return

                            data.PROPERTY_TYPE = data.PROPERTY_TYPE.filter(
                              (v) =>
                                displayProperties.some((p) => p.value === v),
                            )
                          },
                        },
                      ]"
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon
                          :icon="getIsEditedBind('IS_LEISURE').icon"
                          v-tooltip="{
                            content: getIsEditedBind('IS_LEISURE').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <div
                    v-if="hasField('IS_LEISURE') ? !data.IS_LEISURE : false"
                  ></div>

                  <FormControl
                    label="Beliggenhet"
                    v-if="
                      hasField('IS_LEISURE')
                        ? data.IS_LEISURE
                        : hasField('LEISURE_SITUATION')
                    "
                    v-bind="validate('LEISURE_SITUATION')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('LEISURE_SITUATION'),
                        },
                      ]"
                      :label="
                        LeisureSituation.find(
                          (v) => v.value === data.LEISURE_SITUATION,
                        )?.label || 'Velg...'
                      "
                      :items="
                        LeisureSituation.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.LEISURE_SITUATION = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon
                          :icon="getIsEditedBind('LEISURE_SITUATION').icon"
                          v-tooltip="{
                            content: getIsEditedBind('LEISURE_SITUATION').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="
                      hasFields('PROPERTY_TYPE') &&
                      !Array.isArray(data.PROPERTY_TYPE)
                    "
                    v-bind="validate('PROPERTY_TYPE')"
                    label="Enhetstype"
                    :class="[
                      'ad__dropdown',
                      {
                        'ad__dropdown--edited': isEdited('PROPERTY_TYPE'),
                      },
                    ]"
                  >
                    <Dropdown
                      :label="
                        displayProperties.find(
                          (v) => v.value === data.PROPERTY_TYPE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        displayProperties.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.PROPERTY_TYPE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        />
                        <Icon
                          :icon="getIsEditedBind('PROPERTY_TYPE').icon"
                          v-tooltip="{
                            content: getIsEditedBind('PROPERTY_TYPE').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="hasField('PLOT_AREA')"
                    v-bind="validate('PLOT_AREA')"
                    label="Tomteareal"
                    :class="[
                      'ad__field',
                      {
                        'ad__field--edited': isEdited('PLOT_AREA'),
                      },
                    ]"
                  >
                    <Input
                      :modelValue="data.PLOT_AREA"
                      @update:modelValue="
                        (v) => (data.PLOT_AREA = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('PLOT_AREA').icon"
                          v-tooltip="{
                            content: getIsEditedBind('PLOT_AREA').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    label="Eiet tomt"
                    v-if="hasField('PLOT_IS_OWNED')"
                    v-bind="validate('PLOT_IS_OWNED')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('PLOT_IS_OWNED'),
                        },
                      ]"
                      :label="data.PLOT_IS_OWNED === 'yes' ? 'Ja' : 'Nei'"
                      :items="[
                        {
                          label: 'Nei',
                          action: () => (data.PLOT_IS_OWNED = 'no'),
                        },
                        {
                          label: 'Ja',
                          action: () => (data.PLOT_IS_OWNED = 'yes'),
                        },
                      ]"
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon
                          :icon="getIsEditedBind('PLOT_IS_OWNED').icon"
                          v-tooltip="{
                            content: getIsEditedBind('PLOT_IS_OWNED').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="hasField('RENTAL_PRICE_PER_MONTH')"
                    v-bind="validate('RENTAL_PRICE_PER_MONTH')"
                    label="Månedsleie"
                    :class="[
                      'ad__field',
                      {
                        'ad__field--edited': isEdited('RENTAL_PRICE_PER_MONTH'),
                      },
                    ]"
                  >
                    <Input
                      :modelValue="data.RENTAL_PRICE_PER_MONTH"
                      @update:modelValue="
                        (v) =>
                          (data.RENTAL_PRICE_PER_MONTH = Number.isNaN(v)
                            ? null
                            : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('RENTAL_PRICE_PER_MONTH').icon"
                          v-tooltip="{
                            content: getIsEditedBind('RENTAL_PRICE_PER_MONTH')
                              .label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('NO_OF_ROOMS')"
                    v-bind="validate('NO_OF_ROOMS')"
                    label="Antall rom"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('NO_OF_ROOMS') },
                    ]"
                  >
                    <Input
                      :modelValue="data.NO_OF_ROOMS"
                      @update:modelValue="
                        (v) => (data.NO_OF_ROOMS = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('NO_OF_ROOMS').icon"
                          v-tooltip="{
                            content: getIsEditedBind('NO_OF_ROOMS').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('NO_OF_BEDROOMS')"
                    v-bind="validate('NO_OF_BEDROOMS')"
                    label="Soverom"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('NO_OF_BEDROOMS') },
                    ]"
                  >
                    <Input
                      :modelValue="data.NO_OF_BEDROOMS"
                      @update:modelValue="
                        (v) =>
                          (data.NO_OF_BEDROOMS = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('NO_OF_BEDROOMS').icon"
                          v-tooltip="{
                            content: getIsEditedBind('NO_OF_BEDROOMS').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('AREA_FROM')"
                    v-bind="validate('AREA_FROM')"
                    label="Areal fra"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('AREA_FROM') },
                    ]"
                  >
                    <Input
                      :modelValue="data.AREA_FROM"
                      @update:modelValue="
                        (v) => (data.AREA_FROM = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('AREA_FROM').icon"
                          v-tooltip="{
                            content: getIsEditedBind('AREA_FROM').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('AREA_TO')"
                    v-bind="validate('AREA_TO')"
                    label="Areal til"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('AREA_TO') },
                    ]"
                  >
                    <Input
                      :modelValue="data.AREA_TO"
                      @update:modelValue="
                        (v) => (data.AREA_TO = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('AREA_TO').icon"
                          v-tooltip="{
                            content: getIsEditedBind('AREA_TO').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('PRIMARY_ROOM_AREA')"
                    v-bind="validate('PRIMARY_ROOM_AREA')"
                    label="Primærareal"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('PRIMARY_ROOM_AREA') },
                    ]"
                  >
                    <Input
                      :modelValue="data.PRIMARY_ROOM_AREA"
                      @update:modelValue="
                        (v) =>
                          (data.PRIMARY_ROOM_AREA = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('PRIMARY_ROOM_AREA').icon"
                          v-tooltip="{
                            content: getIsEditedBind('PRIMARY_ROOM_AREA').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('USEABLE_AREA')"
                    v-bind="validate('USEABLE_AREA')"
                    label="Bruksareal (BRA)"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('USEABLE_AREA') },
                    ]"
                  >
                    <Input
                      :modelValue="data.USEABLE_AREA"
                      @update:modelValue="
                        (v) => (data.USEABLE_AREA = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('USEABLE_AREA').icon"
                          v-tooltip="{
                            content: getIsEditedBind('USEABLE_AREA').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('USEABLE_AREA_I')"
                    v-bind="validate('USEABLE_AREA_I')"
                    label="Internt bruksareal (BRA-i)"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('USEABLE_AREA_I') },
                    ]"
                  >
                    <Input
                      :modelValue="data.USEABLE_AREA_I"
                      @update:modelValue="
                        (v) =>
                          (data.USEABLE_AREA_I = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('USEABLE_AREA_I').icon"
                          v-tooltip="{
                            content: getIsEditedBind('USEABLE_AREA_I').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('USEABLE_AREA_E')"
                    v-bind="validate('USEABLE_AREA_E')"
                    label="Eksternt bruksareal (BRA-e)"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('USEABLE_AREA_E') },
                    ]"
                  >
                    <Input
                      :modelValue="data.USEABLE_AREA_E"
                      @update:modelValue="
                        (v) =>
                          (data.USEABLE_AREA_E = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('USEABLE_AREA_E').icon"
                          v-tooltip="{
                            content: getIsEditedBind('USEABLE_AREA_E').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('USEABLE_AREA_B')"
                    v-bind="validate('USEABLE_AREA_B')"
                    label="Innglasset balkong (BRA-b)"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('USEABLE_AREA_B') },
                    ]"
                  >
                    <Input
                      :modelValue="data.USEABLE_AREA_B"
                      @update:modelValue="
                        (v) =>
                          (data.USEABLE_AREA_B = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('USEABLE_AREA_B').icon"
                          v-tooltip="{
                            content: getIsEditedBind('USEABLE_AREA_B').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('GROSS_AREA')"
                    v-bind="validate('GROSS_AREA')"
                    label="Bruttoareal (BTA)"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('GROSS_AREA') },
                    ]"
                  >
                    <Input
                      :modelValue="data.GROSS_AREA"
                      @update:modelValue="
                        (v) => (data.GROSS_AREA = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('GROSS_AREA').icon"
                          v-tooltip="{
                            content: getIsEditedBind('GROSS_AREA').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('NO_OF_PARKING_SPOTS')"
                    v-bind="validate('NO_OF_PARKING_SPOTS')"
                    label="Antall parkeringsplasser"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('NO_OF_PARKING_SPOTS') },
                    ]"
                  >
                    <Input
                      :modelValue="data.NO_OF_PARKING_SPOTS"
                      @update:modelValue="
                        (v) =>
                          (data.NO_OF_PARKING_SPOTS = Number.isNaN(v)
                            ? null
                            : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('NO_OF_PARKING_SPOTS').icon"
                          v-tooltip="{
                            content: getIsEditedBind('NO_OF_PARKING_SPOTS')
                              .label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('FLOOR')"
                    v-bind="validate('FLOOR')"
                    label="Etasje"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('FLOOR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.FLOOR"
                      @update:modelValue="
                        (v) => (data.FLOOR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('FLOOR').icon"
                          v-tooltip="{
                            content: getIsEditedBind('FLOOR').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('NO_OF_FLOORS')"
                    v-bind="validate('NO_OF_FLOORS')"
                    label="Antall etasjer"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('NO_OF_FLOORS') },
                    ]"
                  >
                    <Input
                      :modelValue="data.NO_OF_FLOORS"
                      @update:modelValue="
                        (v) => (data.NO_OF_FLOORS = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('NO_OF_FLOORS').icon"
                          v-tooltip="{
                            content: getIsEditedBind('NO_OF_FLOORS').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('CONSTRUCTION_YEAR')"
                    v-bind="validate('CONSTRUCTION_YEAR')"
                    label="Byggeår"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('CONSTRUCTION_YEAR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.CONSTRUCTION_YEAR"
                      @update:modelValue="
                        (v) =>
                          (data.CONSTRUCTION_YEAR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('CONSTRUCTION_YEAR').icon"
                          v-tooltip="{
                            content: getIsEditedBind('CONSTRUCTION_YEAR').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('RENOVATED_YEAR')"
                    v-bind="validate('RENOVATED_YEAR')"
                    label="Renoveringsår"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('RENOVATED_YEAR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.RENOVATED_YEAR"
                      @update:modelValue="
                        (v) =>
                          (data.RENOVATED_YEAR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('RENOVATED_YEAR').icon"
                          v-tooltip="{
                            content: getIsEditedBind('RENOVATED_YEAR').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    label="Energimerking"
                    v-if="hasField('ENERGY_LABEL')"
                    v-bind="validate('ENERGY_LABEL')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('ENERGY_LABEL'),
                        },
                      ]"
                      :label="
                        energyLabel.find((v) => v.value === data.ENERGY_LABEL)
                          ?.label || 'Velg...'
                      "
                      :items="
                        energyLabel.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.ENERGY_LABEL = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        />
                        <Icon
                          :icon="getIsEditedBind('ENERGY_LABEL').icon"
                          v-tooltip="{
                            content: getIsEditedBind('ENERGY_LABEL').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    label="Energimerking (farge)"
                    v-if="hasField('ENERGY_LABEL_COLOR_CODE')"
                    v-bind="validate('ENERGY_LABEL_COLOR_CODE')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited(
                            'ENERGY_LABEL_COLOR_CODE',
                          ),
                        },
                      ]"
                      :label="
                        energyLabelColor.find(
                          (v) => v.value === data.ENERGY_LABEL_COLOR_CODE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        energyLabelColor.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.ENERGY_LABEL_COLOR_CODE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-xs"
                        />
                        <Icon
                          :icon="
                            getIsEditedBind('ENERGY_LABEL_COLOR_CODE').icon
                          "
                          v-tooltip="{
                            content: getIsEditedBind('ENERGY_LABEL_COLOR_CODE')
                              .label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    label="Eiertype"
                    v-if="hasField('OWNERSHIP_TYPE')"
                    v-bind="validate('OWNERSHIP_TYPE')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        { 'ad__dropdown--edited': isEdited('OWNERSHIP_TYPE') },
                      ]"
                      :keepOpen="true"
                      :label="
                        OwnershipTypes.find(
                          (v) => v.value === data.OWNERSHIP_TYPE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        OwnershipTypes.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.OWNERSHIP_TYPE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon
                          :icon="getIsEditedBind('OWNERSHIP_TYPE').icon"
                          v-tooltip="{
                            content: getIsEditedBind('OWNERSHIP_TYPE').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="hasField('BEDROOMS_FROM')"
                    v-bind="validate('BEDROOMS_FROM')"
                    label="Soverom fra"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('BEDROOMS_FROM') },
                    ]"
                  >
                    <Input
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                      :modelValue="data.BEDROOMS_FROM"
                      @update:modelValue="
                        (v) => (data.BEDROOMS_FROM = Number.isNaN(v) ? null : v)
                      "
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('BEDROOMS_FROM').icon"
                          v-tooltip="{
                            content: getIsEditedBind('BEDROOMS_FROM').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('BEDROOMS_TO')"
                    v-bind="validate('BEDROOMS_TO')"
                    label="Soverom til"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('BEDROOMS_TO') },
                    ]"
                  >
                    <Input
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                      :modelValue="data.BEDROOMS_TO"
                      @update:modelValue="
                        (v) => (data.BEDROOMS_TO = Number.isNaN(v) ? null : v)
                      "
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedBind('BEDROOMS_TO').icon"
                          v-tooltip="{
                            content: getIsEditedBind('BEDROOMS_TO').label,
                            container: false,
                          }"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>
                </Grid>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              v-if="
                hasFields('PROPERTY_TYPE') && Array.isArray(data.PROPERTY_TYPE)
              "
            >
              <template #title>
                <span>Enhetstyper for annonsen</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Enhetstypene som velges her vil bli synlig under enhetstyper på Finn-annonsen. De vil også være tilgjengelige som filtre i søkelisten."
                  src="https://assets.kvass.no/67c8203b92504cdf70aba768"
                />
              </template>

              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('PROPERTY_TYPE'),
                    },
                  ]"
                  :icon="getIsEditedBind('PROPERTY_TYPE').icon"
                  v-tooltip="{
                    content: getIsEditedBind('PROPERTY_TYPE').label,
                    container: false,
                  }"
                ></Icon>
              </template>
              <template #default>
                <FormControl
                  v-bind="validate('PROPERTY_TYPE')"
                  label="Tilgjengelige lokaler"
                  v-if="hasField('PROPERTY_TYPE')"
                >
                  <Checkbox
                    v-for="item in displayProperties"
                    v-model="data.PROPERTY_TYPE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>
              </template>
            </Expandable>

            <Expandable :expanded="true" v-if="hasFields('MEDIA')">
              <template #title>
                <span>Bilder</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Bildene hentes fra prosjektsiden. Det første bildet blir forsidebildet i Finn-annonsen."
                  src="https://assets.kvass.no/67c8088692504cdf70aba702"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('MEDIA'),
                    },
                  ]"
                  :icon="getIsEditedBind('MEDIA').icon"
                  v-tooltip="{
                    content: getIsEditedBind('MEDIA').label,
                    container: false,
                  }"
                ></Icon>
              </template>
              <template #default>
                <Media
                  v-if="hasFields('MEDIA')"
                  v-model="data.MEDIA"
                  label="Bilder i Finn-annonsen"
                  dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
                  :accept="['image/jpeg', 'image/png', 'image/jpg']"
                  :upload="uploadFunction"
                  :types="['Image']"
                  :multiple="true"
                  :sortable="true"
                  :description="true"
                  placement="outside"
                  size="contain"
                  :labels="{
                    selectMessage:
                      'Trykk på knappen nedenfor for å laste opp andre filtyper',
                    select: 'Velg',
                    cancel: 'Avbryt',
                    save: 'Bekreft',
                    descriptionPlaceholder: '',
                    image: {
                      createLabel: 'Bilde',
                      preview: '',
                      inputLabel: '',
                      error: '',
                    },
                  }"
                >
                </Media>
              </template>
            </Expandable>

            <Expandable :expanded="true" v-if="hasFields('FLOORPLAN_MEDIA')">
              <template #title>
                <span>Plantegninger</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Plantegninger vises sist i bildegalleriet eller som en egen knapp i galleriet med navnet «Plantegninger». Dette avhenger av hva annonsetypen støtter."
                  src="https://assets.kvass.no/67d1501f9b29de28ddec33d9"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('FLOORPLAN_MEDIA'),
                    },
                  ]"
                  :icon="getIsEditedBind('FLOORPLAN_MEDIA').icon"
                  v-tooltip="{
                    content: getIsEditedBind('FLOORPLAN_MEDIA').label,
                    container: false,
                  }"
                ></Icon>
              </template>
              <template #default>
                <File
                  :rename="false"
                  v-if="hasFields('FLOORPLAN_MEDIA')"
                  v-model="data.FLOORPLAN_MEDIA"
                  label="Plantegninger i Finn-annonsen"
                  dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
                  :accept="['image/jpeg', 'image/png', 'image/jpg']"
                  :upload="uploadFunction"
                  :uploadOptions="{}"
                  :multiple="true"
                  :sortable="true"
                  :labels="{
                    delete: 'Slett',
                    download: 'Last ned',
                    copy: 'Kopier lenke',
                  }"
                >
                </File>
              </template>
            </Expandable>

            <RichTextMultiple
              :expanded="true"
              v-if="hasFields('GENERAL_DESCRIPTION')"
              v-model="data.GENERAL_DESCRIPTION"
            >
              <template #title>
                <span>Beskrivelse</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Teksten du skriver her vises under beskrivelsen i Finn-annonsen."
                  src="https://assets.kvass.no/67c80a5792504cdf70aba732"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited': isEdited(
                        'GENERAL_DESCRIPTION',
                      ),
                    },
                  ]"
                  :icon="getIsEditedBind('GENERAL_DESCRIPTION').icon"
                  v-tooltip="{
                    content: getIsEditedBind('GENERAL_DESCRIPTION').label,
                    container: false,
                  }"
                ></Icon>
              </template>
            </RichTextMultiple>

            <ExpandableList
              :expanded="true"
              :template="{ GENERAL_HEADING: '', GENERAL_TEXT: '' }"
              v-model="data.GENERAL_TEXT_REALESTATE"
              v-if="hasFields('GENERAL_TEXT_REALESTATE')"
            >
              <template #title>
                <span>Beskrivelse</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Teksten du skriver her vises under beskrivelsen i Finn-annonsen."
                  src="https://assets.kvass.no/67c80a5792504cdf70aba732"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited': isEdited(
                        'GENERAL_TEXT_REALESTATE',
                      ),
                    },
                  ]"
                  :icon="getIsEditedBind('GENERAL_TEXT_REALESTATE').icon"
                  v-tooltip="{
                    content: getIsEditedBind('GENERAL_TEXT_REALESTATE').label,
                    container: false,
                  }"
                ></Icon>
              </template>

              <template #default="{ item }">
                <FormControl label="Tittel">
                  <Input v-model="item.GENERAL_HEADING"></Input>
                </FormControl>
                <FormControl label="Tekst">
                  <RichText
                    placeholder="Skriv her..."
                    :actions="['bold', 'italic', 'orderedList', 'bulletList']"
                    v-model="item.GENERAL_TEXT"
                  >
                  </RichText>
                </FormControl>
              </template>
            </ExpandableList>

            <Expandable
              :expanded="true"
              v-if="hasFields('ESTATE_PREFERENCE', 'PROJECT_PREFERENCE')"
            >
              <template #title>
                <span>
                  {{
                    hasField('PROJECT_PREFERENCE')
                      ? 'Fasiliteter i prosjektannonsen'
                      : 'Fasiliteter i annonsen'
                  }}
                </span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Fasilitenene som velges her vil bli synlig under fasiliteter på Finn-annonsen. De vil også være tilgjengelige som filtre i søkelisten."
                  src="https://assets.kvass.no/67c80a4c92504cdf70aba70e"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited': hasField(
                        'PROJECT_PREFERENCE',
                      )
                        ? isEdited('PROJECT_PREFERENCE')
                        : isEdited('ESTATE_PREFERENCE'),
                    },
                  ]"
                  :icon="
                    hasField('PROJECT_PREFERENCE')
                      ? getIsEditedBind('PROJECT_PREFERENCE').icon
                      : getIsEditedBind('ESTATE_PREFERENCE').icon
                  "
                  v-tooltip="{
                    content: hasField('PROJECT_PREFERENCE')
                      ? getIsEditedBind('PROJECT_PREFERENCE').label
                      : getIsEditedBind('ESTATE_PREFERENCE').label,
                    container: false,
                  }"
                ></Icon>
              </template>
              <template #default>
                <FormControl
                  class="facilities"
                  label="Tilgjengelige fasiliteter"
                  v-if="hasField('PROJECT_PREFERENCE')"
                >
                  <Checkbox
                    v-for="item in facilities.filter((v) =>
                      v.categories.includes(modelValue.type),
                    )"
                    v-model="data.PROJECT_PREFERENCE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>

                <FormControl
                  class="facilities"
                  label="Tilgjengelige fasiliteter"
                  v-if="hasField('ESTATE_PREFERENCE')"
                >
                  <Checkbox
                    v-for="item in facilities.filter((v) =>
                      v.categories.includes(modelValue.type),
                    )"
                    v-model="data.ESTATE_PREFERENCE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>
              </template>
            </Expandable>

            <Expandable :expanded="true" v-if="units.length">
              <template #title>
                <span> Valgte enheter til Finn-annonsen </span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Slik vises de valgte enhetene i Finn-annonsen."
                  src="https://assets.kvass.no/67c80a5a92504cdf70aba73e"
                />
              </template>
              <template #default>
                <UnitTable
                  :initialUnitFields="initialUnitFields"
                  :units="units"
                  v-model="modelValue"
                  :facilities="unitFacilities"
                ></UnitTable>
              </template>
            </Expandable>

            <template v-if="addressError">
              <Expandable
                title="Adresse"
                subtitle="Om du vil endre adresse må du tilpasse denne på grunnlag."
                :expandable="false"
                :expanded="false"
              >
                <template #actions>
                  <Button
                    class="ad__navigate-button"
                    variant="primary"
                    label="Gå til Grunnlag"
                    is="a"
                    target="_blank"
                    :href="getProjectStepUrl('basis')"
                    iconRight="fa-pro-light:arrow-up-right-from-square"
                  >
                  </Button>
                </template>
              </Expandable>
              <Alert
                variant="danger"
                :content="addressError"
                icon="fa-pro-light:exclamation-triangle"
              >
              </Alert>
            </template>

            <Expandable
              :expandable="false"
              :expanded="false"
              v-if="
                hasFields(
                  'PHASE_PLANNING',
                  'PHASE_SALE_START',
                  'PHASE_DEVELOPMENT_START',
                  'PHASE_MOVE_IN',
                  'CURRENT_PHASE',
                )
              "
            >
              <template #title>
                <span>Prosjektstatus</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="For å endre prosjektstatus må du tilpasse den i presentasjonen. Slik vises prosjektstatus i Finn-annonsen."
                  src="https://assets.kvass.no/67c80a5492504cdf70aba726"
                />
              </template>
              <template #actions>
                <Button
                  class="ad__navigate-button"
                  variant="primary"
                  label="Gå til Presentasjon"
                  is="a"
                  target="_blank"
                  :href="getProjectStepUrl('presentation')"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                >
                </Button>
              </template>
            </Expandable>

            <Expandable :expandable="false" :expanded="false">
              <template #title>
                <span>Kundebehandler</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="For å endre kontaktperson må du tilpasse hvem som er kundebehandler under «roller». Slik vises kundebehandler i Finn-annonsen."
                  src="https://assets.kvass.no/67c80a5092504cdf70aba71a"
                />
              </template>
              <template #actions>
                <Button
                  class="ad__navigate-button"
                  variant="primary"
                  label="Gå til Roller"
                  is="a"
                  target="_blank"
                  :href="getProjectStepUrl('roles')"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                >
                </Button>
              </template>
            </Expandable>
            <Alert
              v-if="brokerError"
              variant="danger"
              :content="brokerError"
              icon="fa-pro-light:exclamation-triangle"
            >
            </Alert>

            <ExpandableList
              :expanded="true"
              v-if="hasFields('MOREINFO')"
              :limit="4"
              :template="{ URL: '', URLTEXT: '' }"
              v-model="data.MOREINFO"
            >
              <template #title>
                <span>Nyttige lenker i Finn-annonsen</span>
                <Tooltip
                  class="k-ml-xxs"
                  content="Nyttige lenker vises her i Finn-annonsen. Noen felt er standard og låst av Finn, derfor vises lenken til prosjektsiden alltid automatisk. Du kan fritt legge til egne lenker og lenker til andre nettsteder."
                  src="https://assets.kvass.no/67c80a5e92504cdf70aba756"
                />
              </template>
              <template #actions>
                <Icon
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('MOREINFO'),
                    },
                  ]"
                  :icon="getIsEditedBind('MOREINFO').icon"
                  v-tooltip="{
                    content: getIsEditedBind('MOREINFO').label,
                    container: false,
                  }"
                ></Icon>
              </template>

              <template
                #before-content
                v-if="
                  hasFields('ESTATE_EXTERNAL_URL', 'ESTATE_EXTERNAL_ORDER_URL')
                "
              >
                <Grid columns="2">
                  <template v-if="hasField('ESTATE_EXTERNAL_URL')">
                    <FormControl label="URL til nyttig lenke">
                      <Input
                        v-model="data.ESTATE_EXTERNAL_URL"
                        suffix="URL"
                        disabled
                      ></Input>
                    </FormControl>
                    <FormControl
                      label="Visningsnavn på lenken på Finn-annonsen"
                    >
                      <Input
                        modelValue="Se prosjektets hjemmeside"
                        disabled
                      ></Input>
                    </FormControl>
                  </template>
                  <template v-if="hasField('ESTATE_EXTERNAL_ORDER_URL')">
                    <FormControl label="URL til nyttig lenke">
                      <Input
                        v-model="data.ESTATE_EXTERNAL_ORDER_URL"
                        suffix="URL"
                        disabled
                      ></Input>
                    </FormControl>
                    <FormControl
                      label="Visningsnavn på lenken på Finn-annonsen"
                    >
                      <Input modelValue="Bestill salgsoppgave" disabled></Input>
                    </FormControl>
                  </template>
                </Grid>

                <div class="ad__expandable-list-divider"></div>
              </template>

              <template #default="{ item: data }">
                <Grid columns="2">
                  <FormControl label="URL til nyttig lenke">
                    <Input v-model="data.URL" suffix="URL"></Input>
                  </FormControl>
                  <FormControl label="Visningsnavn på lenken på Finn-annonsen">
                    <Input v-model="data.URLTEXT"></Input>
                  </FormControl>
                </Grid>
              </template>
            </ExpandableList>
          </Flex>
        </template>
        <template #actions>
          <Button
            icon="fa-pro-light:chevron-left"
            label="Gå tilbake"
            variant="secondary"
            @click="onPrev"
          />

          <Button
            v-if="!modelValue.code"
            :label="'Lagre utkast'"
            variant="secondary"
            @click="saveDraft"
            :promise="savingDraftPromise"
          >
          </Button>

          <Button
            :loading="loading"
            v-tooltip="{
              content: Object.entries(validator.errors.value.errors)
                .map(([key, value]) => value)
                .flat()
                .join('\n'),
              disabled: validator.passes.value,
              container: false,
            }"
            :label="getNextLabel()"
            variant="primary"
            icon-right="fa-pro-solid:arrow-right"
            @click="
              () => {
                if (!validator.passes || loading) return
                onNext()
              }
            "
            :disabled="!validator.passes.value"
          />
        </template>
      </Card>
    </KeepAlive>
  </div>
</template>

<style lang="scss">
.ad {
  &__title {
    display: flex;
    flex-direction: row;
    gap: var(--k-ui-spacing-xs);
    span {
      margin-right: auto;
    }
  }

  &__go-back.k-button,
  &__reset.k-button {
    font-weight: normal;
    font-size: 1rem;
  }

  .facilities {
    .k-formcontrol__label {
      grid-column: 1/-1;
    }
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  &__alert {
    margin-bottom: 2rem;

    .k-alert__icon {
      padding: var(--k-ui-spacing-lg);
    }
  }

  .ad__field {
    --k-input-prefix-background: white;
    --k-input-prefix-text: var(--k-ui-color-neutral-dark);

    svg {
      color: var(--synced-icon);
    }

    .k-input__input {
      color: var(--k-ui-color-neutral-dark);
    }

    &--edited {
      --k-input-prefix-text: var(--k-ui-color-neutral-darkest);

      svg {
        color: var(--edited-icon);
      }

      .k-input__input {
        color: var(--k-ui-color-neutral-darkest);
      }
    }
  }

  &__dropdown {
    --k-button-secondary-background: white;
    --k-button-secondary-text: var(--k-ui-color-neutral-dark);

    --k-button-secondary-background-hover: var(--k-ui-color-neutral-lightest);
    --k-button-secondary-background-active: var(--k-ui-color-neutral-light);

    --k-button-medium-padding-inline: var(--k-ui-spacing-sm);
    --k-button-medium-padding-block: var(--k-ui-spacing-sm);

    svg:last-of-type {
      color: var(--synced-icon);
    }

    &--edited {
      --k-button-secondary-text: var(--k-ui-color-neutral-darkest);

      svg:last-of-type {
        color: var(--edited-icon);
      }
    }
  }

  &__expandable-list-divider {
    margin-block: 1rem;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -1rem; /* Extend left */
      width: calc(100% + 2rem); /* Extend width by 2rem (1rem on each side) */
      height: var(--k-expandable-border-width, 1px);
      background-color: var(
        --k-expandable-border-color,
        var(--k-ui-color-neutral)
      );
    }
  }

  &__expandable-list-field-icon {
    background: white;
    border-radius: var(--k-ui-rounding-full);
    overflow: visible;
    padding: var(--k-ui-spacing-xs);
    line-height: 1;

    // font-size: 0.75em;

    color: var(--synced-icon);

    &--edited {
      color: var(--edited-icon);
    }
  }

  &__navigate-button {
    --k-button-medium-font-size: 1rem;
  }

  // &__highlight {
  //   font-size: 2rem;
  //   color: var(--k-ui-color-neutral-dark);

  //   &--selected {
  //     color: var(--primary, var(--k-ui-color-primary));
  //   }
  // }
}
</style>
