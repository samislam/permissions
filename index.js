/*=============================================
=            importing dependencies            =
=============================================*/
const expressAsyncHandler = require('express-async-handler')
const _ = require('lodash')

/*=============================================
=            importing modules            =
=============================================*/
const AppError = require('../../utils/AppError')
/*=====  End of importing dependencies  ======*/

const getValue = async (parameter, ...args) => (checkTypes.isAsycOrSyncFunc(parameter) ? await parameter(...args) : parameter)

function permissionsMw(permission, options = {}) {
  return expressAsyncHandler(async (req, res, next) => {
    // @param Model: MongooseModel
    // @param bluePrint: function
    // @param options: object | function
    // getting the parameters values ---------------
    let isNextCalled = false
    const innerNext = (error) => {
      isNextCalled = true
      next(error)
    }
    const permissionValue = await getValue(permission, req, res, innerNext)
    const optionsValue = await getValue(options, req)
    // working with the options ---------------
    const chosenOptions = {}
    const defaultOptions = {
      denyMsg: "You don't have the permission to perform this action",
      denyStatusCode: 401,
      defaultBehaviour() {
        next(new AppError(chosenOptions.denyMsg, chosenOptions.denyStatusCode))
      },
    }
    _.merge(chosenOptions, defaultOptions, optionsValue)

    // working the logic ---------------
    if (isNextCalled) return
    else if (permissionValue === true) return next()
    else if (permissionValue === false) return defaultOptions.defaultBehaviour() // default to deny access
    else return await chosenOptions.defaultBehaviour() // default to user choice
  })
}

module.exports = { permissionsMw }
