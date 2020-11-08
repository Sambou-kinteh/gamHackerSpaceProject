var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //once the user end point is hit, redirect to register page unless logged in
  res.redirect('/userLogin');
});




module.exports = router;
