import React, { Fragment } from 'react'
import Typography from '@material-ui/core/Typography'


function FormDescription() {
	return (
		<Fragment>
			<Typography variant="display1" gutterBottom>
				Integration with a Form
			</Typography>
			<Typography variant="body1" gutterBottom>
				<b>If the form is dirty</b> (changed),
				then navigation to any other &apos;page&apos; is <b>blocked</b>.
				<br /><b style={{ color: '#C00' }}>
				Enter some text into the form to activate blocking.</b>
			</Typography>
			<Typography variant="body1" gutterBottom>
				Blocking will also apply to &apos;bookmarks&apos; <strong>
				<em>IF</em> config.allowBookmarks = false</strong>.
				<br /><b style={{ color: '#C00' }}>
				Use the switch below to change the `allowBookmarks` option.</b>
			</Typography>
			<Typography variant="body1" gutterBottom>
				If the form is <b>clean</b> (unchanged),
				then all navigation is <b>allowed</b>.
			</Typography>
			<Typography variant="body1" gutterBottom>
				The <b>Submit</b> button is also a link component.
				<br />Navigation is <b>paused</b> while the form data
				is <b>asynchronously validated</b>.
				<br /><b>If no form errors, navigation to the
				confirmation page is resumed.</b>
				<br />If there are form errors, a message is displayed.
			</Typography>
		</Fragment>
	)
}

export default FormDescription
