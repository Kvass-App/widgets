export function getCategorizedIcons(collection) {
	const { uncategorized = [], categories = {} } = collection

	const normalizedCategories = Object.entries(categories).map(([_, icons]) => icons)

	return [
		...new Set(
			[...uncategorized, ...normalizedCategories]
				.flat()
				.filter(Boolean)
		)
	]
}