import type { Type, Unit } from '../types/ad'

export type Category = {
  type: Type
  label: string
  sublabel: string
  group: string
  unitType?: Type
  disabled: (unit: Unit[]) => boolean
  disabledReason: string
}

export default [
  {
    type: 'ESTATE_PLANNED',
    label: 'Kommer for salg',
    sublabel: 'Nye boliger, kommer for salg',
    group: 'Nybygg',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      const types = ['draft', 'upcoming']

      return !units.some((unit) => {
        return unit.saleType === 'sale' && types.includes(unit.status.value)
      })
    },
    disabledReason: 'Du må ha enheter merket som "kommer for salg".',
  },
  {
    type: 'ESTATE_PROJECT',
    label: 'Boliger',
    sublabel: 'Nye boliger til salgs',
    group: 'Nybygg',
    unitType: 'ESTATE_PROJECT_UNIT',
    disabled: (units: Unit[]) => {
      if (!units.length) return true

      const types = ['detached', 'flat', 'semidetached', 'terraced']

      return !units.some((unit) => {
        return (
          unit.saleType === 'sale' && types.includes(unit.propertyType.value)
        )
      })
    },
    disabledReason: 'Du må ha boligtypeenheter til salgs',
  },
  {
    type: 'ESTATE_PROJECT_SINGLE',
    label: 'Enkelt enhet',
    sublabel: 'Nye boliger til salgs enkelt enhet',
    group: 'Nybygg',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      const types = ['detached', 'flat', 'semidetached', 'terraced', 'leisure']

      return !units.some((unit) => {
        return (
          unit.saleType === 'sale' && types.includes(unit.propertyType.value)
        )
      })
    },
    disabledReason: 'Du må ha boligtypeenheter eller hytteenheter til salgs.',
  },
  {
    type: 'ESTATE_PROJECT_LEISURE',
    label: 'Hytter',
    sublabel: 'Nye boliger til salgs hytte',
    group: 'Nybygg',
    unitType: 'ESTATE_PROJECT_UNIT_LEISURE',
    disabled: (units: Unit[]) => {
      if (!units.length) return true

      const types = ['leisure']

      return !units.some((unit) => {
        return (
          unit.saleType === 'sale' && types.includes(unit.propertyType.value)
        )
      })
    },
    disabledReason: 'Du må ha hytteenheter til salgs',
  },
  {
    type: 'ESTATE_BUSINESS_SALE',
    label: 'Til salgs',
    sublabel: 'Næringseiendommer til salgs',
    group: 'Næring',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      const types = ['detached', 'flat', 'semidetached', 'terraced', 'leisure']

      // we are missing rent properties in Kvass

      return !units.some((unit) => {
        return (
          unit.saleType === 'sale' && !types.includes(unit.propertyType.value)
        )
      })
    },
    disabledReason:
      'Du må ha flere enheter til salgs enn bare boligtyper og hytter',
  },
  {
    type: 'ESTATE_BUSINESS_RENT',
    label: 'Til leie',
    sublabel: 'Næringseiendommer til leie',
    group: 'Næring',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      // we are missing rent properties in Kvass

      return !units.some((unit) => {
        return unit.saleType === 'rent'
      })
    },
    disabledReason: 'Du må ha enheter til leie',
  },
  {
    type: 'PLOT_SALE',
    label: 'Tomt/Fritidstomt',
    sublabel: 'Boligtomt/Fritidstomt til salgs',
    group: 'Tomter',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      const types = ['plot', 'leisurePlot']

      return !units.some((unit) => {
        return (
          unit.saleType === 'sale' && types.includes(unit.propertyType.value)
        )
      })
    },
    disabledReason: 'Du må ha tomteenheter eller fritidstomter til salgs',
  },
  {
    type: 'ESTATE_RENT',
    label: 'Bruktbolig',
    sublabel: 'Bolig til leie',
    group: 'Leie',
    disabled: (units: Unit[]) => {
      if (!units.length) return false

      return !units.some((unit) => {
        return unit.saleType === 'rent'
      })
    },
    disabledReason: 'Du må ha enheter til leie',
  },
] as Category[]
