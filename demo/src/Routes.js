import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import FormPage from './FormPage'
import FormPost from './FormPost'
import Page2 from './Page2'
import Page3 from './Page3'
import Page4 from './Page4'

const Routes = () => (
	<Switch>
		<Route exact path="/" component={FormPage} />
		<Route exact path="/post" component={FormPost} />
		<Route exact path="/page2" component={Page2} />
		<Route exact path="/page3" component={Page3} />
		<Route exact path="/page4" component={Page4} />

		{/* catch any invalid URLs */}
		<Redirect to="/" />
	</Switch>
)

export default Routes
