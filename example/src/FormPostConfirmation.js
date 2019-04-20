import React from 'react'
import { withRouter } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

function PagePost(props) {
	return (
		<section>
			<Typography variant="title">
				Form Was Submitted Successfully
			</Typography>

			<Button
				color="primary"
				variant="contained"
				onClick={props.history.goBack}
			>
				Back
			</Button>
		</section>
	)
}

export default withRouter(PagePost)
