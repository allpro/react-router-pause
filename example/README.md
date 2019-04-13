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
router navigation events triggered by the user actions.
For example, if a user clicks a link while in the middle of a process,
and they will _lose data_ if navigation continues.

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
is synchronous by default, so can display ONLY very basic `prompt()` messages. 
The same applies when using 
[router.history.block](https://github.com/ReactTraining/history#blocking-transitions).

Browser `prompt()` dialogs are relatively **ugly** and cannot be customized.
They are inconsistent with the attractive dialogs most modern apps use. 
**The motivation for RRP was it overcome this limitation.**

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
    -   Unpkg: `<script src="https://unpkg.com/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js"></script>`


## Usage

RRP is a React component, but does NOT render any output.
RRP also does NOT display any prompts itself.
It only provides a way for your code to hook into, and control the router.

The RRP component accepts only two props (`when` is optional):

```javascript
<ReactRouterPause 
    use={handleNavigationAttempt}
    when={isFormDirty}
/>
```

A handler function could looks something like this: 

```javascript
function handleNavigationAttempt( navigation, location, action ) {
	// Call an async function that returns a promise; wait for it to resolve...
	preloadNextPage( location )
	    .then( navigation.resume ) // CONTINUE with navigation event
	    .catch(error => {
	    	navigation.cancel()    // CLEAR the navigation data (optional)
	    	displayErrorMessage(error)
	    })

	return null // Returning null means PAUSE navigation
}
````

### Properties

The RRP component accepts two props:

- #### `use` `{function}` `[null]` _`required`_

  Called each time a router navigation event occurs.
  See 'Event Handler' details below.

- #### `when` `{boolean}` `[true]` _`optional`_

  Set `when={false}` to disable the RRP component.
  This is an alternative to using conditional rendering.
  <br>_(Works same as Prompt component `when` prop.)_


### Event Handler

The function set in the `use` prop _handles_ navigation events.
It is called _each time_ the router is about to change the location (URL).
Three arguments are passed when the handler is called:

- #### `navigation` `{object}`

  The methods in this object provide control of the RRP component.
  See 'RRP Object/Methods' below for details.
  
- #### `location` `{object}`

  A React Router 
  [`location`](https://reacttraining.com/react-router/web/api/location)
  object describing the navigation triggered by the user.
  
- #### `action` `{string}`

  The action that triggered the navigation. 
  <br>One of `PUSH`, `REPLACE`, or `POP` 
  
  
#### `navigation` Object/Methods

The `navigation` object passed to the handler function provides 5 methods:

- **navigation.isPaused()** - Returns `true` or `false` to indicate if any navigation
     event is currently paused.
- **navigation.resume()** - Triggers the 'paused' navigation event to run
- **navigation.cancel()** - Clears 'paused' navigation so can no longer be resumed.
- **navigation.push(** path, state **)** - The `router.history.push()` method,
    in case you wish to redirect a user to an alternate location
- **navigation.replace(** path, state **)** - The `router.history.replace()` method,
    in case you wish to redirect a user to an alternate location

**NOTE: It is not _necessary_ to call `navigation.clear()`.** 
<br>Each new navigation event will _replace_ the previous one. 
This means `navigation.resume()` can only trigger the **_last location_** 
clicked by the user. 
However, calling `navigation.cancel()` does make `navigation.isPaused()` more useful.

#### Handler Return Values

When called, the handler must return one of 5 values, (synchronously), 
back to the RRP component. These are:

- **`true`** or **`undefined`** - Allow navigation to continue.
- **`false`** - Cancel the navigation event, permanently.
- **`null`** - Pause navigation so can _optionally_ be resumed later.
- **`Promise`** - Pause until promise is settled; 
    resume if promise _resolves_ **and** response !== false; cancel otherwise.

This example pauses navigation, then resumes after 10 seconds.

```javascript
function handleNavigationAttempt( navigation, location, action ) {
	setTimeout( navigation.resume, 10000 ) // RESUME after 10 seconds
	return null // null means PAUSE navigation
}
````

This example returns a promise. Navigation is paused while validating
data asynchronously. If the promise **resolves**,
navigation will resume automatically unless `false` is returned.
If the promise is **rejected**, navigation is cancelled.

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

The location comparison includes all parts of the location, including any 
'state' passed, so it will _not_ block things like bookmarks (hash) links.


## Implementation

A common use is to confirm that a user wishes to 'abort' a process, such as 
filling out a form. RRP allows a custom dialog (asynchronous) to be used.
 
**Below are 2 example implementations using a 'confirmation dialog'.**
The dialog is not important - it's just a _sample_ of how RRP can be used.

### Functional Component Example

This example keeps all code _inside_ the handler function,
where it has access to the `navigation` methods. 
The [`setState` hook](https://reactjs.org/docs/hooks-state.html) 
is used to show and pass handlers to a confirmation dialog, (asynchronously).

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
                 use={handleNavigationAttempt}
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

Here the navigation object is assigned as a class property so it is accessible 
to all other methods of the class.
An alternative would be to _pass_ the navigation object to subroutines.

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
        // NOTE: It's not necessary to 'cancel' paused navigation
        // Deletes the cached navigation data so can no longer be resumed
        this.navigation.cancel()
        this.closeDialog()
    }
    
    handleLeave() {
        // Navigate to whatever destination the user clicked
        this.navigation.resume()
        this.closeDialog()
   }
    
    handleShowHelp() {
        // NOTE: It's not necessary to 'cancel' paused navigation
        this.navigation.push('/form-help')
        this.closeDialog()
    }

    render() {
        return (
            <Fragment>
                <ReactRouterPause 
                    use={this.handleNavigationAttempt}
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

If you pull the repo, you can run the demo with `npm start`.

Or on CodeSandbox at:
https://codesandbox.io/s/github/allpro/react-router-pause/tree/master/demo/src


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

This project is licensed under the MIT License - see the 
[LICENSE.md](https://github.com/allpro/react-router-pause/blob/master/LICENSE)
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
