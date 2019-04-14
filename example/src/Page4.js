import React from 'react'
import { withRouter } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

function Page3(props) {
	return (
		<section>
			<Typography variant="title">
				Page 4
			</Typography>
			<Typography paragraph>
				You successfully navigated to: Page 4
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

export default withRouter(Page3)
