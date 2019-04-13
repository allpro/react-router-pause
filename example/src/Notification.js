import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import InfoIcon from '@material-ui/icons/Info'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import CloseIcon from '@material-ui/icons/Close'

import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'

const variantIcon = {
	success: CheckCircleIcon,
	warning: WarningIcon,
	error: ErrorIcon,
	info: InfoIcon
}


const styles1 = theme => ({
	message: {
		display: 'flex',
		alignItems: 'center'
	},
	success: {
		backgroundColor: green[600]
	},
	error: {
		backgroundColor: theme.palette.error.dark
	},
	info: {
		backgroundColor: theme.palette.primary.dark
	},
	warning: {
		backgroundColor: amber[700]
	},
	icon: {
		fontSize: 20
	},
	iconVariant: {
		opacity: 0.9,
		marginRight: theme.spacing.unit
	}
})

function CustomSnackbarContent( props ) {
	const { classes, className, message, onClose, variant, ...other } = props
	const Icon = variantIcon[variant]
	const contentClasses = classNames(classes[variant], className)
	const iconClasses = classNames(classes.icon, classes.iconVariant)

	return (
		<SnackbarContent
			className={contentClasses}
			message={
				<span className={classes.message}>
					<Icon className={iconClasses} />
					{message}
				</span>
			}
			action={[
				<IconButton
					key="close"
					aria-label="Close"
					color="inherit"
					className={classes.close}
					onClick={onClose}
				>
					<CloseIcon className={classes.icon} />
				</IconButton>
			]}
			{...other}
		/>
	)
}

const { bool, func, node, object, oneOf, oneOfType, string } = PropTypes

CustomSnackbarContent.propTypes = {
	classes: object.isRequired,
	className: string,
	onClose: func,
	message: oneOfType([string, node]),
	variant: oneOf(['success', 'warning', 'error', 'info'])
}

const StyledCustomSnackbarContent = withStyles(styles1)(CustomSnackbarContent)


const styles2 = theme => ({
	margin: {
		flexGrow: 0,
		margin: theme.spacing.unit,
		fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
	},
	button: {
		padding: theme.spacing.unit / 2
	}
})

function Notification( props ) {
	const { classes } = props
	const msg = props.message || 'Please fix the errors shown.'

	return (
		<Snackbar
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'center'
			}}
			open={props.open}
			autoHideDuration={6000}
			onClose={props.handleClose}
		>
			<StyledCustomSnackbarContent
				variant="warning"
				className={classes.margin}
				message={msg}
				onClose={props.handleClose}
			/>
		</Snackbar>
	)
}

Notification.defaultProps = {
	open: false,
	variant: 'info'
}

Notification.propTypes = {
	classes: object.isRequired,
	className: string,
	open: bool,
	handleClose: func,
	message: oneOfType([string, node]),
	variant: oneOf(['success', 'warning', 'error', 'info'])
}

export default withStyles(styles2)(Notification)
