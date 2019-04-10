import expect from 'expect'
// import React from 'react'
// import { render, unmountComponentAtNode } from 'react-dom'

import FormManager from '../src'

const data = {
	id: 111,
	uid: '222',
	user: {
		firstName: '',
		lastName: '',
		streetNumber: 555,
		streetName: 'Main St',
		email1: 'me@you.com',
		email2: 'in@valid',
	},
}

const formConfig = {
	fields: {
		'user.firstName': {
			aliasName: 'firstName',
		},
	},
}


// Class mock
let state = {}
const setState = function(nextState) {
	state = nextState
	return Promise.resolve(state)
}
const mockClass = { state, setState }


describe('FormManager', () => {
	const form = FormManager(mockClass, formConfig, data)

	it('contains the data passed in', () => {
		expect(form.getData('user.streetNumber')).toBe(data.user.streetNumber)
		expect(form.getValue('user.streetNumber')).toBe(data.user.streetNumber)

		expect(form.getData('uid')).toBe(data.uid)
		expect(form.getValue('uid')).toBe(data.uid)
	})

	it('correctly updates data', () => {
		// Test string value
		let firstName = 'John'
		form.setValue('user.firstName', firstName)
		expect(form.getData('user.firstName')).toBe(firstName)
		expect(form.getValue('user.firstName')).toBe(firstName)

		// Test using aliasName for both setter and getters
		firstName = 'Jane'
		form.setValue('firstName', firstName)
		expect(form.getData('firstName')).toBe(firstName)
		expect(form.getValue('firstName')).toBe(firstName)
		expect(form.getData('user.firstName')).toBe(firstName)
		expect(form.getValue('user.firstName')).toBe(firstName)

		// Test numeric value
		const uid = 444
		form.setValue('uid', uid)
		expect(form.getData('uid')).toBe(uid)
		expect(form.getValue('uid')).toBe(uid)
	})

	/* Sample
	it( 'displays a welcome message', () => {
		render(<Component/>, node, () => {
			expect( node.innerHTML ).toContain( 'Welcome to React components' )
		})
	})
	*/
})
