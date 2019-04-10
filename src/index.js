import forOwn from 'lodash/forOwn'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isObjectLike from 'lodash/isObjectLike'
import pick from 'lodash/pick'

const IGNORE_RESPONSE = 'IGNORE_RESPONSE'

let router = null // Pointer to the BrowserRouter object; set by init.
let unblockNavigation = null // Method to remove router.history.block handler.

let currentLocationFingerprint = '' // Current location for comparison.
let autoNameIncrementer = 0

let delayedNavigation = null // Location data for navigation that was delayed.
let blockingComponent = null // Component responsible for delayedNavigation.

/**
 * Hash of current subscribers to the route-blocking feature.
 * Subscribers are keyed by the component-name or other identifier passed.
 * Subscription callback will be called by askBlockSubscribers.
 *
 * NOTE: It's unlikely there will be more than one subscription at a time.
 *
 * @type {Object}
 */
const blockSubscribers = {}
let ignoreBlockSubscribers = false


/**
 * Init this helper; binds beforeRouteChange to router.history.block
 *
 * @public
 * @param {BrowserRouter} browserRouter
 */
function init(browserRouter) {
	router = browserRouter

	// Option history.block accepts a listener that fires BEFORE a route-change.
	// Return value of block() is method for unbinding the listener.
	unblockNavigation = router.history.block(beforeRouteChange)
}

/**
 * Unbind router.history listener and reset all tracking data.
 *
 * @public
 */
function destroy() {
	unsetBlockingComponent()
	unsubscribeAllBlocking()
	delayedNavigation = null

	if (unblockNavigation) {
		unblockNavigation()
		unblockNavigation = null
	}
}

/**
 * Method for components to subscribe a callback for beforeRouteChange.
 * Normally called from componentWillMount or componentDidMount.
 * NOTE: It's unlikely there will be more than one subscription at a time.
 *
 * @public
 * @param {string} name
 * @param {Function} callback
 */
function subscribeBlocking(name, callback) {
	if (isFunction(callback)) {
		blockSubscribers[name] = callback
	}
}

/**
 * Method for components to unsubscribe listener for beforeRouteChange.
 * Normally called from componentWillUnmount.
 *
 * @public
 * @param {string} name
 */
function unsubscribeBlocking(name) {
	delete blockSubscribers[name]
}

/**
 * Helper for destroy() method, to remove all subscriptions.
 */
function unsubscribeAllBlocking() {
	forOwn(blockSubscribers, (callback, name) => {
		unsubscribeBlocking(name)
	})
}

/**
 * Only a single component can be the CURRENT BLOCKER of delayedNavigation.
 * This is the 1st subscribed component to return null or a promise when called.
 * Only the blockingComponent can resumeNavigation for the delayedNavigation,
 * 	or trigger resume by resolving the promise it returned (if applicable).
 * If a different component calls resumeNavigation(), it will be ignored.
 *
 * @param {string} name			Component name subscribed by
 * @param {Promise} [promise]	Promise returned by subscription callback
 */
function setBlockingComponent(name, promise) {
	blockingComponent = { name, promise }
	if (promise) {
		// Create handlers to maintain component name inside a closure
		const resolver = onResolveBlockPromise(name)
		const rejecter = onRejectBlockPromise(name)
		// Promise will resume navigation if resolved; cancel if rejected
		promise.then(resolver, rejecter)
	}
}

/**
 * When navigation is cancelled, resumed or confirmed, reset blockingComponent.
 *
 * @param {string} [name]
 */
function unsetBlockingComponent(name) {
	if (!blockingComponent) return

	if (!name || isNavigationDelayed(name)) {
		blockingComponent = null
	}
}

/**
 * Resolver for Blocking-Promise; bound to promise.resolve()
 *
 * @param {string} name
 */
function onResolveBlockPromise(name) {
	// Maintain 'name' value inside this closure
	return resp => {
		if (resp !== IGNORE_RESPONSE) {
			resumeNavigation(name)
		}
	}
}

/**
 * Rejecter for Blocking-Promise; bound to promise.reject()
 *
 * @param {string} name
 */
function onRejectBlockPromise(name) {
	// Maintain 'name' value inside this closure
	return () => {
		cancelNavigation(name)
	}
}

/**
 * Check if a SPECIFIC COMPONENT delayedNavigation, and so can resumeNavigation.
 *
 * @public
 * @param {string} name
 */
function isNavigationDelayed(name) {
	if (!delayedNavigation || !blockingComponent) return false
	return name && name === blockingComponent.name
}

/**
 * Resume previously delayedNavigation - blocked by this component's callback.
 * A component can only resumes navigation that IT blocked.
 *
 * @public
 * @param {string} name
 */
