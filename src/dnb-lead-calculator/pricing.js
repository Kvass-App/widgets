// DNB-fordelspriser (NOK eks. mva). Etablering og boligvelger øker med prosjektstørrelsen.
export const prices = Object.freeze({
  base: 1050,
  onboarding: 12250,
  tiers: [
    { maxUnits: 9, license: 1500, establishment: 15450, selector: 3500 },
    { maxUnits: 29, license: 1500, establishment: 30850, selector: 5250 },
    { maxUnits: 80, license: 1500, establishment: 46300, selector: 10500 },
  ],
  // Per påbegynte 30 enheter over største trinn.
  addOn: { units: 30, license: 150, establishment: 10500, selector: 3500 },
  packages: { dnb: 9900, custom: 19900, self: 0 },
})
export function validUnits(value) {
  return (
    value !== '' && Number.isSafeInteger(Number(value)) && Number(value) > 0
  )
}
export function calculatePrice(units, packageId, rates = prices) {
  if (!validUnits(units)) return null
  const count = Number(units)
  const last = rates.tiers[rates.tiers.length - 1]
  const tier = rates.tiers.find((t) => count <= t.maxUnits) ?? last
  const addOns =
    count > last.maxUnits
      ? Math.ceil((count - last.maxUnits) / rates.addOn.units)
      : 0
  const license = tier.license + addOns * rates.addOn.license
  const establishmentFull =
    tier.establishment + addOns * rates.addOn.establishment
  const selector = tier.selector + addOns * rates.addOn.selector
  return {
    license,
    monthly: license + rates.base,
    establishmentFull,
    establishment: Math.ceil(establishmentFull * 0.5),
    selector,
    setup:
      packageId === 'makr' || !packageId
        ? null
        : packageId === 'self'
          ? 0
          : selector + rates.packages[packageId],
  }
}
