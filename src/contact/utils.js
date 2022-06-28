function Debounce(fn, wait = 300) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => { fn.apply(this, args) }, wait)
	}
}

export {
	Debounce
}