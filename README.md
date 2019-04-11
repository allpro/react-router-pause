# React Router Pause (Async)

[![npm package][npm-badge]][npm]
[![gzip-size][gzip-size-badge]][gzip-size]
[![install-size][install-size-badge]][install-size]
[![build][build-badge]][build]
[![coverage][coveralls-badge]][coveralls]
[![license][license-badge]][license]
[![donate][donate-badge]][donate]

---

-   NPM: `npm install @allpro/react-router-pause`
-   Yarn: `yarn add @allpro/react-router-pause`
-   CDN: Exposed global is `Pause`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/react-router-pause/umd/@allpro/react-router-pause.min.js"></script>`

---

React Router Pause (**"RRP"**) is <em>similar</em> to the React Router 
**"Prompt"** component, but with much more flexibility.

The Prompt component is synchronous. Therefore it can only use the
browser's standard `alert()` and `prompt()` messages - nothing else!
These dialogs are relatively ugly, and are inconsistent with the attractive, 
custom dialogs used in most modern apps. 
**The RRP component fixes this limitation.**

RRP can work synchronously OR asynchronously. It captures all navigation 
events and allows you to 'pause' them for as long as needed. A paused 
location route can then be 'resumed' to allow the navigation to complete.
The logic for this is handled by a callback method you set as a `use` prop.

## Sample Implementation

```javascript static
function handleNavigationAttempt( api, location, action ) {
    // Resume navigation after 10 seconds
    timeout( api.resume, 10000 )
}

return (
    <ReactRouterPause 
        when={form.isDirty()}
        use={handleNavigationAttempt}
    />
)
```

## API Reference

### ReactRouterPause Component

There are only 2 properties that can be set on the React component, 
as in the sample above.

##### when

If `when` is specified and is `false`, the component is completely disabled.

This option is identical to the `when` property on the React Router Prompt
component, eg: `<Prompt when={true} />`

##### use

The value of `use` must be a function, which will be called whenever any
router navigation event occurs.

### Use-callback API

The function set as the `use` property will receive 3 parameters when called:
- api - an object of methods to control the ReactRouterPause component
- location - a React Router location object 
- action - a React Router action name, like "push" or "pop"

The `location` and `action` are the same arguments returned to a callback 
function that is assigned like: `router.history.block( blockHandler )`

### Use( api )

```javascript static
const api = {
    isPaused - Is there currently a route location 'paused'
    resume   - action method to resume the last paused route location
    cancel   - deletes the paused location data so it can no longer be resumed

    // Include basic history methods; for manual navigation
    push     - same as router.history.push; will bypass blocking
    replace  - same as router.history.replace; will bypass blocking
}

```

**More details coming soon**


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
