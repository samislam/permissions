/*=============================================
=            importing dependencies            =
=============================================*/
const express = require('express')
const log = require('@samislam/log')
const { sendRes, sendResMw } = require('@samislam/sendres')
const { permissionsMw, permissions, Permissions, PermissionsMw } = require('../src/')
const data = require('./data')
const expressAsyncHandler = require('express-async-handler')
/*=====  End of importing dependencies  ======*/

const customPermissions = new Permissions({
  denyStatusCode: 244,
}).method
const customPermissionsMw = new PermissionsMw({
  denyMsg: 'lolo',
}).method

const app = express()
app.use(express.json())
const router = express.Router()
app.use('/api/users', router)

router
  .route('/')
  .get(
    customPermissionsMw(async (req) => {}, { defaultBehaviour: 'deny', denyStatusCode: 230 }),
    sendResMw(200, { $$data: data })
  )
  .post(
    expressAsyncHandler(async (req, res, next) => {
      const x = await customPermissions(() => {}, { defaultBehaviour: 'deny' })
      log.w(x)
      sendRes(200, res, { message: 'the resource has been created 👍' })
    })
  )

router.route('/:id').patch().delete()

app.use((err, req, res, next) => {
  console.log('error caught ')
  if (err.name === 'permissionDenyError') {
    sendRes(err.statusCode, res, { message: err.message })
  }
})

console.clear()
app.listen(9778, () => log.info(log.label, 'test running on port 9778'))
