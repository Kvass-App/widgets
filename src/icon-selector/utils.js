import { Translate } from '../utils/index.js'

export function getCategorizedIcons(collection) {
  const { uncategorized = [], categories = {}, icons = [] } = collection

  const normalizedCategories = Object.entries(categories).map(
    ([_, icons]) => icons,
  )

  return [
    ...new Set(
      [...icons, ...uncategorized, ...normalizedCategories]
        .flat()
        .filter(Boolean),
    ),
  ]
}

/**
 * @typedef {Object} IconCollection
 * @property {string} name - The name of the collection
 */

/**
 * @param {unknown} collection - The collection to normalize
 * @returns {IconCollection}
 */
export function normalizeCollection(collection) {
  const isSearch = 'limit' in collection

  if (isSearch) {
    const currentCollection = Object.entries(collection.collections).map(
      ([key, value]) => ({ key, value }),
    )[0]

    /**
     * {
     * 	limit: number
     * 	start: number
     * 	total: number
     * 	icons: string[]
     * 	collections: {
     * 		[key: string]: {
     * 			name: string
     * 			height: number
     * 			author: { name: string }
     * 			total: number
     * 			samples: string[]
     * 			license: { title: string; url: string }
     * 		}
     * 	}
     * 	request: {
     * 		query: string
     * 		prefixes: string
     * 	}
     * }
     */
    return {
      title: Translate(currentCollection.key) || currentCollection.value.name,
      prefix: currentCollection.key,
      total: collection.total,
      icons: collection.icons,
    }
  }

  /**
   * {
   * 	prefix: string
   * 	title: string
   * 	total: number
   * 	uncategorized?: string[]
   * 	categories?: {
   * 		[key: string]: string[]
   * 	}
   * }
   */
  return {
    title: Translate(collection.prefix) || collection.title,
    prefix: collection.prefix,
    total: collection.total,
    icons: getCategorizedIcons(collection),
  }
}
