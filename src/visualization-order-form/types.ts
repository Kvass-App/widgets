import { Rooms } from './enums'

export type Props = {
  labels: string // Record<string, string> // string
  locale: string
  currency: string
  validatorLanguage: string
  callbackUrl: string
  lead: string // Record<string, string> // string
}

export type ImageOrder = {
  type: 'interior' | 'exterior'
  units: number | undefined
  visualizationTechnique: string // enums
  description: string
  room: (typeof Rooms)[number]['id']
}

export type Service = {
  id: string
  comment: string
  selected: boolean
}

export type Order = {
  images: ImageOrder[]
  files: {
    hasModel: boolean
    model: any[]
    shared: any[]
    hasDrone: boolean
    drone: any[]
  }
  lead: {
    name: string
    phone: string
    email: string
    company: {
      name: string
      organizationNumber: string
    }
  }
  services: Service[]
}

export type getLabel = (k: string) => string
