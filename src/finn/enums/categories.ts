import type { Type } from '../types/ad'

export type Category = { type: Type; label: string }

export default [
  {
    type: 'ESTATE_PLANNED',
    label: 'Nye boliger, kommer for salg',
  },
  {
    type: 'ESTATE_PROJECT',
    label: 'Nye boliger til salgs',
    // unitType: 'ESTATE_PROJECT_UNIT'
  },
  {
    label: 'Nye boliger til salgs hytte',
    type: 'ESTATE_PROJECT_LEISURE',
    // unitType: 'ESTATE_PROJECT_UNIT_LEISURE'
  },
  {
    type: 'ESTATE_PROJECT_SINGLE',
    label: 'Nye boliger til salgs enkel enhet',
  },
  {
    type: 'ESTATE_BUSINESS_SALE',
    label: 'Næringseiendommer til salgs',
  },
  {
    label: 'Næringseiendommer til leie',
    type: 'ESTATE_BUSINESS_RENT',
  },
  {
    label: 'Boligtomt/Fritidstomt til salgs',
    type: 'PLOT_SALE',
  },
  // {
  //   label: 'Fritidstomt til salgs ( TODO, type )',
  //   type: 'PLOT_SALE',
  // },
  {
    label: 'Bolig til leie',
    type: 'ESTATE_RENT',
  },
] as Category[]
