var express = require('express');
var articlemodel = require('../model/db').article;
var usermodel = require('../model/db').user;
var router = express.Router();
var async = require('async');


/* GET home page. */
router.get('/article', function(req, res, next) {
  articlemodel.find({}).populate('user').exec(function(err,articles){
    if(!err){
      res.render('admin/article',{
        articles:articles
      })
    }
  })
});
router.post('/rmArticle', function(req, res, next) {
  var articleId=req.body.id;
  console.log(articleId);
  articlemodel.remove({_id:articleId}).exec(function(err,articles){
    if(!err){
      res.send({code:'00'});
    }
  })
});

module.exports = router;
