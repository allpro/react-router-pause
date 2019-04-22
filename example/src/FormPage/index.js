import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles/index'
import Button from '@material-ui/core/Button/index'
import TextField from '@material-ui/core/TextField/index'
import FormGroup from '@material-ui/core/FormGroup/index'
import FormControlLabel from '@material-ui/core/FormControlLabel/index'
import Switch from '@material-ui/core/Switch/index'
import Divider from '@material-ui/core/Divider'

import { useFormManager } from '@allpro/form-manager'

import ReactRouterPause from '@allpro/react-router-pause'
// import ReactRouterPause from '../ReactRouterPause' // Development

import FormDescription from './FormDescription'
import Bookmarks from './Bookmarks'
import PromptDialog from './PromptDialog'
import Notification from './Notification'
import useScrollTo from './useScrollTo'


const noop = () => null

const helperTextStyles = {
	root: {
		whiteSpace: 'pre-line', // Puts each error-message on its own line
		lineHeight: '1.3em',
		display: 'none' // Hide blocks when not in error-state
	},
	error: {
		display: 'block'
	}
}

const divBlockStyles = {
	margin: '20px 0'
}
const buttonStyles = {
	marginRight: '20px'
}

const formConfig = {
	fieldDefaults: {
		isMUIControl: true, // These demos are using Material UI controls

		validateOnBlur: true,
		revalidateOnChange: true,

		// TEXT-FIELD CLEANING/FORMATTING OPTIONS
		cleaning: {
			cleanOnBlur: true, // Clean field-text onBlur
			trim: true, // Trim leading-/trailing--spaces
			trimInner: true // Replace multi-spaces/tabs with single space
		}
	},

	fields: {
		username: {
			displayName: 'Username',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 20,
				custom: value => /[^0-9a-z-]/gi.test(value)
					? '{name} can contain only numbers, letters and dashes'
					: true
			}
		},
		password: {
			displayName: 'Password',
			inputType: 'password',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 24,
				password: { lower: 1, upper: 1, number: 1, symbol: 1 }
			}
		}
	}
}


function FormPage(props) {
	const [dialogProps, setDialogProps] = useState({})
	const [notificationProps, setNotificationProps] = useState({})
	const [allowBookmarks, setAllowBookmarks] = useState(true)
	const [enableBlocking, setEnableBlocking] = useState(true)

	// Set initial form-data so we can 'reset' back to these values
	const initialData = {
		username: '',
		password: ''
	}
	const form = useFormManager(formConfig, initialData)

	function submitForm() {
		return form.validateAll()
	}

	function handleNavigationAttempt(navigation, location) {
		const closeThen = (fn, arg) => {
			return () => {
				setDialogProps({})
				fn(arg)
			}
		}

		// Check if this is the Submit Link-button
		if (location.state === 'submit') {
			// Return a promise to pause navigation until it settles
			return submitForm()
			.then(isValid => {
				if (isValid) {
					return true // Same as navigation.resume()
				}
				else {
					setNotificationProps({
						open: true,
						handleClose: () => {
							setNotificationProps({})
						}
					})
					return false // Same as navigation.cancel()
				}
			})
		}

		// If form is not dirty, then ALLOW navigation
		if (!form.isDirty()) {
			return true
		}

		// If not the submit button, then prompt user with options
		setDialogProps({
			open: true,
			cancel: closeThen(navigation.cancel),
			resume: closeThen(navigation.resume),
			redirect: closeThen(navigation.push, '/page4'),
			onClose: closeThen(noop)
		})
		return null // null = PAUSE navigation
		// navigation.pause() - Can also use method to signal pause
	}

	// Handle bookmark scrolling
	useScrollTo(props.location.hash)


	const { classes } = props

	return (
		<Fragment>
			<ReactRouterPause
				handler={handleNavigationAttempt}
				when={enableBlocking}
				config={{ allowBookmarks }}
			/>

			<PromptDialog {...dialogProps} />
			<Notification {...notificationProps} />

			<FormDescription />

			<TextField
				label="Username"
				{...form.allProps('username')}
				fullWidth={true}
				style={{ maxWidth: '300px', display: 'block' }}
				margin="dense"
				FormHelperTextProps={{ classes }}
			/>

			<TextField
				label="Password"
				{...form.allProps('password')}
				fullWidth={true}
				style={{ maxWidth: '300px', display: 'block' }}
				margin="dense"
				FormHelperTextProps={{ classes }}
			/>

			<div style={divBlockStyles}>
				<Button
					color="primary"
					variant="contained"
					style={buttonStyles}
					onClick={form.reset}
				>
					Reset
				</Button>

				<Button
					color="secondary"
					variant="contained"
					style={buttonStyles}
					component={Link}
					to={{ pathname: '/post', state: 'submit' }}
				>
					Submit
				</Button>
			</div>

			<Divider />

			<div style={divBlockStyles}>
				<FormGroup row>
					<FormControlLabel
						control={
							<Switch
								checked={enableBlocking}
								onChange={e => {
									setEnableBlocking(e.target.checked)
								}}
							/>
						}
						label="props.when (false = disable all blocking)"
					/>
				</FormGroup>

				<FormGroup row>
					<FormControlLabel
						control={
							<Switch
								checked={allowBookmarks}
								disabled={!enableBlocking}
								onChange={e => {
									setAllowBookmarks(e.target.checked)
								}}
							/>
						}
						label="props.config.allowBookmarks (false = block bookmarks)"
					/>
				</FormGroup>
			</div>

			<Bookmarks />

		</Fragment>
	)
}

const { object } = PropTypes

FormPage.propTypes = {
	classes: object.isRequired,
	history: object.isRequired
}

export default withStyles(helperTextStyles)(FormPage)
