import React, { createRef } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'

import Routes from './Routes'

const theme = createMuiTheme({
	palette: {
		type: 'dark',
	},
})

const drawerWidth = 200

const styles = theme => ({
	root: {
		display: 'flex'
	},
	appBar: {
		marginLeft: drawerWidth,
		[theme.breakpoints.up('sm')]: {
			width: `calc(100% - ${drawerWidth}px)`,
		}
	},
	drawer: {
		[theme.breakpoints.up('sm')]: {
			width: drawerWidth,
			flexShrink: 0,
		}
	},
	drawerPaper: {
		width: drawerWidth,
		backgroundColor: '#24306b'
	},
	content: {
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3
	},
	menuButton: {
		marginRight: 20,
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	toolbar: theme.mixins.toolbar,
	topLeftToolbar: {
		...theme.mixins.toolbar,
		backgroundColor: 'rgba(0, 0, 0, 0.54)',
		color: 'white'
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
	const { label, to, external, exact = false } = props
	const { pathname } = props.location

	const itemProps = {
		selected: to === pathname,
		style: navLinkStyle
	}
	if (external) {
		Object.assign(itemProps, {
			href: to,
			component: 'a',
			target: '_blank'
		})
	}
	else {
		Object.assign(itemProps, {
			to,
			exact,
			component: NavLink,
			activeStyle: navLinkActiveStyle
		})
	}

	return (
		<ListItem button {...itemProps}>
			<ListItemText>
				{label}
			</ListItemText>
		</ListItem>
	)
})

const { object, string } = PropTypes

ListNavItem.propTypes = {
	to: string,
	label: string
}

function DrawerContents(props) {
	const { classes } = props;

	return (
		<MuiThemeProvider theme={theme}>
			<div className={classes.topLeftToolbar}>
				<Toolbar>
					<Typography
						variant="subheading"
						color="inherit"
						noWrap
					>
						Navigation
					</Typography>
				</Toolbar>
			</div>

			<Divider />

			<List>
				<ListNavItem to="/" exact label="Form Page"DrawerContents />
				<ListNavItem to="/page2" label="Page 2"DrawerContents />
				<ListNavItem to="/page3" label="Page 3"DrawerContents />
				<ListNavItem to="/page4" label="Page 4"DrawerContents />
			</List>

			<Divider />

			<List>
				<ListNavItem
					label="Readme"
					to="https://github.com/allpro/react-router-pause/blob/master/README.md"
					external
				/>
				<ListNavItem
					label="CodeSandbox Demo"
					to="https://codesandbox.io/s/github/allpro/react-router-pause/tree/master/example"
					external
				/>
			</List>
		</MuiThemeProvider>
	)
}

class ReactRouterPauseDemo extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			openDrawer: false,
		}

		// Use wrapper as container for Drawer so works well inside CodeSandbox
		this.containerRef = createRef()

		this.toggleDrawer = this.toggleDrawer.bind(this)
	}

	toggleDrawer() {
		this.setState(state => ({ openDrawer: !state.openDrawer }));
	}

	render() {
		const { classes } = this.props

		return (
			<div className={classes.root} ref={this.containerRef}>
				<CssBaseline />

				<AppBar position="fixed" className={classes.appBar}>
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="Open drawer"
							onClick={this.toggleDrawer}
							className={classes.menuButton}
						>
							<MenuIcon />
						</IconButton>

						<Typography variant="h6" color="inherit" noWrap>
							React-Router-Pause Example
						</Typography>
					</Toolbar>
				</AppBar>

				<nav className={classes.drawer}>
					{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
					<Hidden smUp implementation="css">
						<Drawer
							variant="temporary"
							container={this.containerRef.current}
							anchor="left"
							open={this.state.openDrawer}
							onClose={this.toggleDrawer}
							classes={{ paper: classes.drawerPaper }}
						>
							<DrawerContents classes={classes} />
						</Drawer>
					</Hidden>

					<Hidden xsDown implementation="css">
						<Drawer
							variant="permanent"
							open
							classes={{
								paper: classes.drawerPaper,
							}}
						>
							<DrawerContents classes={classes} />
						</Drawer>
					</Hidden>
				</nav>

				<main id="top" className={classes.content}>
					<div className={classes.toolbar} />
					<Routes />
				</main>
			</div>
		)
	}
}

ReactRouterPauseDemo.propTypes = {
	classes: object.isRequired
}

export default withStyles(styles)(ReactRouterPauseDemo)
