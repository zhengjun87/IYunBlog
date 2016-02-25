var express = require('express');
var articlemodel = require('../model/db').article;
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login',{title:'登陆'});
});

module.exports = router;
