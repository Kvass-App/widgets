<script setup>
import { FormControl, Input, Button, Alert, Spinner, Flex } from '@kvass/ui'
import { ref, useTemplateRef } from 'vue'
import { getLabel as getLabelFactory } from '../../utils/index.js'
const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  integration_id: {
    required: true,
    type: String,
  },
  app_url: {
    required: true,
    type: String,
  },
  reference_id: {
    required: true,
    type: String,
  },
  reference_type: {
    required: true,
    type: String,
  },
  page_url: {
    required: true,
    type: String,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['input'])

const t = getLabelFactory(props.labels, {
  verificationKey: 'Verification key',
  urlMessage:
    'Lim inn denne URLen i Google Search Console, under "Nettadresseprefiks" og velg HTML-tag. Klikk kopier og lim inn hele tagen i feltet under. URL:',
  submit: 'Send inn',
  confirmationInstructions:
    'Du må gå til Google Search Console og klikke bekreft',
  toGSC: 'Gå til Google Search Console',
})

const verification_key = ref(props.value)
const posted = ref(false)

// Sender tag til endepunkt, slik at det faktisk blir lagt inn.
// Må deretter sende bruker til gsc for å trykke bekreft
// Må kontinuerlig sende calls til en callback for å sjekke om bekreftet,
// Når fungerer blir man redirected tilbake

function redirect() {
  return `${ANALYTICS_DASHBOARD_URL}`
}

function submit() {
  return fetch(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/addVerificationKey`,
    {
      method: 'POST',
      body: JSON.stringify({
        verification_key:
          /content="([^"]+)"/.exec(verification_key.value)?.[1] ||
          verification_key.value,
      }),
    },
  ).then(() => {
    posted.value = true
    setInterval(() => {
      return fetch(
        `${props.app_url}/api/integration/${props.integration_id}/callbacks/isPageVerified`,
      )
        .then((res) => {
          return res.json()
        })
        .then(({ verified }) => {
          if (verified) {
            window.location.href = `${props.app_url}/analytics/${
              props.reference_id
            }?type=${props.reference_type.toLowerCase()}`
          }
        })
    }, 5000)
  })
}

const copyProgressStyle = ref('width: 100%;')
const showCopied = ref(false)
async function copyURL(e) {
  await navigator.clipboard.writeText(e.srcElement.innerHTML)

  copyProgressStyle.value = 'width: 100%;'
  setTimeout(() => (copyProgressStyle.value = 'width: 0%;'), 10)
  showCopied.value = true
  setTimeout(() => {
    showCopied.value = false
  }, 2000)
}
</script>

<template>
  <div class="kvass-gsc-verification-key-form__wrapper">
    <div class="kvass-gsc-verification-key-form">
      <form @submit.prevent="submit">
        <h2>Google Search Console Verification Key</h2>
        <Flex>
          <Alert
            variant="info"
            class="kvass-gsc-verification-key-form__page-url__wrapper"
            >{{ t('urlMessage') }}
            <span>
              <div
                class="kvass-gsc-verification-key-form__page-url"
                @click="copyURL"
              >
                {{ props.page_url }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  />
                </svg>
              </div>
            </span>
          </Alert>
          <Button
            variant="secondary"
            is="a"
            target="_blank"
            href="https://search.google.com/search-console/welcome"
            :label="t('toGSC')"
          />
          <FormControl :label="t('verificationKey')">
            <Input type="text" v-model="verification_key" />
          </FormControl>
          <Button
            type="submit"
            :label="t('submit')"
            :disabled="posted"
          ></Button>
        </Flex>
      </form>
      <div v-if="posted">
        <Alert variant="neutral">
          <Flex>
            <p>{{ t('confirmationInstructions') }}</p>
            <Spinner />
          </Flex>
        </Alert>
      </div>
      <div class="kvass-gsc-verification-key-form__toast" v-if="showCopied">
        <span>{{ props.page_url }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <div
          :style="copyProgressStyle"
          class="kvass-gsc-verification-key-form__toast-progress"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-gsc-verification-key-form {
  &__wrapper {
    color: var(--kvass-gsc-verification-key-form-color, inherit);
    font-size: var(--kvass-gsc-verification-key-form-font-size, inherit);
    font-family: var(--kvass-gsc-verification-key-form-font-family, inherit);
  }
  // Default variables
  --__kvass-gsc-verification-key-form-background-color: #f8f8f8;
  --__kvass-gsc-verification-key-form-max-width: 100%;
  --__kvass-gsc-verification-key-form-size: 25vw;
  --__kvass-gsc-verification-key-form-size-min: 400px;
  --__kvass-gsc-verification-key-form-size-max: 800px;
  --__kvass-gsc-verification-key-form-border: 1px solid #dbdada;
  --__kvass-gsc-verification-key-form-height: 100%;

  background-color: var(
    --kvass-gsc-verification-key-form-background-color,
    var(--__kvass-gsc-verification-key-form-background-color)
  );
  max-width: var(
    --kvass-gsc-verification-key-form-querytab-max-width,
    var(--__kvass-gsc-verification-key-form-max-width)
  );

  height: var(
    --kvass-gsc-verification-key-form-height,
    var(--__kvass-gsc-verification-key-form-height)
  );

  border: var(
    --kvass-gsc-verification-key-form-border,
    var(--__kvass-gsc-verification-key-form-border)
  );

  border-radius: var(--kvass-gsc-verification-key-form-border-radius, 6px);
  padding: 2rem;
  h2 {
    margin-bottom: 1rem;
  }

  .k-flex {
    flex-direction: column;
    align-items: start;
    margin-bottom: 1rem;
  }

  .k-alert__content > .k-flex {
    flex-direction: row;
    align-items: center;
  }

  &__page-url {
    &__wrapper {
      .k-alert__content {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    display: flex;
    height: 20px;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;

    &:hover {
      cursor: pointer;
      background-color: rgb(226, 223, 223);
    }
  }

  &__toast {
    display: flex;
    height: 20px;
    gap: 0.4rem;
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: whitesmoke;
    border: 1px solid #dbdada;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 1px 1px #dbdada;

    &-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: rgb(189, 185, 185);
      transition: width 2s linear;
    }
  }
}
</style>
