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

For more detail, see: 
**[Control React Router, Asynchronously](https://medium.com/@kevin.dalman/control-react-router-asynchronously-b5c0e88013ab)**

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


## Live Example

Try the demo at: https://allpro.github.io/react-router-pause

Play with the demo code at:
https://codesandbox.io/s/github/allpro/react-router-pause/tree/master/example

If you pull or fork the repo, you can run the demo like this:
- In the root folder, run `npm start`
- In a second terminal, in the `/example` folder, run `npm start`
- The demo will start at http://localhost:3000
- Changes to the component _or_ the demo will auto-update the browser


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


### Component Properties

The RRP component accepts 3 props:

- **`handler`** &nbsp; {function} `[null]` &nbsp; _optional_
  <br>This is called _each time_ a navigation event occurs.
  <br>If a handler is not provided, RRP is disabled.
  <br>See **[`handler` Function](#handler-function)** below.

- **`when`** &nbsp; {boolean} `[true]` &nbsp; _optional_
  <br>Set `when={false}` to temporarily disable the RRP component.
  This is an alternative to using conditional rendering.

- **`config`** &nbsp; {object} `[{}]` &nbsp; _optional_
  <br>A configuration object to change RRP logic.

  - **`config.allowBookmarks`** &nbsp; {boolean} `[true]`
    <br>Should bookmark-links for same page _always_ be allowed?
    <br>If `false`, bookmark-links are treated the same as page-links.

###### Example
```javascript
<ReactRouterPause 
    handler={ handleNavigationAttempt }
    when={ isFormDirty }
    config={{ allowBookmarks: false }}
/>
```


### `handler` Function

The function set in `props.handler` will be called **_before_** the router 
changes the location (URL).

Three arguments are passed to the `handler`:

- **`navigation`** &nbsp; {object}
  <br>An API that provides control of the navigation.
  <br>See **[`navigation` API Methods](#navigation-api-methods)**" below.
  
- **`location`** &nbsp; {object}
  <br>A React Router 
  [`location`](https://reacttraining.com/react-router/web/api/location)
  object that describes the navigation event.
  
- **`action`** &nbsp; {string}
  <br>The event-action type:
  **`PUSH`**, **`REPLACE`**, or **`POP`** 
  
  
#### `navigation` API Methods

The `navigation` API passed to the handler has these methods:

- **`navigation.isPaused()`**
  <br>Returns `true` or `false` to indicate if a 
  navigation event is currently paused.
    
- **`navigation.pausedLocation()`**
  <br>Returns the `location` object representing the paused navigation, 
  or `null` if no event is paused.
    
- **`navigation.pause()`**
  <br>Pause navigation event - equivalent to returning `null` from the handler.
  <br>**Note**: This must be called _before_ the handler returns.
    
- **`navigation.resume()`**
  <br>Triggers the 'paused' navigation event to occur.
    
- **`navigation.cancel()`** - 
  <br>Clears 'paused' navigation so it can no longer be resumed.
  <br>After cancelling, `navigation.isPaused()` will return `false`.
  <br>NOTE: It is _usually not necessary_ to call `navigation.clear()`. 
    
- **`navigation.push(`**`path, state`**`)`**
  <br>The `router.history.push()` method;
  allows redirecting a user to an alternate location.
    
- **`navigation.replace(`**`path, state`**`)`**
    <br>The `router.history.replace()` method;
    allows redirecting a user to an alternate location.


#### `handler` Function Return Values

If the handler does NOT call any navigationAPI method is before it returns,
then it must return one of these responses:

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
- search ("?key=value&otherValues")
- state ("value" or { foo: 'bar' })

The location 'hash' (bookmark) it ignored by default.
<br>See `config.allowBookmarks` in the 
**[Component Properties](#component-properties)** section.


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

In this example, the navigation API object is assigned to a property
so it is accessible to every method in the class.

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
