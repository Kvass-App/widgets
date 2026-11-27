export type ProductState =
  | 'PURCHASABLE'
  | 'PURCHASED_NOT_DELIVERED'
  | 'DELIVERED'
  | 'UNAVAILABLE'

export type UpsellProduct = {
  productState: ProductState
  productUrn: string
  durationInDays?: number
  isStartDateConfigurable: boolean
  headingText: string
  descriptionText: string
  productStartDate?: string
  blinkPreviewUrl?: string
  readMoreUrl?: string
  unavailableReasons?: string[]
  availableFrom?: string
}

export type Upsell = {
  upsellProducts: { selectGroup?: string; products: UpsellProduct[] }[]
  purchaseHistory: {
    productUrn: string
    headingText: string
    dateDelivered: string
    specificationType: string
  }[]
}

export type UpsellReceipt = {
  purchaseId: number
  purchaseState?:
    | 'CANCELLED'
    | 'OPEN'
    | 'PAYING'
    | 'ACCOUNTING_ON_HOLD'
    | 'COMPLETED'
  totalPriceWithVat: number
  purchasedProducts: {
    productSpecificationId: string
    description: string
    amountWithVat: number
    isPartOfPackage: boolean
  }[]
}
