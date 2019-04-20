import { withRouter } from 'react-router-dom'

import { Component } from '../ReactRouterPause'

// Need to wrap in a LOCAL version of withRouter for demo.
// This is because imported dev-copy of RRP has its own 'react-router-dom';
//	this is not be so normally because 'react-router-dom' is a peer-dependency.
export default withRouter(Component)
