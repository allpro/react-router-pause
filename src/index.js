import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import bindAll from 'lodash/bindAll'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import isObjectLike from 'lodash/isObjectLike'
import pick from 'lodash/pick'


const isPromise = obj => isObjectLike(obj) && isFunction(obj.then)

/**
 * Helper to create a fingerprint string for easy comparisons
 *
 * @param {Object} location        The router.history.location object
 */
const createFingerprint = location => (
	JSON.stringify(pick(
		location,
		['pathname', 'search', 'hash', 'state']
	))
)


/**
 * @public
 * @constructor
 * @returns {Null}
 */
class ReactRouterPause extends React.Component {
	constructor( props ) {
		super(props)

		// Cache current location for later comparison
		this.locationFingerprint = createFingerprint(props.location)

		// Location data for navigation that was delayed.
		this.pausedNavigation = null

		// Bind methods that require it
		bindAll(this, [
			'beforeRouteChange',
			'isPaused',
			'resumeNavigation',
			'cancelNavigation',
			'unsubscribeBlocking'
		])
	}

	componentDidMount() {
		this.subscribeBlocking()
	}

	componentWillUnmount() {
		this.unsubscribeBlocking()
	}

	isBlocking() {
		return !!this.unblockNavigation
	}

	isPaused() {
		return !!this.pausedNavigation
	}

	subscribeBlocking() {
		const { use, history } = this.props

		if (isFunction(use)) {
			// Call history.block with listener to fire BEFORE a route-change.
			// The return value of block() is method for unbinding the listener.
			this.unblockNavigation = history.block(this.beforeRouteChange)
		}
	}

	unsubscribeBlocking() {
		if (this.isBlocking()) {
			// Call the unset function returned by history.block()
			this.unblockNavigation()
			this.unblockNavigation = null
		}
		// Also clear any cached location data
		this.pausedNavigation = null
	}

	/**
	 * Resume previously pausedNavigation blocked by props.use callback.
	 */
	resumeNavigation() {
		if (!this.isPaused()) return

		const { history } = this.props
		let { location, action } = this.pausedNavigation
		action = action.toLowerCase()

		// Unsubscribe so we don't block next navigation
		this.unsubscribeBlocking()

		if (action === 'pop') {
			history.goBack()
		}
		else { // (PUSH|REPLACE)
			history[action](location)
		}
	}

	/**
	 * Clear cached navigation/location data so cannot be used
	 */
	cancelNavigation() {
		this.pausedNavigation = null
	}

	/**
	 * @param {Object} route     Combined history.location & history.action
	 * @returns {boolean}
	 */
	askUseHandler( route ) {
		const { location, action } = route
		const { use, when, history } = this.props

		// State-flag to prevent beforeRouteChange from blocking route change
		const doNotBlock = { doNotBlock: true }

		// If props.when == false, means IGNORE route blocking even if set
		if (when === false) return true

		// Handler will be passed an API so can resume, clear, etc
		const api = {
			isPaused: this.isPaused,
			resume: this.resumeNavigation,
			cancel: this.cancelNavigation,

			// Unblock is only useful if followed by a navigation command
			// Otherwise would be re-enabled when component renders again
			unblock: this.unsubscribeBlocking,

			// Include basic history methods; for manual navigation
			push: path => history.push(path, doNotBlock),
			replace: path => history.replace(path, doNotBlock)
		}

		let resp = true

		// Avoid a component-level error from causing an issue here
		try {
			resp = use(api, location, action)
		}
		catch (err) {} // eslint-disable-line

		// A boolean response means allow or cancel - NO paused navigation
		if (isBoolean(resp)) {
			return resp
		}

		const respIsPromise = isPromise(resp)

		// Promise will resume navigation if resolved; cancel if rejected
		if (respIsPromise) {
			// noinspection JSUnresolvedFunction
			resp.then(this.resumeNavigation, this.cancelNavigation)
		}

		// A Promise OR Null response means pause/delay navigation
		if (respIsPromise || isNull(resp)) {
			// Cache route info so can resume route later
			this.pausedNavigation = route
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
	beforeRouteChange( location, action ) {
		// DEBUG: Log every _attempted_ route-change, blocked or not.
		// console.log('beforeRouteChange()', { location, action })

		const state = location.state || {}

		// IF navigation blocking is currently enabled, then...
		if (this.isBlocking() && !state.doNotBlock) {
			// Block navigation if this is SAME LOCATION we are already at!
			// This prevents reloading a form component and losing its contents.
			const newLocationFingerprint = createFingerprint(location)
			if (newLocationFingerprint === this.locationFingerprint) {
				return false
			}

			// Call the handler to see if we should halt or allow route change.
			// The askUseHandler method handles the pause/resume functionality.
			const allowNavigation = this.askUseHandler({ location, action })
			if (!allowNavigation) return false
		}

		// Cache the new location for comparison next time
		// It's possible this component will NOT unmount
		this.locationFingerprint = createFingerprint(location)

		return true
	}

	render() {
		// This helper does not render anything
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
