import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import Typography from '@material-ui/core/Typography'


function Transition( props ) {
	return <Slide direction="up" {...props} />
}

function PromptDialog(props) {
	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			TransitionComponent={Transition}
			keepMounted
		>
			<DialogTitle>
				Navigation is Paused
			</DialogTitle>

			<DialogContent>
				<DialogContentText gutterBottom>
					You have not finished logging in.
				</DialogContentText>
				<Typography variant="subheading">
					<b>What would you like to do?</b>
				</Typography>
			</DialogContent>

			<DialogActions>
				<Button onClick={props.cancel} color="primary">
					Login
				</Button>

				<Button onClick={props.resume} color="primary">
					Leave
				</Button>

				<Button onClick={props.redirect} color="primary">
					{"Go to Page 4"}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

const { bool, func } = PropTypes

PromptDialog.defaultProps = {
	open: false
}

PromptDialog.propTypes = {
	open: bool,
	onClose: func,
	cancel: func,
	resume: func,
	redirect: func
}


export default PromptDialog
