<script setup>
import { FormControl, Input, Button, Alert, Spinner, Flex } from '@kvass/ui'
import { ref, useHost } from 'vue'
import { getLabel as getLabelFactory } from '../../utils/index.js'
const host = useHost()
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
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['input'])

const t = getLabelFactory(props.labels, {
  verificationKey: 'Verification key',
  submit: 'Send inn',
  confirmationInstructions:
    'Du må gå til Google Search Console og klikke bekreft',
  goThere: 'Gå dit',
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
  console.log(host)

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
    emit('input', verification_key.value)
    /* setInterval(() => {
      return fetch(
        `${props.app_url}/api/integration/${props.integration_id}/callbacks/isPageVerified`,
      )
        .then((res) => {
          return res.json()
        })
        .then(({ verified }) => {
          if (verified) {
            redirect()
          }
        })
    }, 5000) */
  })
}
</script>

<template>
  <div class="kvass-gsc-verification-key-form__wrapper">
    <div class="kvass-gsc-verification-key-form">
      <form @submit.prevent="submit">
        <Flex>
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
        <Alert variant="info">
          <Flex>
            <p>{{ t('confirmationInstructions') }}</p>
            <Button
              is="a"
              href="https://search.google.com/search-console/welcome"
              :label="t('goThere')"
            />
          </Flex>
          <Spinner />
        </Alert>
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
  }
}
</style>
