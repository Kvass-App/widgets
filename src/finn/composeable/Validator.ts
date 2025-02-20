import { ValidatorUtils, useValidator } from '@kvass/ui'

import nb from 'validatorjs/src/lang/nb_NO'

ValidatorUtils.setLabels(nb)

// import CustomValidators from './CustomValidators'
// import CustomAsyncValidators from './CustomAsyncValidators'

// Object.values(CustomValidators).forEach((func: Function) => func(ValidatorUtils.register))
// Object.values(CustomAsyncValidators).forEach((func: Function) => func(ValidatorUtils.registerAsync))

export default useValidator
