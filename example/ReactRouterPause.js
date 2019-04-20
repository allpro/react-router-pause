import React from 'react'						// eslint-disable-line
import { withRouter } from 'react-router-dom'	// eslint-disable-line
import PropTypes from 'prop-types'

import bindAll from 'lodash/bindAll'
import cloneDeep from 'lodash/cloneDeep'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import pick from 'lodash/pick'

import { isPromise, isSameFunction, fingerprint } from './utils'
import defaultConfig from './defaultConfig'

const Empty = () => null


/**
 * @public
 * @constructor
 * @returns {Null}
 */
class ReactRouterPause extends React.Component {
	constructor(props) {
		super(props)

		// Final config from defaultConfig and props.config
		this.config = {}

		// Temporary flag so can skip blocking 'the next' navigation event
		this.ignoreNextNavigationEvent = false

		// Cache the location data for navigation event that was delayed.
		this.pausedNavigation = null

		// Cache for unblock function returned by history.block
		this.historyUnblock = null

		// Cache the active handler function so can compare between renders
		this.handler = null

		// Bind blocking method plus all handler API-object methods
		bindAll(this, [
			'beforeRouteChange',
			'isPaused',
			'pausedLocation',
			'resume',
			'cancel',
			'push',
			'replace'
		])
	}

	componentDidMount() {
		// Same processes run on EVERY render
		this.componentDidUpdate()
	}

	// noinspection JSCheckFunctionSignatures
	componentDidUpdate() {
		// Update config on every load in case something changes
		const config = this.props.config || {}
		this.config = Object.assign({}, defaultConfig, config)

		// Update handler and blocking status on every render
		this.updateBlocking()
	}

	componentWillUnmount() {
		this.unblock()
	}


	/**
	 * Check props to see if need to change any blocking configuration.
	 * NOTE: This method must be efficient as called after every key-stroke!
	 */
	updateBlocking() {
		// Abort early if possible
		if (this.props.when === false) {
			this.unblock()
			return
		}

		const prev = this.handler
		let next = this.props.handler
		// Ensure param is a function
		if (next && !isFunction(next)) next = null

		// Allow blocking handler to be changed on each render
		// MAY TRIGGER ON EVERY RENDER if 'handler' callback is recreated each
		// time Using a 'named function' will avoid this; see isSameFunction()
		if (!prev && !next) {
			// Nothing to do
		}
		else if (prev && !next) {
			this.unblock()
		}
		else if (next && !prev) {
			this.block()
		}
		else if (!isSameFunction(next, prev)) {
			this.block()
		}
	}

	block() {
		const { handler, history } = this.props

		// Unbind current blocker, if set
		this.unblock()

		this.handler = handler

		// Call history.block with listener to fire BEFORE a route-change.
		// The return value is method for unbinding the block listener.
		this.historyUnblock = history.block(this.beforeRouteChange)
	}

	unblock() {
		const fn = this.historyUnblock
		this.historyUnblock = null
		this.handler = null
		if (fn) fn()
	}

	/**
	 * Was a handler method passed in to the component?
	 * @returns {boolean}
	 */
	isBlocking() {
		return !!this.historyUnblock
	}

	/**
	 * Set or clear flag used for skipping the next navigation event.
	 * @param {boolean} enable
	 */
	allowNextEvent(enable) {
		this.ignoreNextNavigationEvent = !!enable
	}


	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {(Object|null)}
	 */
	pausedLocation() {
		const route = this.pausedNavigation
		/** @namespace route.location **/
		return route ? cloneDeep(route.location) : null
	}

	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {boolean}
	 */
	isPaused() {
		return !!this.pausedNavigation
	}

