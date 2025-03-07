export type EnergyLabel = { value: string; label: string }
export type EnergyLabelColor = { value: string; label: string }

const energyLabel = [
  {
    value: 'A',
    label: 'A',
  },
  {
    value: 'B',
    label: 'B',
  },
  {
    value: 'C',
    label: 'C',
  },
  {
    value: 'D',
    label: 'D',
  },
  {
    value: 'E',
    label: 'E',
  },
  {
    value: 'F',
    label: 'F',
  },
  {
    value: 'G',
    label: 'G',
  },
] as EnergyLabel[]

const energyLabelColor = [
  {
    value: 'dark_Green',
    label: 'Mørkegrønn',
  },
  {
    value: 'light_Green',
    label: 'Lysegrønn',
  },
  {
    value: 'yellow',
    label: 'Gul',
  },
  {
    value: 'orange',
    label: 'Oransje',
  },
  {
    value: 'red',
    label: 'Rød',
  },
] as EnergyLabelColor[]

export { energyLabel, energyLabelColor }
