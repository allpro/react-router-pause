import React, { Component, Fragment } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'

import LongFormClass from './LongForm'
import LongFormHook from './LongForm/Hook'
import LogFormData from './LogFormData'

const { array, element, oneOfType } = PropTypes

function TabContainer( props ) {
	return (
		<div style={{ padding: '0', border: '1px solid rgba(0,0,0,0.14)' }}>
			{props.children}
		</div>
	)
}

TabContainer.propTypes = {
	children: oneOfType([ array, element ])
}


class FormManagerDemos extends Component {
	state = {
		currentTab: 0
	}

	onChangeTab = ( event, currentTab ) => {
		this.setState({ currentTab }) // eslint-disable-line
	}

	render() {
		const { currentTab } = this.state

		return (
			<Fragment>
				<Typography variant="headline" style={{ margin: '10px' }}>
					Form Manager Examples
				</Typography>

				<AppBar position="static" color="default">
					<Tabs
						value={currentTab}
						onChange={this.onChangeTab}
						indicatorColor="primary"
						textColor="primary"
						variant="scrollable"
						scrollButtons="auto"
					>
						<Tab label="Class Form" />
						<Tab label="Hooks Form" />
						<Tab label="Fields Test Output" />
					</Tabs>
				</AppBar>

				{currentTab === 0 && (
					<TabContainer><LongFormClass /></TabContainer>
				)}
				{currentTab === 1 && (
					<TabContainer><LongFormHook /></TabContainer>
				)}
				{currentTab === 2 && (
					<TabContainer><LogFormData /></TabContainer>
				)}
			</Fragment>
		)
	}
}


render(<FormManagerDemos />, document.querySelector('#demo'))
