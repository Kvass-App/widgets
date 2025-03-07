export type Property = {
  value: string
  label: string
  categories: Type[]
  condition?: (v: Ad) => boolean
}
import type { Type, Ad } from '../types/ad'

export default [
  {
    value: 'flat',
    label: 'Leilighet',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_PROJECT_SINGLE',
      'ESTATE_RENT',
    ],
  },
  {
    value: 'detached',
    label: 'Enebolig',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_PROJECT_SINGLE',
      'ESTATE_RENT',
    ],
  },
  {
    value: 'terraced',
    label: 'Rekkehus',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_PROJECT_SINGLE',
      'ESTATE_RENT',
    ],
  },
  {
    value: 'semidetached',
    label: 'Tomannsbolig',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_PROJECT_SINGLE',
      'ESTATE_RENT',
    ],
  },
  { value: 'bedsit', label: 'Hybel', categories: ['ESTATE_RENT'] },
  {
    value: 'cottage',
    label: 'Hytte',
    categories: ['ESTATE_PLANNED', 'ESTATE_PROJECT_LEISURE'],
    condition: (item) => {
      if (item.type !== 'ESTATE_PLANNED') return true
      return item.fields.IS_LEISURE
    },
  },
  { value: 'leisure_plot', label: 'Hyttetomt', categories: ['PLOT_SALE'] },
  {
    value: 'office',
    label: 'Kontor',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'businessplot',
    label: 'Næringstomt',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'houseshare',
    label: 'Rom i bofellesskap',
    categories: ['ESTATE_RENT'],
  },
  { value: 'plot', label: 'Tomter', categories: ['PLOT_SALE'] },
  {
    value: 'business',
    label: 'Butikk/Handel',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'industrial',
    label: 'Produksjon/Industri',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'warehouse',
    label: 'Lager/Logistikk',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'multipurposearea',
    label: 'Kombinasjonslokaler',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'farm',
    label: 'Gårdsbruk/Småbruk',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_BUSINESS_SALE',
      'ESTATE_BUSINESS_RENT',
    ],
    condition: (item) => {
      if (item.type !== 'ESTATE_PLANNED') return true
      return item.fields.IS_LEISURE
    },
  },
  {
    value: 'multiunits',
    label: 'Bygård/Flermannsbolig',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'shoppingmall',
    label: 'Kjøpesenter',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'mechshop',
    label: 'Verksted',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'garage',
    label: 'Garasje/Parkering',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT', 'ESTATE_RENT'],
  },
  {
    value: 'hotel',
    label: 'Hotell/Overnatting',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'restaurant',
    label: 'Serveringslokale/Kantine',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  {
    value: 'learningfacility',
    label: 'Undervisning/Arrangement',
    categories: ['ESTATE_BUSINESS_SALE', 'ESTATE_BUSINESS_RENT'],
  },
  { value: 'project', label: 'Prosjekt', categories: [] },
  {
    value: 'other_leisure',
    label: 'Annet fritid',
    categories: ['ESTATE_PLANNED', 'ESTATE_PROJECT_LEISURE'],
    condition: (item) => {
      if (item.type !== 'ESTATE_PLANNED') return true
      return item.fields.IS_LEISURE
    },
  },
  {
    value: 'other',
    label: 'Andre',
    categories: [
      'ESTATE_PLANNED',
      'ESTATE_PROJECT',
      'ESTATE_PROJECT_LEISURE',
      'ESTATE_PROJECT_SINGLE',
      'ESTATE_BUSINESS_SALE',
      'ESTATE_BUSINESS_RENT',
      'ESTATE_RENT',
    ],
  },
] as Property[]
