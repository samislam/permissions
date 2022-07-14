/*=============================================
=            importing dependencies            =
=============================================*/
const express = require('express')
const log = require('@samislam/log')
const { sendRes, sendResMw } = require('@samislam/sendres')
const { permissionsMw, globalOptions, permissions } = require('../index')
const data = require('./data')
const expressAsyncHandler = require('express-async-handler')
/*=====  End of importing dependencies  ======*/

globalOptions.denyMsg = 'Sie sind nicht berechtigt, diese Aktion auszuführen'
globalOptions.denyStatusCode = 403
globalOptions.handleError = false

const app = express()

app.use(express.json())

app
  .route('/users')
  .get(
    permissionsMw(
      async (req) => {
        console.log(req.body)
        return true
      },
      { defaultBehaviour: 'deny' }
    ),
    sendResMw(200, { $$data: data })
  )
  .post(
    expressAsyncHandler(async (req, res, next) => {
      const x = await permissions(() => {}, { defaultBehaviour: 'grant' })
      log.w(x)
      sendRes(200, res, { message: 'the resource has been created 👍' })
    })
  )
  .patch()
  .delete()

app.use((err, req, res, next) => {
  if (err.name === 'permissions_deny_error') {
    sendRes(err.statusCode, res, { message: err.message })
  }
})

app.listen(9778, () => log.info(log.label, 'test running on port 9778'))
