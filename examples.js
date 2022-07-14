/*=============================================
=            as an expressjs middleware            =
=============================================*/

permissions((req, res, next) => {
  next() // grant, call next
})
permissions(async (req, res, next) => {
  next(new AppError()) // deny, call next with error
})
permissions((req, res, next) => true) // grant, call next
permissions(async (req, res, next) => false) // deny, call next with the default error message and the default status code
permissions(() => {}, {
  defaultMsg: "You don't have the permission to access this route",
  defaultStatusCode: 401,
  non: () => {}, // deny, call next with the default error message and the default status code
})

/*=====  End of as an expressjs middleware  ======*/

/*=============================================
=            as a regular javascript function            =
=============================================*/

app.get((req, res, next) => {
  permissions(() => {})
})

/*=====  End of as a regular javascript function  ======*/
