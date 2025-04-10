import Validator from 'validatorjs'
import lang from 'validatorjs/src/lang.js'
import { ref } from 'vue'
import isMobilePhone from 'validator/lib/isMobilePhone'

import nb from 'validatorjs/src/lang/nb_NO'
import en from 'validatorjs/src/lang/en'
import se from 'validatorjs/src/lang/se'
import da from 'validatorjs/src/lang/da'

const langs = { nb, en, sv: se, da }

Object.keys(langs).forEach((key) => {
    lang._set(key, langs[key])
})

export default function useValidator(t, lang = 'nb') {
    Validator.useLang(lang)

    // register custom validation
    Validator.register(
        'phone',
        function (value = '') {
            return isMobilePhone(value.toString().replace(/\s/g, ''))
        },
        t('phoneValidation')
    )

    const validator = ref(null)

    const isValid = ref(false)

    const placeholder = new Validator()

    const getRules = () => {
        return validator.value.rules
    }

    const getFields = () => {
        return Object.fromEntries(
            Object.keys(getRules() || {}).map((key) => {
                return [
                    key,
                    {
                        rule: getRules()[key],
                        valid: !validator.value.errors.get(key).length,
                        error: validator.value.errors.first(key) || undefined,
                    },
                ]
            })
        )
    }

    function isFieldValid(field) {
        return !validator.value.errors.get(field).length
    }
    function getFieldError(field) {
        return validator.value.errors.first(field) || undefined
    }

    const onChange = (data, options) => {
        validator.value = options
        let validation

        try {
            validation = new Validator(data, getRules())
        } catch (err) {
            console.log('validtor error')
        }

        if (validator.value.labels) {
            validation.setAttributeNames(validator.value.labels)
        }

        const passes = () => {
            validator.value.errors = placeholder.errors
            validator.value.passes = true
            validator.value.fields = getFields()
            isValid.value = true
        }

        const fails = () => {
            validator.value.passes = false
            validator.value.errors = validation.errors
            validator.value.fields = getFields()
            isValid.value = false
        }

        validation.checkAsync(passes, fails)
    }

    return {
        validator,
        onChange,
        getFieldError,
        isFieldValid,
    }
}
