/*=============================================
=            importing dependencies            =
=============================================*/
const _ = require('lodash')
const expressAsyncHandler = require('express-async-handler')
const { sendRes } = require('@samislam/sendres')
const PermissionDenyError = require('./utils/PermissionDenyError')
const getValue = require('./utils/getValue')

/*=====  End of importing dependencies  ======*/

const denyDefaultMsg = "You don't have the permission to perform this action"

class Permissions {
  constructor(options) {
    this.options = options
  }
  method = async (permission, options) => {
    // @param permission: boolean | function
    // @param options: object | function
    // getting the parameter values
    const permissionValue = await getValue(permission)
    const optionsValue = options
    // working with the options -----
    const chosenOptions = {}
    const defaultOptions = {
      defaultBehaviour: 'deny', // 'grant' | 'deny',
      denyMsg: denyDefaultMsg,
      denyStatusCode: 401,
    }
    _.merge(chosenOptions, defaultOptions, this.options, optionsValue)

    const denyBehaviour = () => {
      throw new PermissionDenyError(chosenOptions.denyMsg, chosenOptions.denyStatusCode)
    }
    if (permissionValue === true) return true
    else if (permissionValue === false) denyBehaviour()
    else return chosenOptions.defaultBehaviour === 'deny' ? denyBehaviour() : true
  }
}
class PermissionsMw {
  constructor(options) {
    this.options = options
  }
  method = (permission, options) =>
    expressAsyncHandler(async (req, res, next) => {
      // @param permission: boolean | function
      // @param options: obj | function
      // getting the parameter values
      const permissionValue = await getValue(permission, req)
      const optionsValue = await getValue(options, req)
      // working with the options -----
      const chosenOptions = {}
      const defaultOptions = {
        defaultBehaviour: 'deny', // 'grant' | 'deny',
        denyMsg: denyDefaultMsg,
        denyStatusCode: 401,
        handlePermissionErr: true,
      }
      _.merge(chosenOptions, defaultOptions, this.options, optionsValue)

      const denyBehaviour = () => {
        if (chosenOptions.handlePermissionErr) return sendRes(chosenOptions.denyStatusCode, res, { message: chosenOptions.denyMsg })
        else next(new PermissionDenyError(chosenOptions.denyMsg, chosenOptions.denyStatusCode))
      }
      if (permissionValue === true) next()
      else if (permissionValue === false) denyBehaviour()
      else chosenOptions.defaultBehaviour === 'deny' ? denyBehaviour() : next()
    })
}

const permissions = new Permissions().method
const permissionsMw = new PermissionsMw().method

/*----------  end of code, exporting  ----------*/
module.exports = {
  PermissionsMw,
  permissionsMw,
  Permissions,
  permissions,
}
