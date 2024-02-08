export function getCategorizedIcons(collection) {
	const { uncategorized = [], categories = {} } = collection

	const normalizedCategories = Object.entries(categories).map(([title, icons]) => ({
		title,
		icons
	}))

	const normalizedUncategorized = {
		title: null,
		icons: uncategorized
	}

	return [normalizedUncategorized, ...normalizedCategories].filter(Boolean).filter(({ title, icons }) => icons.length)
}