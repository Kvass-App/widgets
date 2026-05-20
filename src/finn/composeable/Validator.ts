import { ValidatorUtils, useValidator } from '@kvass/ui'

import nb from 'validatorjs/src/lang/nb_NO'

ValidatorUtils.setLabels(nb)

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

ValidatorUtils.register(
  'no_email',
  (value: any) => {
    if (typeof value !== 'string') return true
    return !EMAIL_REGEX.test(value)
  },
  ':attribute kan ikke inneholde e-postadresse',
)

// import CustomValidators from './CustomValidators'
// import CustomAsyncValidators from './CustomAsyncValidators'

// Object.values(CustomValidators).forEach((func: Function) => func(ValidatorUtils.register))
// Object.values(CustomAsyncValidators).forEach((func: Function) => func(ValidatorUtils.registerAsync))

export default useValidator
