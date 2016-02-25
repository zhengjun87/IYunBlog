var express = require('express');
var articlemodel = require('../model/db').article;
var usermodel = require('../model/db').user;
var router = express.Router();
var async = require('async');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loading');
});
router.get('/blog', function(req, res, next) {
  var page=req.query.page;
  var type=req.query.type;
  if(!page||!type){
    res.redirect('/blog?type=all&page=1');
  }
  var queryOption;
  switch(type){
    case 'all':
      queryOption={};
      break;
    case 'reprint':
      queryOption={type:'原创'};
      break;
    case 'origin':
      queryOption={type:'转载'};
      break;
  }
  async.series([
    function(callback){
      articlemodel.count(queryOption).exec(function(err,allPageNum){
        callback(null,allPageNum)
      })
    },
    function(callback){
      articlemodel.find(queryOption).sort({'created_time':-1}).skip(((page-1)*10)).limit(10).exec(function(err, articles){
        callback(null,articles)
      })
    }
  ],function(err,result){ 
    res.render('index',{
      allPageNum:result[0],
      articles:result[1],
      currentPage:page,
      type:type
    })  
  })
  
});
router.get('/addarticle',function(req, res, next) {
  if(req.session.username){
    res.render('add_article');
  }else{
    res.redirect('/blog');
  }
	
});
router.post('/addarticle', function(req, res, next) {
  console.log(req.session.username);
  usermodel.findOne({username:req.session.username}).exec(function(err,doc){
    var option={
      title:req.body.title,
      content:req.body.content,
      html:req.body.html,
      type:req.body.type,
      created_time:new Date(),
      user:doc._id
    }
    console.log(doc._id);
    articlemodel.create(option,function(err,doc){
      if(err){
        console.log(err);
        res.send({code:"01"})
      }else{
        res.send({code:"00"})
      }
    })
  })
	
});
router.get('/blog/:id',function(req,res,next){
	var articleId=req.params.id;
  async.waterfall([
    function(callback){
      articlemodel.findOne({_id:articleId}).exec(function(err,articleinfo){
        callback(null, articleinfo);
      }) 
    },
    function(age1, callback){
      usermodel.findOne({_id:age1.user}).exec(function(err,user){
        callback(null,age1,user);
      })  
    }
  ], function (err, article,user) {
      res.render('article_info',{"title":"详情","articleInfo":article,'user':user});
  });
	
})
module.exports = router;
