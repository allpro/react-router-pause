import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import assign from 'lodash/assign'

import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import {
	render
	// fireEvent,
	// cleanup,
	// wait,
	// waitForElement,
} from 'react-testing-library'

import ReactRouterPause from '../'


const handler = jest.fn()
const unblockMock = jest.fn()

// const history = jest.genMockFromModule({
const history = {
	block: jest.fn(() => unblockMock),
	push: jest.fn(),
	replace: jest.fn(),
	goBack: jest.fn()
}

const location = {
	pathname: '/',
	search: '',
	hash: '',
	state: undefined
}

const Component = props => (
	<MemoryRouter initialEntries={[ location.pathname ]}>
		<ReactRouterPause
			history={history}
			location={assign({}, location)}
			{...props}
		/>
	</MemoryRouter>
)

// Class mock
/* HOLD
 let state = {}
 const setState = function(nextState) {
 state = nextState
 return Promise.resolve(state)
 }
 const mockClass = { state, setState }
 */


// afterEach(expect.restoreSpies)
afterEach(jest.clearAllMocks)


test('renders without crashing', () => {
	render(<Component />)
})

test('binds history.block handler onMount', () => {
	render(<Component use={handler} />)
	expect(history.block).toHaveBeenCalledTimes(1)
})

test('unbinds history.block handler onUnmount', () => {
	const { unmount } = render(<Component use={handler} />)
	unmount()
	expect(unblockMock).toHaveBeenCalledTimes(1)
	// console.warn({ history })
})

test('calls the navigation handler onRouteChange', () => {
	const { debug, rerender } = render(<Component use={handler} />)
	debug() // Output DOM markup at END of test output
	expect(handler).toBeCalledTimes(1)
	// expect(handler).toBeCalledWith([])
	// rerender(<Component use={handler} pathname={'/next'} />)
	// expect(handler).toHaveBeenCalledTimes(1)
})
