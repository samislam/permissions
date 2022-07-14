**permissions** is a small and simple Nodejs and ExpressJs utility for controlling user actions permissions based on a predefined set of rules.

# Examples:

You can use it as an ExpressJs Middleware:

```js
app.get(
  '/users/:id',
  permissionsMw((req) => req.params.id === req.$loggedInUser.id, { denyMsg: 'You can only read your own data' }),
  (req, res, next) => {
    // ... rest of the code
  }
)
```

or you can use it as a regular JavaScript function

```js
app.get('/users/:id', async (req, res, next) => {
  await permissions(() => req.params.id === req.$loggedInUser.id, { denyMsg: 'You can only read your own data' })
})
```

# API:

The API is pretty simple and strightforward.

# `permissionsMw(permission: boolean | function, options: object | function) : Express middleware`

- `permission`: _boolean_ or _function_.
  - If **true** was provided, it indicates grant permission, which calls `next()`.
  - If **false** was provided, it indicates permission denied , which responds with a _401 Unauthorized_ error by default.
  - If **undefined** or nothing was provided, the `defaultBehaviour` will run, (_which is by default to deny access_).
  - If a function was provided, it will be called with the `req` object as the first argument. Your function can return **true**, **false** or **undefined**, and the same behaviour happens.
- `options`: _object_ or _function_.
  - `defaultBehaviour`: _deny | access_, default behaviour if not **true** or **false** were given (ex, `permissionsMw(undefined)`) (default **'deny'**).
  - `denyMsg`: _any_, the message to include in the error in case the _access denied_ happen, (default: _"You don't have the permission to perform this action"_).
  - `denyStatusCode`: _number_, the status code to include in the error in case the _access denied_ happen, (default **401**).
  - `handleError`: _boolean_, by default, if _access denied_ happen, permissionsMw sends the response to the client with an error, in case you wanted to handle that error yourself, change this to false, and it will call `next()` with the error (default **true**).

# `permissions(permission: boolean | function, options: object | function) : Promise`

- `permission`: _boolean_ or _function_.
  - If **true** was provided, it indicates grant permission, which returns **true**.
  - If **false** was provided, it indicates permission denied , which throws an error with a _401 Unauthorized_ error by default.
  - If **undefined** or nothing was provided, the `defaultBehaviour` will run, (_which is by default to deny access_).
  - If a function was provided, your function can return **true**, **false** or **undefined**, and the same behaviour happens, your function will not be called with any arguments.
- `options`: _object_ or _function_.
  - `defaultBehaviour`: _deny | access_, default behaviour if not **true** or **false** were given (ex, `permissions(undefined)`) (default **'deny'**).
  - `denyMsg`: _any_, the message to include in the error in case the _access denied_ happen, (default: _"You don't have the permission to perform this action"_).
  - `denyStatusCode`: _number_, the status code to include in the error in case the _access denied_ happen, (default **401**).

# `globalOptions`

This export is to configure how the **permissions** package works **globally**.

> **Tip:** 💡
> If you're looking to change the access denied message or status code, you might want to consider changing it locally per function call, instead of changing it through this object, this export is only for **global** configurations which can effect how all of your app behaves.

- `defaultBehaviour`: 'deny', # enums: 'grant' | 'deny'
- `denyMsg`: "You don't have the permission to perform this action",
- `denyStatusCode`: 401,
- `handleError`: true,

# Error handling:

- permissionsMw:
  - Throws an error.
  - calls `next()` with an error.
- permissions:
  - Throws an error.

The only error is the "_*permissions_deny_error*_", this error includes the following properties:

- `name`: "permissions_deny_error",
- `statusCode`: the status code chosen when the _deny access_ thing happen, (default: 401)
- `message`: the message chosen when the _deny access_ thing happen, (default: _"You don't have the permission to perform this action"_)
- `stack`: the error call stack

to handle the error when it gets thrown:

```js
app.get('/users/:id', async (req, res, next) => {
  try {
    await permissions(() => {
      /* some code */
      if (true) return false
    })
    // the rest of your code
  } catch (error) {
    res.status(error.statusCode).json({
      status: 'fail',
      message: error.message,
    })
  }
})
```

But you're must likely not going to handle the error through this way, you're must likey going to have some express Middleware such as [express-async-handler](https://www.npmjs.com/package/express-async-handler) which calls `next()` in case any error was thrown in the code it wraps, ex:

```js
app.get(
  expressAsyncHandler(async (req, res, next) => {
    await permissions(() => {
      /* some code */
      if (true) return false
    })
    // the rest of your code
  })
)
```

To handle the error which gets called by next, it's well known, you should have an [express error handling middleware](https://expressjs.com/en/guide/error-handling.html) which handles that, ex:

```js
app.get(
  '/users/:id',
  permissionsMw((req) => false)
)

app.use((err, req, res, next) => {
  if (err.name === 'permissions_deny_error') {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    })
  }
})
```

# FAQ:

**Q**: Can I provide an Async function to `permissions()` or `permissionsMw()`?

- Yes you can.

**Q**: Can I make the access deny message an object or an array instead of a string?

- Yes you can.
