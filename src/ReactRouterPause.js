import React from 'react'						// eslint-disable-line
import { withRouter } from 'react-router-dom'	// eslint-disable-line
import PropTypes from 'prop-types'

import bindAll from 'lodash/bindAll'
import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import pick from 'lodash/pick'

import { isPromise, isSameFunction, fingerprint } from './utils'
import defaultConfig from './defaultConfig'


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
		this.cachedNavigation = null

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
		const route = this.cachedNavigation
		/** @namespace route.location **/
		return route ? cloneDeep(route.location) : null
	}

	/**
	 * Clear the cached location
	 */
	clearCache() {
		this.cachedNavigation = null
	}

	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {boolean}
	 */
	isPaused() {
		return !!this.cachedNavigation
	}

	/**
	 * Resume previously cachedNavigation blocked by handler callback.
	 */
	resume() {
		if (!this.isPaused()) return

		const { history } = this.props
		let { location, action } = this.cachedNavigation
		action = action.toLowerCase()
		this.clearCache()

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
		this.clearCache()
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	push(pathOrLocation, state) {
		this.clearCache()
		this.allowNextEvent(true) // Avoid blocking this event
		this.props.history.push(pathOrLocation, state)
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	replace(pathOrLocation, state) {
		this.clearCache()
		this.allowNextEvent(true) // Avoid blocking this event
		this.props.history.replace(pathOrLocation, state)
	}


	/**
	 * @param {object} location
	 * @param {string} action
	 * @returns {boolean}
	 */
	askHandler(location, action) {
		let resp = true
		let pauseCalled = false

		// Cache route info so can resume route later
		this.cachedNavigation = { location, action }

		const navigationAPI = pick(this, [
			'isPaused',			// Returns true or false
			'pausedLocation',	// Returns location-object or null
			'resume',
			'cancel',
			'push',
			'replace'
		])
		// Add SYNCHRONOUS pause method to API
		// Allows 'pause' to be set via an API call instead of returning null
		navigationAPI.pause = () => {
			pauseCalled = true
		}

		// Prevent a component-level error from breaking router navigation
		try {
			resp = this.handler(navigationAPI, location, action)
		}
		catch (err) {} // eslint-disable-line

		// If pausedLocation is empty, an api method must have been called
		if (!this.isPaused()) {
			return false
		}

		// If navigation.pause() was called, THIS TAKES PRECEDENT
		if (pauseCalled) {
			resp = null
		}

		// A Null response means pause/delay navigation
		if (isNull(resp)) {
			return false
		}

		// A Promise response means pause/delay navigation
		// Promise will resume navigation if resolved; cancel if rejected
		if (isPromise(resp)) {
			// noinspection JSUnresolvedFunction,JSObjectNullOrUndefined
			resp
			.then(val => {
				if (val === false) this.cancel()
				else this.resume()
			})
			.catch(this.cancel)

			return false
		}


		// NOT PAUSED, so clear the cached location
		this.clearCache()

		if (resp === false) {
			return false
		}
		if (resp === true || isUndefined(resp)) {
			return true
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
			if (resp === false || isNull(resp) || isPromise(resp)) {
				return false
			}
		}

		// Allow anything not handled above
		return true
	}


	render() {
		return null
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
