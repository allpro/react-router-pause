import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'

function ReactRouterPauseDemo() {
	return (
		<Router>
			<App />
		</Router>
	)
}

render(<ReactRouterPauseDemo />, document.getElementById('root'))
