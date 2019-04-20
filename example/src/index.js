import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

const isDocSite = /allpro\.github\.io/.test(window.location.hostname)

function ReactRouterPauseDemo() {
	return (
		<Router basename={isDocSite ? '/react-router-pause' : ''}>
			<App />
		</Router>
	)
}

render(<ReactRouterPauseDemo />, document.getElementById('root'))
