export function getProviders(customProviders) {
  const base = [
    {
      value: 'google',
      label: 'Google Fonts',
      fonts: [
        'Mulish',
        'Montserrat',
        'Roboto',
        'Open Sans',
        'Lato',
        'Roboto Condensed',
        'Oswald',
        'Poppins',
        'Raleway',
        'Slabo 27px',
        'Merriweather',
        'Playfair Display SC',
        'Frank Ruhl Libre',
      ],
    },
  ]

  return [...base, ...customProviders.filter((i) => i.value)]
}