function resumeNavigation(name) {
	if (!blockingComponent) return

	// A component can only resume its own delayedNavigation
	if (!isNavigationDelayed(name)) return

	unsetBlockingComponent(name)

	const opts = { skip: name } // Don't ask component that is resuming
	const allowNavigation = askBlockSubscribers(delayedNavigation, opts)
	if (!allowNavigation) return

	const { location } = delayedNavigation
	const action = delayedNavigation.action.toLowerCase()
	delayedNavigation = null

	// Flag so beforeRouteChange SKIPS blockSubscribers in next route change.
	ignoreBlockSubscribers = true

	// prettier-ignore
	if (action === 'pop') {
		router.history.goBack()
	}
	else { // (PUSH|REPLACE)
		router.history[action](location)
	}
}

/**
 * Cancel previously delayedNavigation - blocked by this component's callback.
 * A component can only cancel navigation that IT blocked.
 *
 * @public
 * @param {string} name
 */
function cancelNavigation(name) {
	if (!blockingComponent) return

	// A component can only cancel its own delayedNavigation
	if (!isNavigationDelayed(name)) return

	unsetBlockingComponent(name)
	delayedNavigation = null
}

/**
 * Call each component's callback subscribed to route-change-blocking.
 * NOTE: It's unlikely there will be more than one subscription at a time.
 *
 * @param {Object} navigation
 * @param {Object} [opts]
 * @returns {boolean}
 */
function askBlockSubscribers(navigation, opts = {}) {
	const { location, action } = navigation
	let confirmed = true

	forOwn(blockSubscribers, (callback, name) => {
		// SKIP listener if specified by opts
		if (name === opts.skip) return true

		let resp = true
		// Avoid a component-level error from causing an issue here
		try {
			resp = callback(location, action)
		}
		catch (err) {} // eslint-disable-line

		// noinspection JSUnresolvedVariable
		const isPromise = isObjectLike(resp) && resp.then
		const isNull = resp === null

		if (isBoolean(resp)) {
			// A boolean response means allow or cancel - NO delayedNavigation.
			// IF this component was previously blocking, clear that now.
			unsetBlockingComponent(name)
			confirmed = resp
		}
		else if (isNull || isPromise) {
			// Navigation is delayed, so cache route for possible resuming
			delayedNavigation = { location, action }
			setBlockingComponent(name, isPromise ? resp : null)
			confirmed = false
		}
		else {
			// Log a warning if an invalid response received, including undefined
			console.error(
				`Invalid response to routeManager-blockNavigation: ${resp}` +
				' Valid responses are: true, false, Null or Promise'
			)
		}

		// Stop checking as soon as any subscriber blocks navigation
		if (!confirmed) {
			return false // BREAK loop
		}
	})

	// Return true (allow) or false (block) to beforeRouteChange()
	return confirmed
}

/**
 * Listener for history.block - fires BEFORE a route-change.
 *
 * @param {Object} location		Object with location, hash, etc.
 * @param {string} action		One of [PUSH|REPLACE|POP]
 */
function beforeRouteChange(location, action) {
	// Block navigation if is the same location
	if (!isLocationDifferent(location)) {
		return false
	}

	// DEBUG: Enable this to log every _attempted_ route-change, blocked or not.
	// console.log(location)

	// prettier-ignore
	if (ignoreBlockSubscribers) {
		// Clear bypass-flag set by navigate()
		ignoreBlockSubscribers = false
	}
	else {
		const allowNavigation = askBlockSubscribers({ location, action })
		if (!allowNavigation) return false
	}

	// Cache the new location for comparison next time
	currentLocationFingerprint = createLocationFingerprint(location)
	return true
}

/**
 * Helper to create a fingerprint string for easy comparisons
 *
 * @param {Object} location
 * @returns {string}
 */
function createLocationFingerprint(location) {
	return JSON.stringify(pick(location, ['pathname', 'search', 'hash', 'state']))
}

/**
 * Compare new location to previous location to see if different.
 *
 * @param {Object} location
 * @returns {boolean}
 */
function isLocationDifferent(location) {
	return createLocationFingerprint(location) !== currentLocationFingerprint
}


/**
 * Export public methods as an object.
 *
 * @type {Object<function>}
 */
const routerManager = {
	init,
	destroy,
	subscribeBlocking,
	unsubscribeBlocking,
	isNavigationDelayed,
	resumeNavigation,
	cancelNavigation
}

/**
 * Instance wrapper for nav-blocking, to simplify component use and syntax.
 * Also removes necessity for passing a component name to each method.
 *
 * @param {function} callback
 * @returns {BlockNavigation}
 * @constructor
 */
function BlockNavigation(callback) {
	// Auto-instantiate an instance
	if (!(this instanceof BlockNavigation)) {
		return new BlockNavigation(callback)
	}

	const name = `component-${++autoNameIncrementer}`

	subscribeBlocking(name, callback)

	return {
		destroy: () => unsubscribeBlocking(name),
		resume: () => resumeNavigation(name),
		cancel: () => cancelNavigation(name),
		isDelayed: () => isNavigationDelayed(name)
	}
}

export default routerManager
export { BlockNavigation }
