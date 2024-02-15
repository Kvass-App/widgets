export const collectionNames = {
	'fa-pro-light': {
		nb: 'Tynne ikoner',
	},
	'fa-pro-regular': {
		nb: 'Normale ikoner',
	},
	'fa-pro-duotone': {
		nb: 'Duofargede ikoner'
	},
	'fa-pro-solid': {
		nb: 'Ikoner med heldekkende farge'
	},
	'fa-pro-brands': {
		nb: 'Merkevare ikoner'
	}
}

/**
 * 
 * @param {string} collection 
 * @returns {string}
 */
export function translateCollectionName(collection) {
	const lang = document.documentElement.getAttribute('lang') || navigator.language || 'nb'
	return collectionNames[collection]?.[lang]
}