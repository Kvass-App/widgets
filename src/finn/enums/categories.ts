import type { Type } from '../types/ad'

export type Category = {
  type: Type
  label: string
  sublabel: string
  group: string
  unitType?: Type
}

export default [
  {
    type: 'ESTATE_PLANNED',
    label: 'Kommer for salg',
    sublabel: 'Nye boliger, kommer for salg',
    group: 'Nybygg',
  },
  {
    type: 'ESTATE_PROJECT',
    label: 'Boliger',
    sublabel: 'Nye boliger til salgs',
    group: 'Nybygg',

    unitType: 'ESTATE_PROJECT_UNIT',
  },
  {
    type: 'ESTATE_PROJECT_SINGLE',
    label: 'Enkelt enhet',
    sublabel: 'Nye boliger til salgs enkelt enhet',
    group: 'Nybygg',
  },
  {
    type: 'ESTATE_PROJECT_LEISURE',
    label: 'Hytter',
    sublabel: 'Nye boliger til salgs hytte',
    group: 'Nybygg',
    unitType: 'ESTATE_PROJECT_UNIT_LEISURE',
  },
  {
    type: 'ESTATE_BUSINESS_SALE',
    label: 'Til salgs',
    sublabel: 'Næringseiendommer til salgs',
    group: 'Næring',
  },
  {
    type: 'ESTATE_BUSINESS_RENT',
    label: 'Til leie',
    sublabel: 'Næringseiendommer til leie',
    group: 'Næring',
  },
  {
    type: 'PLOT_SALE',
    label: 'Tomt/Hyttetomt',
    sublabel: 'Boligtomt/Fritidstomt til salgs',
    group: 'Tomter',
  },
  // {
  //   label: 'Fritidstomt til salgs ( TODO, type )',
  //   type: 'PLOT_SALE',
  // },
  {
    type: 'ESTATE_RENT',
    label: 'Bruktbolig',
    sublabel: 'Bolig til leie',
    group: 'Leie',
  },
] as Category[]
