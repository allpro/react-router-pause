import React from 'react'
import { render, cleanup, wait } from 'react-testing-library'
import isFunction from 'lodash/isFunction'

// { Component } is the RRP component WITHOUT the withRouter() HOC
import { Component as ReactRouterPause } from '../ReactRouterPauseHooks'


// CONSTANTS
const PAGE2 = '/page-2'
const PAGE3 = '/page-3'
const POP = 'POP'
const PUSH = 'PUSH'
const REPLACE = 'REPLACE'
const UNDEFINED = void 0
const UNDEFINED_STATE = UNDEFINED


const initialLocation = {
	pathname: '/',
	search: '',
	hash: '',
	state: undefined
}

let beforeRouteChange = null
const historyUnblock = jest.fn(() => { beforeRouteChange = null })
const history = {
	location: { ...initialLocation }, // Clone location
	block: jest.fn(fn => { beforeRouteChange = fn; return historyUnblock }),
	push: jest.fn(),
	replace: jest.fn(),
	goBack: jest.fn()
}


const createLocation = locData => ({ ...initialLocation, ...locData })
const locationPage2 = createLocation({ pathname: PAGE2 })
const locationPage3 = createLocation({ pathname: PAGE3 })


// Helper that handlers can pass params to so we can check them; see below
const valueTester = jest.fn()

const handler = jest.fn((nav, loc, act) => {
	valueTester(loc, act)
	return true
})

const handler2 = jest.fn((nav, loc, act) => {
	valueTester(loc, act)
	return true
})

const handler3 = jest.fn((nav, loc, act) => {
	valueTester(loc, act)
	return true
})

/* // CLASS MOCK
 function mockClass() {
 let state = {}
 const setState = function(nextState) {
 Object.assign(state, nextState)
 return Promise.resolve(state)
 }
 return { state, setState }
 }
 */


const Component = props => (
	// MOCK props that withRouter() passes so we can track and trigger events
	<ReactRouterPause
		history={history}
		{...props}
	/>
)


afterEach(() => {
	cleanup()
	jest.clearAllMocks()
	beforeRouteChange = null // Ensure cannot use method from previous instance
})


test('renders without crashing', () => {
	render(<Component />)
})

test('renders NOTHING in the DOM', () => {
	const { container } = render(<Component handler={handler} />)
	expect(container).toBeEmpty()
})


test('binds to history.block onMount', () => {
	render(<Component handler={handler} />)
	expect(history.block).toHaveBeenCalledTimes(1) // CALL
	expect(isFunction(beforeRouteChange)).toBeTruthy()
})

test('NOT bind to history.block if invalid handler passed', () => {
	render(<Component handler={{ not: 'a function' }} />)
	expect(history.block).not.toHaveBeenCalled() // NO CALL
})

test('NOT bind to history.block if props.when = false', () => {
	render(<Component handler={handler} when={false} />)
	expect(history.block).not.toHaveBeenCalled() // NO CALL
})

test('unbinds history.block handler onUnmount', () => {
	const { unmount } = render(<Component handler={handler} />)
	expect(history.block).toHaveBeenCalledTimes(1) // CALL

	history.block.mockClear()

	unmount()
	expect(historyUnblock).toHaveBeenCalledTimes(1) // CALL
	expect(history.block).toHaveBeenCalledTimes(0) // NO CALL
})


test('updates handler if new handler passed', () => {
	const { rerender } = render(<Component />)
	expect(history.block).not.toHaveBeenCalled() // NO CALL

	rerender(<Component handler={handler2} />)
	beforeRouteChange(locationPage2, REPLACE)
	expect(handler2).toHaveBeenCalledTimes(1)

	rerender(<Component handler={handler3} />)
	beforeRouteChange(locationPage3, REPLACE)
	expect(handler3).toHaveBeenCalledTimes(1)
})

test('removes blocking if invalid handler passed', () => {
	const { rerender } = render(<Component handler={handler} />)
	expect(history.block).toHaveBeenCalled() // CALL

	history.block.mockClear()
	historyUnblock.mockClear()

	rerender(<Component handler={{ not: 'a function' }} />)
	expect(historyUnblock).toHaveBeenCalled() // CALL
	expect(history.block).not.toHaveBeenCalled() // NO CALL
})


test('handles event if page-location changes', () => {
	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toHaveBeenCalledTimes(1)
})

test('ignores event if location is unchanged', () => {
	render(<Component handler={handler} />)

	beforeRouteChange(initialLocation, PUSH)
	expect(handler).not.toHaveBeenCalled()
})

test('ignores bookmark by default (allowBookmarks = true)', () => {
	render(<Component handler={handler} />)

	// Trigger the 'same location', but with a different bookmark
	const bookmarkLocation = createLocation({ hash: '#bookmark' })
	beforeRouteChange(bookmarkLocation, PUSH)
	expect(handler).not.toHaveBeenCalled() // NO CALL
})

test('handle bookmarks if props.config.allowBookmarks = false', () => {
	const config = { allowBookmarks: false }

	render(<Component handler={handler} config={config} />)

	const bookmarkLocation = createLocation({ hash: '#bookmark' })
	beforeRouteChange(bookmarkLocation, PUSH)
	expect(handler).toHaveBeenCalledTimes(1)
})

