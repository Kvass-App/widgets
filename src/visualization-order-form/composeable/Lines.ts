type Line = {
  comment?: string
  description: string
  value: number
  type: 'hourly' | 'monthly' | 'fixed'
}

const getTotal = (lines: Line[]) => {
  const result = lines.reduce(
    (res, line) => {
      if (typeof line.value === 'number') {
        res[line.type] =
          typeof res[line.type] === 'number'
            ? res[line.type] + line.value
            : line.value
      } else if (typeof line.value === 'string' && res[line.type] === 0) {
        res[line.type] = line.value
      }

      return res
    },
    { fixed: 0, monthly: 0, hourly: 0 },
  )

  return [
    { type: 'fixed', value: result.fixed },
    { type: 'monthly', value: result.monthly },
    { type: 'hourly', value: result.hourly },
  ].filter(({ value }) => value)
}

const getSuffix = (line: Line) => {
  switch (line.type) {
    case 'hourly':
      return `/ time`
    case 'monthly':
      return `/ mnd`
    default:
      return ''
  }
}
