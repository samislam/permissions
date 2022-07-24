class PermissionDenyError extends Error {
  constructor(message, statusCode) {
    super(message)

    this.statusCode = statusCode
    this.name = 'permissionDenyError'

    Error.captureStackTrace(this, this.constructor)
  }
}

/*----------  end of code, exporting  ----------*/

module.exports = PermissionDenyError
