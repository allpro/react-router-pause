import isString from 'lodash/isString'

import { isPromise, isSameFunction, fingerprint } from '../utils'


test('isPromise works correctly', () => {
	// FALSE tests
	const obj = { then: { foo: 'bar' } }
	const func = function() {}
	class mockClass { then = func }

	expect(isPromise(obj)).toBeFalsy()
	expect(isPromise(func)).toBeFalsy()
	expect(isPromise(mockClass)).toBeFalsy()

	// TRUE tests
	const promise = Promise.resolve()
	const thenable = { then: func }

	expect(isPromise(promise)).toBeTruthy()
	expect(isPromise(thenable)).toBeTruthy()
})


test('isSameFunction works correctly', () => {
	const fn1a = function name1() {}
	const fn1b = function name1() {}
	const fn2 = function name2() {}
	const obj = { name: 'name2' }
	const str = 'function'

	expect(isSameFunction(fn1a, fn1a)).toBeTruthy()	// Same function
	expect(isSameFunction(fn1a, fn1b)).toBeTruthy()	// Same function names

	expect(isSameFunction(fn1a, fn2)).toBeFalsy()
	expect(isSameFunction(fn2, obj)).toBeFalsy()
	expect(isSameFunction(obj, obj)).toBeFalsy()
	expect(isSameFunction(str, str)).toBeFalsy()
	expect(isSameFunction(obj, null)).toBeFalsy()
	expect(isSameFunction(str, null)).toBeFalsy()
	expect(isSameFunction(null, null)).toBeFalsy()
})


test('fingerprint works without error', () => {
	const location = {
		pathname: 'pathname',
		search: '?foo=bar&pho=baz',
		hash: '#bookmark'
	}
	const str = fingerprint(location)
	expect(isString(str) && str.length).toBeGreaterThan(0)
})
