import isFunction from 'lodash/isFunction'

import ReactRouterPause from '../'
// ReactRouterPauseHooks NOT exported by index.js - for testing only!
import ReactRouterPauseHooks from '../ReactRouterPauseHooks'


test('ReactRouterPause exports correctly', () => {
	expect(isFunction(ReactRouterPause)).toBeTruthy()
})

test('ReactRouterPauseHooks exports correctly', () => {
	expect(isFunction(ReactRouterPauseHooks)).toBeTruthy()
})
