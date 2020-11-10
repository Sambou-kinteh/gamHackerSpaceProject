var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //once the user end point is hit, redirect to register page unless logged in
  res.redirect('/userLogin');
});

router.get('/departments', (req, res) => {
  res.render('departments', {title: 'Welcome User'});
});


module.exports = router;
