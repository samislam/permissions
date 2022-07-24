**permissions** is a small and simple Nodejs and Express utility for controlling user actions permissions based on a predefined set of rules.

# Examples:

**Example #1:**

You can use it as an Express middleware:

```js
app.get(
  '/users/:id',
  permissionsMw((req) => req.params.id === req.$loggedInUser.id, { denyMsg: 'You can only read your own data' }),
  (req, res, next) => {
    // ... rest of the code
  }
)
```

**Example #2:**

or you can use it as a regular JavaScript function

```js
app.get('/users/:id', async (req, res, next) => {
  await permissions(() => req.params.id === req.$loggedInUser.id, { denyMsg: 'You can only read your own data' })
})
```

# API:

The API is pretty simple and straightforward.

# `permissionsMw(permission: boolean | function, options: object | function)`: Express middleware

<ins>parameters:</ins>

- **permission**: _boolean_ or _function_.
  - If **true** was provided, it indicates grant permission, which calls `next()`.
  - If **false** was provided, it indicates permission denied , which marks the operation as _access denied_.
  - If **undefined** or nothing was provided, the `defaultBehaviour` option determines what, (_which is by default to deny access_).
  - If a function was provided, it will be called with the `req` object as the first argument. Your function can return **true**, **false** or **undefined**, and the same behavior happens.
- **options**: _object | function_, options to configure how `permissionsMw()` works.
  - **denyMsg**: _any_, the message to include in the error in case the _access denied_ happen, (default: '**_You don't have the permission to perform this action_**').
  - **denyStatusCode**: _number_, the status code to include in the error in case the _access denied_ happen, (default **401**).
  - **handlePermissionErr**: _boolean_, by default, if _access denied_ happen, permissionsMw sends the response to the client with a meaningful error, in case you wanted to handle that error yourself, change this option to **false**, and it will call `next()` with the error (default **true**).
  - **defaultBehaviour**: _'deny' | 'access'_, default behavior if not **true** or **false** were the resolved value of the `permission` argument (ex, `permissionsMw(undefined)`) (default **'_deny_'**).

# `permissions(permission: boolean | function, options: object)`: Promise

<ins>parameters:</ins>

- **permission**: _boolean_ or _function_.
  - If **true** was provided, it indicates grant permission, which calls `next()`.
  - If **false** was provided, it indicates permission denied , which marks the operation as _access denied_.
  - If **undefined** or nothing was provided, the `defaultBehaviour` option determines what, (_which is by default to deny access_).
  - If a function was provided, it will be called with the `req` object as the first argument. Your function can return **true**, **false** or **undefined**, and the same behavior happens.
- **options**: _object_, options to configure how `permissionsMw()` works.
  - **denyMsg**: _any_, the message to include in the error in case the _access denied_ happen, (default: '**_You don't have the permission to perform this action_**').
  - **denyStatusCode**: _number_, the status code to include in the error in case the _access denied_ happen, (default **401**).
  - **defaultBehaviour**: _'deny' | 'access'_, default behavior if not **true** or **false** were the resolved value of the `permission` argument (ex, `permissionsMw(undefined)`) (default **'_deny_'**).

# `PermissionsMw` and `Permissions` classes

These are the constructor classes for permissions() and permissionsMw() methods, you can use these classes to generate a set of methods with pre-defined options, and the best way to describe this process is by showing you an example:

```js
const expressAsyncHandler = require('express-async-handler')
const { Permissions, PermissionsMw } = require('permissions')

const customPermissions = new Permissions({
  notFoundMsg: 'Ľutujeme, ale požadovaný záznam sa nenašiel!',
}).method
const customPermissionsMw = new PermissionsMw({
  notFoundMsg: 'Entschuldigung, aber der angeforderte Datensatz wurde nicht gefunden!',
}).method

app.get('/users', customPermissionsMw(false))
app.patch(
  '/users',
  expressAsyncHandler(async (req, res, next) => {
    await customPermissions(false)
  })
)
```

- All the constructors accept only one argument as an _object_, the **options** parameter.
- You can find the available options for each class in the API section above.

# Error handling:

The only error that permissions trigger is the **_permissionsDenyError_**, this error includes the following properties:

- `name`: '**_permissionsDenyError_**',
- `statusCode`: the status code chosen when the _deny access_ thing happen, (default **401**)
- `message`: (default: _"**You don't have the permission to perform this action**"_)
- `stack`: the error call stack.

To handle the error when it gets thrown, you can wrap the permissions calls with something like try/catch blocks, or use [await-to](https://www.npmjs.com/package/await-to-js), or you may do other logic, However you're must likely not going to handle the error through these ways, most likely you'll be having an express Middleware wrapper such as [express-async-handler](https://www.npmjs.com/package/express-async-handler) which calls `next()` in case any error was thrown in the code it wraps, ex:

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

To handle the error which gets called by next, you should have an [express error handling middleware](https://expressjs.com/en/guide/error-handling.html) which handles that, ex:

```js
app.get(
  '/users/:id',
  permissionsMw((req) => false)
)

app.use((err, req, res, next) => {
  if (err.name === 'permissionsDenyError') {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    })
  }
})
```

# FAQ:

**Q**: Can I make the access deny message an object or an array instead of a string?

- Yes you can, if you still need more flexibility, check out the _handlePermissionErr_ option.
