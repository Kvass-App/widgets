export type Type =
  | 'ESTATE_PLANNED'
  | 'ESTATE_PROJECT'
  | 'ESTATE_PROJECT_UNIT'
  | 'ESTATE_PROJECT_SINGLE'
  | 'ESTATE_PROJECT_LEISURE'
  | 'ESTATE_PROJECT_UNIT_LEISURE'
  | 'ESTATE_BUSINESS_SALE'
  | 'ESTATE_BUSINESS_RENT'
  | 'PLOT_SALE'
  | 'ESTATE_RENT'

export type ID = string

export type Base = {
  name: string
  type?: Type
  fields: Record<string, any>
  id?: ID
  url?: string
  statistics?: string
  code?: string
  preview?: boolean
  orderno?: string
}

export type Ad = Base & {
  createdAt?: Date
  publishedAt?: Date
  updatedAt?: Date
  units: Base[]
}

export type Unit = {
  id: ID
  name: string
  price: number
  propertyType: {
    value: string // enums
    label: string
  }
  status: {
    value: string // enums
    label: string
  }
  disabled: boolean
} & Partial<Base>
