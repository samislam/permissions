/*=============================================
=            importing dependencies            =
=============================================*/
const { sendrRes, sendRes } = require('@samislam/sendres')

/*=====  End of importing dependencies  ======*/

function sendErr(res, statusCode, message) {
  sendRes(statusCode, res, { message })
}

/*----------  end of code, exporting  ----------*/
module.exports = sendErr
