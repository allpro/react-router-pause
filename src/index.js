import React from 'react'
import { withRouter } from 'react-router-dom' // eslint-disable-line
import PropTypes from 'prop-types'

import bindAll from 'lodash/bindAll'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import isObjectLike from 'lodash/isObjectLike'
import isUndefined from 'lodash/isUndefined'
import pick from 'lodash/pick'


/**
 * Helper to determine if object is a thenable; ie: a promise
 *
 * @param {*} obj
 * @returns {boolean}
 */
const isPromise = obj => (
	isObjectLike(obj) && isFunction(obj.then)
)

/**
 * Helper to create a fingerprint string for easy comparisons
 *
 * @param {Object} location        The router.history.location object
 * @returns {string}
 */
const createFingerprint = location => (
	JSON.stringify(pick(location, [ 'pathname', 'search', 'hash', 'state' ]))
)


/**
 * @public
 * @constructor
 * @returns {Null}
 */
class ReactRouterPause extends React.Component {
	constructor(props) {
		super(props)

		// Cache current location for later comparison
		this.locationFingerprint = createFingerprint(props.location)

		// Location data for navigation that was delayed.
		this.pausedNavigation = null

		// Temporary flag so can skip blocking 'the next' navigation event
		this.skipNext = false

		// Bind blocking method plus all handler API-object methods
		bindAll(this, [
			'beforeRouteChange',
			'isPaused',
			'resume',
			'cancel',
			'push',
			'replace'
		])
	}

	componentDidMount() {
		this.block()
	}

	// noinspection JSCheckFunctionSignatures
	componentDidUpdate(prevProps) {
		// Allow blocking handler to be changed
		// Could change on EVERY RENDER if callback is recreated each time
		if (this.props.use !== prevProps.use) {
			this.block()
		}
	}

	componentWillUnmount() {
		this.unblock()
	}


	block() {
		const { use, history } = this.props

		// Unbind current blocker, if set
		this.unblock()

		if (isFunction(use)) {
			// Call history.block with listener to fire BEFORE a route-change.
			// The return value is method for unbinding the block listener.
			this.unblockFunction = history.block(this.beforeRouteChange)
		}
	}

	unblock() {
		if (this.unblockFunction) {
			this.unblockFunction()
			this.unblockFunction = null
		}
	}

	/**
	 * Was a handler method passed in to the component?
	 * @returns {boolean}
	 */
	isBlocking() {
		return !!this.unblockFunction
	}

	/**
	 * Set or clear flag used for skipping the next navigation event.
	 * @param {boolean} enable
	 */
	setSkipNext(enable) {
		this.skipNext = !!enable
	}


	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {boolean}
	 */
	isPaused() {
		return !!this.pausedNavigation
	}

	/**
	 * Resume previously pausedNavigation blocked by props.use callback.
	 */
	resume() {
		if (!this.isPaused()) return

		const { history } = this.props
		let { location, action } = this.pausedNavigation
		action = action.toLowerCase()

		// Avoid blocking the next event
		this.setSkipNext(true)

		if (action === 'pop') {
			history.goBack()
		}
		else { // (push|replace)
			history[action](location.pathname, location.state)
		}
	}

	/**
	 * Clear cached navigation/location data so cannot be used
	 */
	cancel() {
		this.pausedNavigation = null
	}

	push(path, state) {
		this.setSkipNext(true) // Avoid blocking this event
		this.props.history.push(path, state)
	}

	replace(action, path, state) {
		this.setSkipNext(true) // Avoid blocking this event
		this.props.history.replace(path, state)
	}


	/**
	 * @param {Object} route     Combined history.location & history.action
	 * @returns {boolean}
	 */
	askHandler(route) {
		const { resume, cancel, isPaused, push, replace } = this
		let resp = true

		// Prevent a component-level error from breaking router navigation
		try {
			const navigationAPI = { isPaused, resume, cancel, push, replace }
			resp = this.props.use(navigationAPI, route.location, route.action)
		}
		catch (err) {} // eslint-disable-line

		// If nothing is returned, let navigation proceed as normal
		if (isUndefined(resp)) {
			return true
		}

		// A boolean response means allow or cancel - NO paused navigation
		if (isBoolean(resp)) {
			return resp
		}

		const isPromiseResp = isPromise(resp)

		// A Promise OR Null response means pause/delay navigation
		if (isPromiseResp || isNull(resp)) {
			// Cache route info so can resume route later
			this.pausedNavigation = route

			// Promise will resume navigation if resolved; cancel if rejected
			if (isPromiseResp) {
				// noinspection JSUnresolvedFunction
				resp
				.then(allow => allow === false ? this.cancel() : this.resume())
				.catch(this.cancel)
			}

			return false
		}

		// Log warning if an invalid response received, including undefined
		console.error(
			`Invalid response from ReactRouterPause.use: ${resp}` +
			' Valid responses are: true, false, Null or Promise'
		)

		return true
	}

	/**
	 * Listener for history.block - fires BEFORE a route-change.
	 *
	 * @param {Object} location        Object with location, hash, etc.
	 * @param {string} action        One of [PUSH|REPLACE|POP]
	 */
	beforeRouteChange(location, action) {
		// Create new location fingerprint for comparison
		const newFingerprint = createFingerprint(location)

		if (this.props.when === false) {
			// Allow this event - RRP is disabled!
		}
		else if (newFingerprint === this.locationFingerprint) {
			// Block navigation if this is SAME LOCATION we are already at!
			// This prevents reloading a form component and losing its contents.
			return false
		}
		else if (this.skipNext) {
			this.setSkipNext(false) // Reset flag - only used ONCE
			// Allow this event - blocking was skipped!
		}
		else if (this.isBlocking()) {
			// The askHandler method handles the pause/resume functionality.
			// Call the handler to see if we should allow route change (true).
			// Coerce response to a boolean because that's what RR expects.
			return !!this.askHandler({ location, action })
		}

		// Cache the new location data for comparison
		this.locationFingerprint = newFingerprint
		return true
	}


	render() {
		return null
	}
}


const { bool, func, object } = PropTypes

ReactRouterPause.propTypes = {
	history: object.isRequired,
	location: object.isRequired,
	when: bool,
	use: func
}

export default withRouter(ReactRouterPause)
