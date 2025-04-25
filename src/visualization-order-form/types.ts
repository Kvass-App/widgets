export type Props = {
  labels: string // Record<string, string> // string
  locale: string
  currency: string
  validatorLanguage: string
  callbackUrl: string
}

export type ImageOrder = {
  type: 'interior' | 'exterior'

  units: number | undefined
  drone: boolean

  description: string
  attachments: any[]

  room: string

  // Inspirasjonsbilder ?
}

export type Service = {
  id: string
  comment: string
  selected: boolean
}

// export type Image = {
//   type: 'interior' | 'exterior'
//   description: string
//   droneImage: boolean
// } & ({ type: 'interior'; units?: number } | { type: 'exterior'; units: number })

export type Order = {
  images: ImageOrder[]
  files: any[]
  services: Service[]
}

export type getLabel = (k: string) => string
