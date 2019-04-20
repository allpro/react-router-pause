import { useEffect } from 'react'


// HACK: A quick and dirty bookmark scroller hook
function useScrollTo(hash) {
	const id = (hash || '').replace(/^#/, '') // Strip hash-mark prefix

	useEffect(() => {
		if (id) {
			const node = document.getElementById(id)
			if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
		else {
			const body = document.documentElement || document.body
			body.scrollTop = 0
		}
	}, [ id ])
}


export default useScrollTo
