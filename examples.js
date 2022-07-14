const { permissions, permissionsMw } = require('.')

/*=============================================
=            as an expressjs middleware            =
=============================================*/

permissionsMw(undefined)
permissionsMw(true)
permissionsMw(false)
permissionsMw((req) => {})
permissionsMw(async (req) => {})
permissionsMw(async (req) => {}, { options })
permissionsMw(
  async (req) => {},
  (req) => ({ options })
)

/*=====  End of as an expressjs middleware  ======*/

/*=============================================
=            as a regular javascript function            =
=============================================*/
permissions(undefined)
permissions(true)
permissions(false)
permissions(() => {})
permissions(async () => {})
permissions(async () => {}, { options })
permissions(
  async () => {},
  () => ({ options })
)

/*=====  End of as a regular javascript function  ======*/
