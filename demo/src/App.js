import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import Routes from './Routes'

const drawerWidth = 200

const styles = theme => ({
	root: {
		display: 'flex'
	},
	appBar: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0
	},
	drawerPaper: {
		width: drawerWidth
	},
	toolbar: theme.mixins.toolbar,
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3
	}
})


const navLinkActiveStyle = {
	fontWeight: 'bold',
	color: '#900',
	textDecoration: 'none'
}
const navLinkStyle = {
	textDecoration: 'none'
}

const ListNavItem = withRouter(props => {
	const { pathname } = props.location

	return (
		<ListItem
			button
			component={NavLink}
			to={props.to}
			selected={props.to === pathname}
			style={navLinkStyle}
			activeStyle={navLinkActiveStyle}
		>
			<ListItemText>
				{props.label}
			</ListItemText>
		</ListItem>
	)
})

const { object, string } = PropTypes

ListNavItem.propTypes = {
	to: string,
	label: string,
}


function ReactRouterPauseDemo( props ) {
	const { classes } = props

	return (
		<div className={classes.root}>
			<CssBaseline />

			<AppBar position="fixed" className={classes.appBar}>
				<Toolbar>
					<Typography variant="h6" color="inherit" noWrap>
						React-Router-Pause Demo
					</Typography>
				</Toolbar>
			</AppBar>

			<Drawer
				className={classes.drawer}
				classes={{ paper: classes.drawerPaper }}
				variant="permanent"
				anchor="left"
			>
				<div className={classes.toolbar} />

				<Divider />

				<List>
					<ListNavItem to="/" exact label="Form Page" />
					<ListNavItem to="/page2" label="Page 2" />
					<ListNavItem to="/page3" label="Page 3" />
					<ListNavItem to="/page4" label="Page 4" />
				</List>
			</Drawer>

			<main className={classes.content}>
				<div className={classes.toolbar} />
				<Routes />
			</main>
		</div>
	)
}

ReactRouterPauseDemo.propTypes = {
	classes: object.isRequired
}

export default withStyles(styles)(ReactRouterPauseDemo)
