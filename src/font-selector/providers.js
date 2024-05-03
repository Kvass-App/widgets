export function getProviders(customProviders) {
  const base = [
    {
      value: 'google',
      label: 'Google Fonts',
      fonts: [
        'Roboto',
        'Open Sans',
        'Lato',
        'Montserrat',
        'Roboto Condensed',
        'Oswald',
        'Poppins',
        'Raleway',
        'Slabo 27px',
        'Merriweather',
      ],
    },
  ]

  return [...base, ...customProviders.filter((i) => i.value)]
}
