<script setup>
import {
  FormControl,
  Input,
  Button,
  Alert,
  Spinner,
  Flex,
  Icon,
} from '@kvass/ui'
import { ref } from 'vue'
import { getLabel as getLabelFactory } from '../../utils/index.js'
import WebFont from 'webfontloader'

WebFont.load({
  google: {
    families: ['Lato'],
  },
})

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

const t = getLabelFactory(props.labels, {
  instructionDescription:
    'Følg oppskriften for å sette opp Google Search Console',
  open: 'Åpne',
  instructionStep2: 'Naviger til "Nettadresseprefiks"',
  instructionStep3: 'Lim inn URLen til prosjektsiden i Google Search Console.',
  url: 'URL til prosjektsiden',
  instructionStep4: 'Velg HTML tag',
  instructionStep5: 'Lim HTML tagen inn i feltet under',
  copyCode: 'Lim inn kode',
  submit: 'Bekreft koden',
  instructionStep6:
    'Naviger til Google Search Console, og bekreft på samme plass man kopierte HTML-tag.',
  instructionStep7:
    'Når koden er bekreftet blir du sendt tilbake til oversikten.',
})

const verification_key = ref(props.value)
const posted = ref(false)

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
  <div class="kvass-gsc-verification-key-form__header">
    <h2>Google Search Console HTML-tag</h2>
    <p>{{ t('instructionDescription') }}</p>
  </div>
  <div class="kvass-gsc-verification-key-form__wrapper">
    <div class="kvass-gsc-verification-key-form">
      <form @submit.prevent="submit">
        <Flex direction="column" align="start">
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" />
            </span>
            <span>
              {{ t('open') }}
              <a
                target="_blank"
                href="https://search.google.com/search-console/welcome"
                >Google Search Console
              </a>
            </span>
          </Alert>
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" />
            </span>
            {{ t('instructionStep2') }}
          </Alert>
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" />
            </span>
            {{ t('instructionStep3') }}
          </Alert>
          <ul>
            <li>
              {{ t('url') }}:
              <span
                class="kvass-gsc-verification-key-form__page-url"
                @click="copyURL"
                >{{ props.page_url }}
              </span>
              <Icon icon="fa-pro-light:copy" />
            </li>
          </ul>
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" />
            </span>
            {{ t('instructionStep4') }}</Alert
          >
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" />
            </span>
            {{ t('instructionStep5') }}
          </Alert>
          <Flex
            direction="row"
            class="kvass-gsc-verification-key-form__submit-wrapper"
          >
            <FormControl>
              <Input
                type="text"
                :placeholder="t('copyCode')"
                v-model="verification_key"
              />
            </FormControl>
            <Button
              type="submit"
              :label="t('submit')"
              :disabled="posted"
              variant="primary"
            ></Button>
          </Flex>
          <Alert>
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-regular:circle" /> </span
            >{{ t('instructionStep6') }}
          </Alert>
          <Alert class="kvass-gsc-verification-key-form__success">
            <span class="kvass-gsc-verification-key-form__icon-wrapper">
              <Icon icon="fa-pro-solid:check" />
            </span>
            {{ t('instructionStep7') }}
          </Alert>
        </Flex>
      </form>
      <div class="kvass-gsc-verification-key-form__toast" v-if="showCopied">
        <span>{{ props.page_url }}</span>
        <Icon icon="fa-pro-light:copy" />
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
  &__header {
    max-width: 600px;
    box-sizing: border-box;

    background-color: #f8f8f8;
    padding: 30px;
    border-radius: 10px 10px 0 0;
    font-family: 'Lato';
    h2 {
      margin-top: 0;
    }
    p {
      margin: 0;
    }
  }

  &__wrapper {
    color: var(--kvass-gsc-verification-key-form-color, inherit);
    font-size: var(--kvass-gsc-verification-key-form-font-size, inherit);
    font-family: var(--kvass-gsc-verification-key-form-font-family, 'Lato');
    max-width: 600px;

    box-shadow: 0px 1px 3.62px 0px #00000006;

    box-shadow: 0px 2.75px 10.02px 0px #00000009;

    box-shadow: 0px 6.63px 24.12px 0px #0000000c;

    box-shadow: 0px 22px 80px 0px #00000012;
  }
  // Default variables
  --__kvass-gsc-verification-key-form-background-color: white;
  --__kvass-gsc-verification-key-form-max-width: 100%;
  --__kvass-gsc-verification-key-form-size: 25vw;
  --__kvass-gsc-verification-key-form-size-min: 400px;
  --__kvass-gsc-verification-key-form-size-max: 800px;
  --__kvass-gsc-verification-key-form-border: 1px solid #dbdada;
  --__kvass-gsc-verification-key-form-height: 100%;
  --__kvass-gsc-verification-key-form-font-family: 'Lato';

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

  border-radius: var(
    --kvass-gsc-verification-key-form-border-radius,
    0px 0px 10px 10px
  );

  font-family: var(
    --kvass-gsc-verification-key-form-font-family,
    var(--__kvass-gsc-verification-key-form-font-family)
  );

  padding: 30px 60px 60px;
  h2 {
    margin-bottom: 1rem;
  }

  .k-alert {
    width: 100%;
    box-sizing: border-box;

    &__content {
      display: flex;
      gap: 1.3rem;
      margin-left: 1rem;
      flex-direction: row;
      align-items: center;
    }
  }

  &__icon-wrapper {
    display: flex;
  }

  a {
    color: inherit;

    &:hover {
      text-decoration: none;
    }
  }

  &__submit-wrapper {
    width: 100%;
    .k-formcontrol {
      flex-grow: 2;

      .k-input {
        width: 100%;
        line-height: 180%;

        &__input {
          margin-left: 0.5rem;
        }
      }
    }

    .k-button {
      flex-grow: 1;
      &__content {
        justify-content: center;
        line-height: 180%;
      }
    }
  }

  .k-button {
    background-color: var(--k-button-primary-background, #102b37);
  }

  &__page-url {
    font-weight: 900;
    text-decoration: underline;
    margin-right: 5px;

    &:hover {
      cursor: pointer;
      text-decoration: none;
    }
  }

  &__success {
    background-color: #e5f0e6;
    border: none;
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
