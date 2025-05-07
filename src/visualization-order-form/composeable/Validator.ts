import { ValidatorUtils, useValidator } from '@kvass/ui'

import engMessages from 'validatorjs/src/lang/en'
import nbMessages from 'validatorjs/src/lang/nb_NO'
import daMessages from 'validatorjs/src/lang/da'
import svMessages from 'validatorjs/src/lang/sv'

const languageFiles = {
  da: () => daMessages, // import('validatorjs/src/lang/da'),
  // de: () => import('validatorjs/src/lang/de'),
  // el: () => import('validatorjs/src/lang/el'),
  en: () => engMessages, //import('validatorjs/src/lang/en'),
  // es: () => import('validatorjs/src/lang/es'),
  // nl: () => import('validatorjs/src/lang/nl'),
  nb: () => nbMessages, //import('validatorjs/src/lang/nb_NO'),
  // pl: () => import('validatorjs/src/lang/pl'),
  sv: () => svMessages, //import('validatorjs/src/lang/sv'),
}

const setValidatorLangauge = async (lang: string) => {
  if (!languageFiles[lang]) lang = 'en'

  const langMessages = languageFiles[lang]()

  return ValidatorUtils.setLabels(langMessages)
}

setValidatorLangauge('en')

export { setValidatorLangauge }
export default useValidator
