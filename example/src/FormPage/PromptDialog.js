import React from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button/index'
import Dialog from '@material-ui/core/Dialog/index'
import DialogActions from '@material-ui/core/DialogActions/index'
import DialogContent from '@material-ui/core/DialogContent/index'
import DialogContentText from '@material-ui/core/DialogContentText/index'
import DialogTitle from '@material-ui/core/DialogTitle/index'
import Slide from '@material-ui/core/Slide/index'
import Typography from '@material-ui/core/Typography/index'


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
				<Button
					onClick={props.cancel}
					variant="contained"
					color="primary"
				>
					Cancel Navigation
				</Button>

				<Button
					onClick={props.resume}
					variant="contained"
					color="secondary"
				>
					Resume Navigation
				</Button>

				<Button
					onClick={props.redirect}
					variant="contained"
					color="secondary"
				>
					Go to Page 4
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
