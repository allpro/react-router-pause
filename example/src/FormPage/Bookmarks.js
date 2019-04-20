import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const buttonStyles = {
	margin: '0 20px 20px 0'
}

function Bookmarks() {
	return (
		<Fragment>
			<div>
				<Button
					variant="contained"
					color="primary"
					style={buttonStyles}
					component={Link}
					to={'/#bookmark1'}
				>
					Go to Bookmark 1
				</Button>

				<Button
					variant="contained"
					color="primary"
					style={buttonStyles}
					component={Link}
					to={'/#bookmark2'}
				>
					Go to Bookmark 2
				</Button>
			</div>

			<Typography
				id="bookmark1"
				variant="title"
				style={{ marginTop: '800px', padding: '88px 0 16px' }}
			>
				Bookmark 1
			</Typography>
			<Typography paragraph>
				<Button
					variant="contained"
					color="primary"
					component={Link}
					to="/#top"
				>
					Back to top
				</Button>
			</Typography>

			<Typography
				id="bookmark2"
				variant="title"
				style={{ marginTop: '600px', padding: '88px 0 16px' }}
			>
				Bookmark 2
			</Typography>
			<Typography paragraph>
				<Button
					variant="contained"
					color="primary"
					component={Link}
					to="/#top"
				>
					Back to top
				</Button>
			</Typography>

			<Typography
				style={{ marginTop: '1000px' }}
			/>
		</Fragment>
	)
}

export default Bookmarks
