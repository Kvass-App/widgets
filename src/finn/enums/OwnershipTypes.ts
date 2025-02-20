export type Ownership = { value: string; label: string }

export default [
  {
    value: 'LEASEHOLD',
    label: 'Obligasjon',
  },
  {
    value: 'COLLECTIVE_OWNERSHIP',
    label: 'Aksje',
  },
  {
    value: 'FREEHOLD',
    label: 'Eier (Selveier)',
  },
  // finn støtter ikke denne typen
  // {
  //   value: 'condominium',
  //   label: 'Eierseksjon',
  // },
  {
    value: 'PART_OWNERSHIP',
    label: 'Andel',
  },
  {
    value: 'OTHER',
    label: 'Annet',
  },
] as Ownership[]