	/**
	 * Resume previously pausedNavigation blocked by handler callback.
	 */
	resume() {
		if (!this.isPaused()) return

		const { history } = this.props
		let { location, action } = this.pausedNavigation
		action = action.toLowerCase()

		// Avoid blocking the next event
		this.allowNextEvent(true)

		// NOTE: Impossible to handle multi-page-back programmatically
		// There is not history.pop() method, only history.go(-n), but it is
		//	not possible to lookup passed "location.key" uid in history stack!
		if (action === 'pop') {
			// Most of the time a POP is only a single page back, so do that.
			// This handles confirmation. User can THEN go-back more pages.
			history.goBack()
		}
		else { // action === 'push' || 'replace'
			history[action](location)
		}
	}

	/**
	 * Clear cached navigation/location data so cannot be used
	 */
	cancel() {
		this.pausedNavigation = null
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	push(pathOrLocation, state) {
		this.allowNextEvent(true) // Avoid blocking this event
		this.props.history.push(pathOrLocation, state)
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	replace(pathOrLocation, state) {
		this.allowNextEvent(true) // Avoid blocking this event
		this.props.history.replace(pathOrLocation, state)
	}


	/**
	 * @param {object} location
	 * @param {string} action
	 * @returns {boolean}
	 */
	askHandler(location, action) {
		const navigationAPI = pick(this, [
			'isPaused',			// Returns true or false
			'pausedLocation',	// Returns location-object or null
			'resume',
			'cancel',
			'push',
			'replace'
		])
		let resp = true

		// Prevent a component-level error from breaking router navigation
		try {
			resp = this.handler(navigationAPI, location, action)
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
			this.pausedNavigation = { location, action }

			// Promise will resume navigation if resolved; cancel if rejected
			if (isPromiseResp) {
				// noinspection JSUnresolvedFunction
				resp
				.then(val => {
					if (val === false) this.cancel()
					else this.resume()
				})
				.catch(this.cancel)
			}

			return false
		}

		// Log warning if an invalid response received, including undefined
		console.error(
			`Invalid response from ReactRouterPause.handler: \`${resp}\`. ` +
			'\nResponse should be one of: true, false, null, undefined, Promise'
		)

		return true
	}

	/**
	 * Listener for history.block - fires BEFORE a route-change.
	 *
	 * @param {Object} location        Object with location, hash, etc.
	 * @param {string} action       One of [PUSH|REPLACE|POP]
	 */
	beforeRouteChange(location, action) {
		const { props, config } = this
		const prevLocation = props.history.location

		// Use fingerprints to easily comparison new to previous location
		const pageChanged = fingerprint(location) !== fingerprint(prevLocation)
		// Bookmarks are NOT included in the location fingerprint
		const hashChanged = location.hash !== prevLocation.hash

		// Block navigation if is the SAME LOCATION we are already at!
		// This prevents reloading a form and losing its contents.
		if (!pageChanged && !hashChanged) {
			return false
		}
		else if (this.ignoreNextNavigationEvent) {
			this.allowNextEvent(false) // Reset one-time flag
			return true
		}
		// If ONLY a hash/bookmark change AND config.allowBookmarks, allow it
		else if (!pageChanged && config.allowBookmarks) {
			return true
		}
		else if (this.isBlocking()) {
			// The this.askHandler method handles the pause/resume functionality.
			// Call the handler to see if we should allow route change (true).
			// Coerce response to a boolean because that's what RR expects.
			const resp = !!this.askHandler(location, action)

			// There are only 3 responses that block navigation
			if (resp === false || resp === null || isPromise(resp)) {
				return false
			}
		}

		// Allow anything not handled above
		return true
	}


	render() {
		// This component does not render anything, but...
		// Some JSX is required here for React to see this is a 'component'
		return <Empty />
	}
}


const { bool, func, object, shape, string } = PropTypes

ReactRouterPause.propTypes = {
	history: shape({
		location: shape({
			pathname: string,
			search: string,
			hash: string,
			state: object
		}),
		block: func,
		goBack: func,
		push: func,
		replace: func
	}).isRequired,
	handler: func,
	when: bool,
	config: shape({
		allowBookmarks: bool
	})
}


export default withRouter(ReactRouterPause)
export { ReactRouterPause as Component }
