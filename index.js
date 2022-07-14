/*=============================================
=            importing dependencies            =
=============================================*/
const _ = require('lodash')
const checkTypes = require('@samislam/checktypes')
const expressAsyncHandler = require('express-async-handler')
const sendErr = require('./utils/sendErr')
const AppError = require('./utils/AppError')

/*=====  End of importing dependencies  ======*/

const getValue = async (parameter, ...args) => (checkTypes.isAsycOrSyncFunc(parameter) ? await parameter(...args) : parameter)

const globalOptions = {
  defaultBehaviour: 'deny', // 'grant' | 'deny'
  denyMsg: "You don't have the permission to perform this action",
  denyStatusCode: 401,
  handleError: true,
}

function permissionsMw(permission, options) {
  return expressAsyncHandler(async (req, res, next) => {
    // @param permission: boolean | function
    // @param options: obj | function
    // getting the parameter values
    const permissionValue = await getValue(permission, req)
    const optionsValue = await getValue(options, req)
    // working with the options -----
    const chosenOptions = {}
    const defaultOptions = {
      defaultBehaviour: globalOptions.defaultBehaviour,
      denyMsg: globalOptions.denyMsg,
      denyStatusCode: globalOptions.denyStatusCode,
      handleError: globalOptions.handleError,
    }
    _.merge(chosenOptions, defaultOptions, optionsValue)

    const denyBehaviour = () => {
      if (chosenOptions.handleError) return sendErr(res, chosenOptions.denyStatusCode, chosenOptions.denyMsg)
      else next(new AppError(chosenOptions.denyMsg, chosenOptions.denyStatusCode, 'permissions_deny_error'))
    }
    if (permissionValue === true) next()
    else if (permissionValue === false) denyBehaviour()
    else chosenOptions.defaultBehaviour === 'deny' ? denyBehaviour() : next()
  })
}

async function permissions(permission, options) {
  // @param permission: boolean | function
  // @param options: object | function
  // getting the parameter values
  const permissionValue = await getValue(permission)
  const optionsValue = await getValue(options)
  // working with the options -----
  const chosenOptions = {}
  const defaultOptions = {
    defaultBehaviour: globalOptions.defaultBehaviour,
    denyMsg: globalOptions.denyMsg,
    denyStatusCode: globalOptions.denyStatusCode,
  }
  _.merge(chosenOptions, defaultOptions, optionsValue)

  const denyBehaviour = () => {
    throw new AppError(chosenOptions.denyMsg, chosenOptions.denyStatusCode, 'permissions_deny_error')
  }
  if (permissionValue === true) return true
  else if (permissionValue === false) denyBehaviour()
  else return chosenOptions.defaultBehaviour === 'deny' ? denyBehaviour() : true
}

/*----------  end of code, exporting  ----------*/
module.exports = {
  globalOptions,
  permissionsMw,
  permissions,
}
