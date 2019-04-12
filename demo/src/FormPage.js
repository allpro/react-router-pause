import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

import { useFormManager } from '@allpro/form-manager'

import Pause from '@allpro/react-router-pause'
import PromptDialog from './PromptDialog'
import Notification from './Notification'


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


function Form( props ) {
	const form = useFormManager(formConfig)
	const [ dialogProps, setDialogProps ] = useState({})
	const [ notificationProps, setNotificationProps ] = useState({})

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
			submitForm()
			// If data OK, continue; else form is ALREADY displaying errors
			.then(isValid => {
				if (isValid) {
					navigation.resume()
				}
				else {
					setNotificationProps({
						open: true,
						handleClose: () => {
							setNotificationProps({})
						}
					})
				}
			})
		}
		else if (!form.isDirty()) {
			// If form is not dirty, then ALLOW navigation
			return true
		}
		else {
			// If not the submit button, then prompt user with options
			setDialogProps({
				open: true,
				cancel: closeThen(navigation.cancel),
				resume: closeThen(navigation.resume),
				redirect: closeThen(navigation.push, '/page4'),
				onClose: closeThen(noop)
			})
		}

		return null // PAUSE navigation while we wait for prompt response
	}


	const { classes } = props

	return (
		<section>
			<PromptDialog {...dialogProps} />
			<Notification {...notificationProps} />

			<Pause use={handleNavigationAttempt} />

			<Typography variant="title" gutterBottom>
				Sample Form
			</Typography>
			<Typography variant="body1" gutterBottom>
				If the form is <b>dirty</b>, navigation to other pages
				is <b>blocked</b>.
				If the form is <b>clean</b>, navigation is normal.
			</Typography>
			<Typography variant="body1" gutterBottom>
				Clicking <b>Submit</b> will <b>pause navigation</b> while <b>
				asynchronous validation</b> is performed.
				If no errors, navigation will resume.
				If there are errors, a snackbar message appears that
				explains why navigation was blocked.
			</Typography>

			<TextField
				label="Username"
				{...form.allProps('username')}
				fullWidth={true}
				margin="dense"
				FormHelperTextProps={{ classes }}
			/>

			<TextField
				label="Password"
				{...form.allProps('password')}
				fullWidth={true}
				margin="dense"
				FormHelperTextProps={{ classes }}
			/>

			<Button
				color="primary"
				variant="contained"
				onClick={form.reset}
				style={{ margin: '20px 20px 0 0' }}
			>
				Reset
			</Button>

			<Button
				color="secondary"
				variant="contained"
				component={Link}
				to={{ pathname: '/post', state: 'submit' }}
				style={{ margin: '20px 0 0 0' }}
			>
				Submit
			</Button>
		</section>
	)
}

const { object } = PropTypes

Form.propTypes = {
	classes: object.isRequired,
	history: object.isRequired
}

export default withStyles(helperTextStyles)(Form)