test('ignores event if location + hash are both unchanged', () => {
	const config = { allowBookmarks: false }

	const { rerender } = render(<Component handler={handler} config={config} />)

	const bookmarkLocation = createLocation({ hash: '#bookmark' })

	beforeRouteChange(bookmarkLocation, PUSH)
	expect(handler).toHaveBeenCalledTimes(1)

	// Must rerender so we can provide 'previous location' in props.history
	const hstry = {...history, location: bookmarkLocation}
	rerender(<Component handler={handler} config={config} history={hstry} />)

	// NOW we can trigger the 'same location'
	handler.mockClear()
	beforeRouteChange(bookmarkLocation, PUSH)
	expect(handler).not.toHaveBeenCalled()
})


test('allow navigation event if handler returns true', () => {
	handler.mockImplementationOnce(() => true)

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)
})

test('allow navigation event if handler returns undefined', () => {
	handler.mockImplementationOnce(() => UNDEFINED)

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)
})

test('allow navigation event if handler returns invalid response', () => {
	// ONLY true, false, null, undefined & Promise are valid responses
	handler.mockImplementationOnce(() => 0)

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)
})

test('block navigation event if handler returns false', () => {
	handler.mockImplementationOnce(() => false)

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(false)
})

test('block navigation event if handler returns null', () => {
	handler.mockImplementationOnce(() => null)

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(false)
})

test('block navigation event if handler returns any Promise', () => {
	handler.mockImplementationOnce(() => Promise.resolve())

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(false)
})


test('returns location to navigation.pausedLocation() request', async () => {
	handler.mockImplementationOnce(navigation => {
		setTimeout(() => {
			// The returned location is CLONED, so compare pathname, not object
			// noinspection JSUnresolvedFunction
			valueTester(navigation.pausedLocation().pathname)
		}, 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(valueTester).lastCalledWith(locationPage2.pathname)
	})
})

test('returns boolean to navigation.isPaused() request', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => valueTester(navigation.isPaused()), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(valueTester).lastCalledWith(true)
	})
})

test('passes correct location and action params to handler', async () => {
	handler.mockImplementationOnce((nav, location, action) => {
		valueTester(location, action)
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(valueTester).lastCalledWith(locationPage2, REPLACE)
	})
})


test('history.push when handler calls resume()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedVariable
		setTimeout(navigation.resume, 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(locationPage2)
	})
})

test('ignore next event after resuming', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedVariable
		setTimeout(navigation.resume, 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(locationPage2)
	})

	// SIMULATE call to beforeRouteChange that history.push will trigger
	// It should return true this time to allow the navigation uninterrupted
	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)
})

test('history.replace when handler calls resume()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedVariable
		setTimeout(navigation.resume, 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.replace).lastCalledWith(locationPage2)
	})
})

test('history.goBack when handler calls resume()', async () => {
	handler.mockImplementationOnce(() => true)
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedVariable
		setTimeout(navigation.resume, 1)
		return null
	})

	render(<Component handler={handler} />)

	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)

	// NOTE: locationPage3 should be ignored because POP means go-back
	expect(beforeRouteChange(locationPage3, POP)).toBe(false)
	await wait(() => {
		expect(history.goBack).toHaveBeenCalled()
	})
})

test('NOT call history.push when handler calls cancel()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedVariable
		setTimeout(navigation.cancel, 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).not.toBeCalled()
	})
})


test('history.push if handler returns promise.resolve()', async () => {
	handler.mockImplementationOnce(() => (
		Promise.resolve()
	))

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(locationPage2)
	})
})

test('history.push if handler returns promise.resolve(truthy)', async () => {
	handler.mockImplementationOnce(() => (
		Promise.resolve('truthy')
	))

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(locationPage2)
	})
})

test('history.push if handler returns promise.resolve(falsey)', async () => {
	handler.mockImplementationOnce(() => (
		Promise.resolve(0) // Any falsey value that is NOT false
	))

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(locationPage2)
	})
})

test('NOT history.push if handler returns promise.resolve(false)', async () => {
	handler.mockImplementationOnce(() => (
		Promise.resolve(false)
	))

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).not.toBeCalled()
	})
})

test('NOT history.push if handler returns promise.reject()', async () => {
	handler.mockImplementationOnce(() => (
		Promise.reject()
	))

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).not.toBeCalled()
	})
})


test('history.push if handler calls push()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => navigation.push(PAGE3), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(PAGE3, UNDEFINED_STATE)
	})
})

test('history.replace if handler calls replace()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => navigation.replace(PAGE3), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, PUSH)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.replace).lastCalledWith(PAGE3, UNDEFINED_STATE)
	})
})

test('ignore next event after handler calls push()', async () => {
	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => navigation.push(PAGE3), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(PAGE3, UNDEFINED_STATE)
	})

	// SIMULATE call to beforeRouteChange that history.push will trigger
	// It should return true this time to allow the navigation uninterrupted
	expect(beforeRouteChange(locationPage2, PUSH)).toBe(true)
})


test('passes-through state object if handler passes in push()', async () => {
	const state = { foo: 'bar' }

	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => navigation.push(PAGE3, state), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(PAGE3, state)
	})
})

test('passes-through state primitive if handler passes in push()', async () => {
	const state = false

	handler.mockImplementationOnce(navigation => {
		// noinspection JSUnresolvedFunction
		setTimeout(() => navigation.push(PAGE3, state), 1)
		return null
	})

	render(<Component handler={handler} />)

	beforeRouteChange(locationPage2, REPLACE)
	expect(handler).toBeCalled()
	await wait(() => {
		expect(history.push).lastCalledWith(PAGE3, state)
	})
})
