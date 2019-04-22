import React, { useEffect, useRef } from 'react'	// eslint-disable-line
import { withRouter } from 'react-router-dom'		// eslint-disable-line
import PropTypes from 'prop-types'

import cloneDeep from 'lodash/cloneDeep'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'

import { isPromise, isSameFunction, fingerprint } from './utils'
import defaultConfig from './defaultConfig'

const Empty = () => null


/**
 * @public
 * @constructor
 * @returns {Object}
 */
function ReactRouterPause(props) {
	const { history } = props

	// Update config on every load in case something changes
	// Final config from defaultConfig and props.config
	const config = Object.assign({}, defaultConfig, props.config)

	// Temporary flag so can skip blocking 'the next' navigation event
	const ignoreNextNavigationEvent = useRef(false)

	// Cache the location data for navigation event that was delayed.
	const cachedNavigation = useRef(null)

	// Cache for unblock function returned by history.block
	const historyUnblock = useRef(null)

	// Cache the active handler function so can compare between renders
	const handler = useRef(null)

	// Flag to prevent useEffect-unblock from running EXCEPT on unMount
	const runUnmountEffect = false
	// onUnmount handler to ensure history.block callback gets removed
	useEffect(() => unblock, [runUnmountEffect])

	// Update handler and blocking status on every render
	updateBlocking()

	// This component does not render anything, but...
	// NOTE: Some JSX is required here for React to see this is a 'component'
	return <Empty />


	/**
	 * Check props to see if need to change any blocking configuration.
	 * NOTE: This method must be efficient as called after every key-stroke!
	 */
	function updateBlocking() {
		// Abort early if possible
		if (props.when === false) {
			unblock()
			return
		}

		const current = handler.current
		let next = props.handler
		// Ensure param is a function
		if (next && !isFunction(next)) next = null

		// Allow blocking handler to be changed on each render
		// MAY TRIGGER ON EVERY RENDER if 'handler' callback is recreated each
		// time Using a 'named function' will avoid this; see isSameFunction()
		if (!current && !next) {
			// Nothing to do
		}
		else if (current && !next) {
			unblock()
		}
		else if (next && !current) {
			block()
		}
		else if (!isSameFunction(next, current)) {
			block()
		}
	}

	function block() {
		// Unbind current blocker, if set
		unblock()

		handler.current = props.handler

		// Call history.block with listener to fire BEFORE a route-change.
		// The return value is method for unbinding the block listener.
		historyUnblock.current = history.block(beforeRouteChange)
	}

	function unblock() {
		const fn = historyUnblock.current
		historyUnblock.current = null
		handler.current = null
		if (fn) fn()
	}

	/**
	 * Was a handler method passed in to the component?
	 * @returns {boolean}
	 */
	function isBlocking() {
		return !!historyUnblock.current
	}


	/**
	 * Set or clear flag used for skipping the next navigation event.
	 * @param {boolean} enable
	 */
	function allowNextEvent(enable) {
		ignoreNextNavigationEvent.current = !!enable
	}

	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {(Object|null)}
	 */
	function pausedLocation() {
		const route = cachedNavigation.current
		/** @namespace route.location **/
		return route ? cloneDeep(route.location) : null
	}

	/**
	 * Is there currently a location cached that we can 'resume'?
	 * @returns {boolean}
	 */
	function isPaused() {
		return !!cachedNavigation.current
	}


	/**
	 * Resume previously cachedNavigation blocked by handler callback.
	 */
	function resume() {
		if (!isPaused()) return

		let { location, action } = cachedNavigation.current
		action = action.toLowerCase()

		// Avoid blocking the next event
		allowNextEvent(true)

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
	function cancel() {
		cachedNavigation.current = null
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	function push(pathOrLocation, state) {
		allowNextEvent(true) // Avoid blocking this event
		history.push(pathOrLocation, state)
	}

	/**
	 * @param {(string|Object)} pathOrLocation
	 * @param {Object} [state]
	 */
	function replace(pathOrLocation, state) {
		allowNextEvent(true) // Avoid blocking this event
		history.replace(pathOrLocation, state)
	}


	/**
	 * @param {object} location
	 * @param {string} action
	 * @returns {boolean}
	 */
	function askHandler(location, action) {
		let resp = true

		// Prevent a component-level error from breaking router navigation
		try {
			const navigationAPI = {
				isPaused,		// Returns true or false
				pausedLocation,	// Returns location-object or null
				resume,
				cancel,
				push,
				replace
			}
			resp = handler.current(navigationAPI, location, action)
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
			cachedNavigation.current = { location, action }

			// Promise will resume navigation if resolved; cancel if rejected
			if (isPromiseResp) {
				// noinspection JSUnresolvedFunction
				resp
				.then(val => {
					if (val === false) cancel()
					else resume()
				})
				.catch(cancel)
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
	function beforeRouteChange(location, action) {
		const prevLocation = history.location
		// Use fingerprints to easily comparison new to previous location
		const pageChanged = fingerprint(location) !== fingerprint(prevLocation)
		// Bookmarks are NOT included in the location fingerprint
		const hashChanged = location.hash !== prevLocation.hash

		// Block navigation if is the SAME LOCATION we are already at!
		// This prevents reloading a form and losing its contents.
		if (!pageChanged && !hashChanged) {
			return false
		}
		else if (ignoreNextNavigationEvent.current) {
			allowNextEvent(false) // Reset one-time flag
			return true
		}
		// If ONLY a hash/bookmark change AND config.allowBookmarks, allow it
		else if (!pageChanged && config.allowBookmarks) {
			return true
		}
		else if (isBlocking()) {
			// The askHandler method handles the pause/resume functionality.
			// Call the handler to see if we should allow route change (true).
			// Coerce response to a boolean because that's what RR expects.
			const resp = !!askHandler(location, action)

			// There are only 3 responses that block navigation
			if (resp === false || resp === null || isPromise(resp)) {
				return false
			}
		}

		// Allow anything not handled above
		return true
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
