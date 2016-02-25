var express = require('express');
var session = require('express-session'); 
var usermodel = require('../model/db').user;
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login',{title:'登陆'});
});
router.get('/outlogin', function(req, res, next) {
  res.redirect('/blog');
  req.session.destroy();
});
router.post('/isLogin',function(req, res, next){
  var sessUser=req.session.username;
  if(sessUser){
    res.send({username:sessUser});
  }else{
    res.send({username:null});
  }
})
router.get('/regis', function(req, res, next) {
  res.render('register',{title:'注册'});
});
router.post('/regis', function(req, res, next) {
  var user = req.body;
  usermodel.findOne({username: user.username},function(err, doc){  //count返回集合中文档的数量，和 find 一样可以接收查询条件。query 表示查询的条件
        if(doc){
          res.send({code:'02'});//用户名已存在
        }else{
           usermodel.create({
                username: user.username,
                password: user.password
            },function(err,doc){
                if(err){
                  res.send({code:'01'})//注册失败
                }else{
                  res.send({code:'00'})//注册成功
                }
            });
          }
      });
});
router.post('/login',function(req,res,next){
  var user=req.body;
  console.log(user);
  usermodel.findOne({username:user.username,password:user.password}).exec(function(err,doc){
    console.log(doc);
    if(doc){
      req.session.username=doc.username;
      res.send({code:"00"});
    }else{
      res.send({code:"01"});
    }
  })
})
module.exports = router;
