import React, { Fragment } from 'react'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const Code = props => (
	<code style={{ fontSize: '1.2rem', color: '#E00' }}>'{props.text}'</code>
)

function FormDescription() {
	return (
		<Fragment>
			<Typography variant="display1" gutterBottom>
				Integration with a Form
			</Typography>

			<Typography paragraph>
				<strong>When the form is clean</strong> (empty),
				all navigation is <b>allowed</b>.
				<br /><strong>When the form is dirty</strong>,
				navigation to other &apos;pages&apos;
				is <strong>blocked</strong>.
				<br /><strong style={{ color: '#C00' }}>
				Enter some text in the form to trigger navigation blocking.</strong>
			</Typography>

			<Typography paragraph>
				<strong>If config.allowBookmarks = false</strong>,
				Bookmark links are also blocked.
				<br /><strong style={{ color: '#C00' }}>
				Use the switch below to
				toggle <Code text="allowBookmarks" /> true/false.</strong>
			</Typography>

			<Typography paragraph>
				<strong>If props.when = false</strong>,
				navigation blocking is disabled.
				<br /><strong style={{ color: '#C00' }}>
				Use the switch below to
				toggle <Code text="when" /> true/false.</strong>
			</Typography>

			<Divider style={{ margin: '14px 0' }} />

			<Typography paragraph>
				The <strong>Submit</strong> button is also a link.
				<br />Navigation is <strong>paused</strong> while form data
				is <strong>asynchronously validated</strong>.
				<br />If there <em>are</em> validation errors, a message displays.
				<br /><strong>If no error, navigation to the
				confirmation page is resumed.</strong>
			</Typography>
		</Fragment>
	)
}

export default FormDescription
