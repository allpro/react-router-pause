# React Router Pause (Async)

[![npm package][npm-badge]][npm]
[![gzip-size][gzip-size-badge]][gzip-size]
[![install-size][install-size-badge]][install-size]
[![build][build-badge]][build]
[![coverage][coveralls-badge]][coveralls]
[![license][license-badge]][license]
[![donate][donate-badge]][donate]


[React-Router-Pause](https://www.npmjs.com/package/@allpro/react-router-pause) 
(**"RRP"**) is a Javascript utility for React Router v4 & v5.
It provides a simple way to _asynchronously_ delay (pause) 
router navigation events triggered by the user.
For example, if a user clicks a link while in the middle of a process,
and they will _lose data_ if navigation continues.

This Readme is also at: https://allpro.github.io/react-router-pause

**RRP is _similar to:_**
- the React Router 
[Prompt](https://reacttraining.com/react-router/web/api/Prompt) component,
- the
[router.history.block](https://github.com/ReactTraining/history#blocking-transitions)
option,
- and the
[createHistory.getUserConfirmation()](https://github.com/ReactTraining/history/blob/master/README.md#customizing-the-confirm-dialog)
option.

**Motivation**

The standard React Router
[Prompt component](https://reacttraining.com/react-router/web/api/Prompt) 
is synchronous by default, so can display ONLY `window.prompt()` 
messages. The same applies when using 
[router.history.block](https://github.com/ReactTraining/history#blocking-transitions).

The `window.prompt()` dialog is relatively **ugly** and cannot be 
customized. They are inconsistent with the attractive dialogs most modern 
apps use. **The motivation for RRP was it overcome this limitation.**

It is _possible_ to have an asychronous dialog by customizing
[createHistory.getUserConfirmation()](https://github.com/ReactTraining/history/blob/master/README.md#customizing-the-confirm-dialog).
However this is clumsy and allows only a single, global configuration.

**Advantages of RRP**

- Useful for anything async; not just 'prompt messages'.
- _Very easy_ to add asynchronous navigation blocking.
- Fully customizable by each component - _no limitations_.
- Does not require modifying the history object.
- Is compatible with React Native and server-side-rendering.


## Installation

-   NPM: `npm install @allpro/react-router-pause`
-   Yarn: `yarn add @allpro/react-router-pause`
-   CDN: Exposed global is `ReactRouterPause`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/react-router-pause/umd/react-router-pause.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/react-router-pause/umd/react-router-pause.min.js"></script>`

## Compatibility

RRP is designed for maximum backwards compatibility.
It's a React class-component that utilizes the `withRouter()` HOC provided
by React-Router 4+. 
RRP does not _hack_ the router context or use any non-standard trickery
that might cause compatibility issues in the future.

#### Peer-Dependencies

RRP will work in **_any project_** using React-Router 4.x _or_ 5.x, 
which requires React >=15.
```json
"peerDependencies": {
    "prop-types": ">=15",
    "react": ">=15",
    "react-dom": ">=15",
    "react-router-dom": ">=4"
}
```

#### React-Hooks Testing Version

There is _also_ a version of RRP using **React-hooks**.
This is _not exported_ because it requires React 16.8 or higher,
so is not compatible with older projects.
This version is in the repo for anyone interested:
<br>https://github.com/allpro/react-router-pause/blob/master/src/ReactRouterPauseHooks.js

When React-Router is eventually updated to provide React-hooks,
the RRP hooks-version will be updated to take advantage of this.
It may become the recommended version for projects using 
the updated React-Router.


## Usage

RRP is a React component, but does NOT render any output.
RRP also does NOT display any prompts itself.
It only provides a way for your code to hook into and control the router.

The RRP component accepts 3 props, but only `handler` is required:

```javascript
<ReactRouterPause 
    handler={ handleNavigationAttempt }
    when={ isFormDirty }
    config={{ allowBookmarks: false }}
/>
```

A handler function could looks something like this: 

```javascript
function handleNavigationAttempt( navigation, location, action ) {
	// Call an async function that returns a promise; wait for it to resolve...
	preloadNextPage( location.pathname )
	    .then( navigation.resume ) // CONTINUE with navigation event
	    .catch(error => {
	    	navigation.cancel()    // CLEAR the navigation data (optional)
	    	displayErrorMessage(error)
	    })

	return null // Returning null means PAUSE navigation
}
````

### Properties

The RRP component accepts 3 props:

- #### `handler` `{function} [null]` _optional_

  Called each time a router navigation event occurs.
  If a handler is not provided, RRP is disabled.
  <br>See 'Event Handler' details below.

- #### `when` `{boolean} [true]` _optional_

  Set `when={false}` to temporarily disable the RRP component.
  This is an alternative to using conditional rendering.

- #### `config` `{object} [{}]` _optional_

  An configuration object to change RRP logic.

  - #### `config.allowBookmarks` `{boolean} [true]`
    Should links to bookmarks on the same page _always_ be allowed?
    <br>If `false`, bookmark links are treated the same as page-links.


### Event Handler Function

The function specified in the `handler` prop _handles_ navigation events.
It is called _each time_ the router is about to change the location (URL).

**Three arguments are passed to the handler when it is called:**

- #### `navigation` `{object}`

  The methods in this object provide control of router navigation.
  <br>See **Methods of 'navigation' Object** below for details.
  
- #### `location` `{object}`

  A React Router 
  [`location`](https://reacttraining.com/react-router/web/api/location)
  object describing the navigation event that was triggered.
  
- #### `action` `{string}`

  The navigation action-type that triggered the navigation event. 
  <br>One of `PUSH`, `REPLACE`, or `POP` 
  
  
#### Methods of 'navigation' Object

The `navigation` object passed to the handler function provides these methods:

- **navigation.isPaused()** - Returns `true` or `false` to indicate if any 
    navigation event is currently paused.
- **navigation.pausedLocation()** - Returns the `location` object representing
     the paused navigation, or `null` if no event is paused.
- **navigation.resume()** - Triggers the 'paused' navigation event to occur.
- **navigation.cancel()** - Clears 'paused' navigation so can no longer be resumed.
- **navigation.push(** path, state **)** - The `router.history.push()` method,
    in case you wish to redirect a user to an alternate location
- **navigation.replace(** path, state **)** - The `router.history.replace()` method,
    in case you wish to redirect a user to an alternate location.

**NOTE: It is _not necessary_ to call `navigation.clear()`.** 
<br>Each new navigation event _replaces_ the previous one, 
therefore `navigation.resume()` will always go to **_ the last location_** 
clicked by the user. 
Calling `navigation.cancel()` is useful if you use the
`navigation.isPaused()` method, as 'cancel' makes isPaused = false.

#### Event Handler Function Return Values

When called, the handler set in `handler` must return one of these 5 values
to the RRP component:

- **`true`** or **`undefined`** - Allow navigation to continue.
- **`false`** - Cancel the navigation event, permanently.
- **`null`** - Pause navigation so can _optionally_ be resumed later.
- **`Promise`** - Pause navigation until promise is settled, then:
  - If promise is _rejected_, **cancel** navigation
  - If promise _resolves_ with a value of `false`, **cancel** navigation
  - If promise _resolves_ with any other value, **resume** navigation

This example pauses navigation, then resumes after 10 seconds.

```javascript
function handleNavigationAttempt( navigation, location, action ) {
	setTimeout( navigation.resume, 10000 ) // RESUME after 10 seconds
	return null // null means PAUSE navigation
}
````

The example below returns a promise to pause navigation while validating
data asynchronously. If the promise **resolves**,
navigation will resume _unless_ `false` is returned by promise.
If the promise **rejects**, navigation is cancelled.

```javascript
function handleNavigationAttempt( navigation, location, action ) {
	return verifySomething(data)
	    .then(isValid => {
	    	if (!isValid) {
	    		showErrorMessage()
	    		return false // Cancel Navigation
	    	}
	    	// Navigation resumes if 'false' not returned, and not 'rejected'
	    })
}
````


# Same-Location Blocking

RRP _automatically_ blocks navigation if the new location is the same as the
current location. This prevents scenarios where React Router _reloads_ a form 
when the user clicks the same page-link again.

The comparison between two locations includes:

- pathname ("https://domain.com/section/page.html")
- search ("?key=value&otherValues)
- state ("value" or { foo: 'bar' })

The 'hash' (bookmark) it ignored by default.
<br>See `config.allowBookmarks` in the **Properties** section above.


## Implementation

A common requirement in an app is to _ask_ a user if they wants to 'abort' a 
process, (such as filling out a form), when they click a navigation link. 

**Below are 2 examples using a custom 'confirmation dialog'**, 
showing different ways to integrate RRP with your code.

### Functional Component Example

This example keeps all code _inside_ the handler function,
where it has access to the `navigation` methods. 
The [`setState` hook](https://reactjs.org/docs/hooks-state.html) 
is used to store and pass handlers to a confirmation dialog.

```javascript
import React, { Fragment } from 'react'
import { useFormManager } from '@allpro/form-manager'
import ReactRouterPause from '@allpro/react-router-pause'

import MyCustomDialog from './MyCustomDialog'

// Functional Component using setState Hook
function myFormComponent( props ) {
    // Sample form handler so can check form.isDirty()
    const form = useFormManager( formConfig, props.data )
    
    const [ dialogProps, setDialogProps ] = useState({ open: false })
    const closeDialog = () => setDialogProps({ open: false })

    function handleNavigationAttempt( navigation, location, action ) {
        setDialogProps({
            open: true,
            handleStay: () => { closeDialog(); navigation.cancel() },
            handleLeave: () => { closeDialog(); navigation.resume() },
            handleHelp: () => { closeDialog(); navigation.push('/form-help') }
        })
        // Return null to 'pause' and save the route so can 'resume'
        return null
    }

    return (
        <Fragment>
             <ReactRouterPause 
                 handler={handleNavigationAttempt}
                 when={form.isDirty()}
             />
        
             <MyCustomDialog {...dialogProps}>
                 If you leave this page, your data will be lost.
                 Are you sure you want to leave?
             </MyCustomDialog>
        
        ...
        </Fragment>
    )
}
```

### Class Component Example

In this example the navigation object is assigned to a property so it is 
accessible to all every method in the class.
(Another alternative would be to _pass_ the navigation object to subroutines.)

```javascript
import React, { Fragment } from 'react'
import FormManager from '@allpro/form-manager'
import ReactRouterPause from '@allpro/react-router-pause'

import MyCustomDialog from './MyCustomDialog'

// Functional Component using setState Hook
class myFormComponent extends React.Component {
    constructor(props) {
        super(props)
        this.form = FormManager(this, formConfig, props.data)
        this.state = { showDialog: false }
        this.navigation = null
    }

    handleNavigationAttempt( navigation, location, action ) {
        this.navigation = navigation
        this.setState({ showDialog: true })
        // Return null to 'pause' and save the route so can 'resume'
        return null
    }
    
    closeDialog() {
        this.setState({ showDialog: false })
    }
    
    handleStay() {
        this.closeDialog()
        this.navigation.cancel()
    }
    
    handleLeave() {
        this.closeDialog()
        this.navigation.resume()
   }
    
    handleShowHelp() {
        this.closeDialog()
        this.navigation.push('/form-help')
    }

    render() {
        return (
            <Fragment>
                <ReactRouterPause 
                    handler={this.handleNavigationAttempt}
                    when={this.form.isDirty()}
                />
        
                {this.state.showDialog &&
                    <MyCustomDialog
                         onClickStay={this.handleStay}
                         onClickLeave={this.handleLeave}
                         onClickHelp={this.handleShowHelp}
                    >
                        If you leave this page, your data will be lost.
                        Are you sure you want to leave?
                    </MyCustomDialog>
                }
            ...
            </Fragment>
        )
    }
}
```


## Live Demo

Try the demo at: https://allpro.github.io/react-router-pause

Play with the demo at:
https://codesandbox.io/s/github/allpro/react-router-pause/tree/master/example

If you pull or fork the repo, you can run the demo like this:
- In the root folder, run `npm start`
- In a second terminal, in the `/example` folder, run `npm start`
- The demo will start at http://localhost:3000
- Changes to the component _or_ the demo will auto-update the browser


## Built With

- [create-react-library](https://github.com/DimiMikadze/create-react-library) - 
A React component framework based on
[create-react-app](https://github.com/facebook/create-react-app)

## Contributing

Please read 
[CONTRIBUTING.md](https://github.com/allpro/react-router-pause/blob/master/CONTRIBUTING.md)
for details on our code of conduct, 
and the process for submitting pull requests to us.

## Versioning

We use SemVer for versioning. For the versions available, 
see the tags on this repository.

## License

MIT © [allpro](https://github.com/allpro)
<br>See
[LICENSE](https://github.com/allpro/react-router-pause/blob/master/LICENSE)
file for details


[gzip-size-badge]: http://img.badgesize.io/https://cdn.jsdelivr.net/npm/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js?compression=gzip
[gzip-size]: http://img.badgesize.io/https://cdn.jsdelivr.net/npm/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js

[install-size-badge]: https://packagephobia.now.sh/badge?p=@allpro/react-router-pause
[install-size]: https://packagephobia.now.sh/result?p=@allpro/react-router-pause

[npm-badge]: http://img.shields.io/npm/v/@allpro/react-router-pause.svg?style=flat-round
[npm]: https://www.npmjs.com/package/@allpro/react-router-pause

[build-badge]: https://travis-ci.org/allpro/react-router-pause.svg?branch=master
[build]: https://travis-ci.org/allpro/react-router-pause

[coveralls-badge]: https://coveralls.io/repos/github/allpro/react-router-pause/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/allpro/react-router-pause?branch=master

[license-badge]: https://badgen.now.sh/badge/license/MIT/blue
[license]: https://github.com/allpro/form-manager/blob/master/LICENSE

[donate-badge]: https://img.shields.io/badge/Donate-PayPal-green.svg?style=flat-round
[donate]: https://paypal.me/KevinDalman
