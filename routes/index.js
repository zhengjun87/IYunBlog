var express = require('express');
var request = require('request');
var articlemodel = require('../model/db').article;
var usermodel = require('../model/db').user;
var router = express.Router();
var async = require('async');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loading');
});
router.get('/blog',function(req,res,next){
  if(!req.query.page||!req.query.type){
    return res.redirect('/blog?type=all&page=1');
  }
  res.render('index',{
    title:'艾云博客-首页'
  });
})
router.get('/blogList', function(req, res, next) {
  var page=req.query.page;
  var type=req.query.type;
  if(!page||!type){
    return res.redirect('/blog?type=all&page=1');
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
    res.send({
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
    res.redirect('/user/login');
  }
	
});
router.post('/addarticle', function(req, res, next) {
  usermodel.findOne({username:req.session.username}).exec(function(err,doc){
    var option={
      title:req.body.title,
      content:req.body.content,
      html:req.body.html,
      type:req.body.type,
      created_time:new Date(),
      user:doc._id,
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

router.post('/blog/comment',function(req,res,next){
  var option={
    articleId:req.query.id,
    username:req.session.username,
    content:req.body.content,
    created_time:new Date()
  }
  console.log(option);
  async.waterfall([
    function(callback){
      usermodel.findOne({username:option.username}).exec(function(err,user){
        console.log(user);
        callback(null,user);
      })
    },
    function(user,callback){
      articlemodel.findOne({_id:option.articleId}).exec(function(err,article){
        callback(null,user,article);
      })
    },
    function(user,article,callback){
      console.log(user);
      article.comment.push({
        user:user._id,
        content:option.content,
        created_time:new Date()
      })
      article.save(function(err) {
        callback(err,user,article);
      })
    }
  ],function(err,result){
    if(!err){
      console.log(err);
      res.send({code:'00'});
    }else{
      res.send({code:'01'});
    }
  })
  
})

router.get('/blogInfo',function(req,res,next){
  res.render('article_info',{"title":"详情"});
})
router.get('/blogData',function(req,res,next){
  var articleId=req.query.id;
  articlemodel.findOne({_id:articleId}).populate('user').populate('comment.user').exec(function(err,articleinfo){
    res.send({"articleInfo":articleinfo});
  })
})
//获取京东服务器时间
router.get('/getJdTime', function(req, res, next) {
  var month = {
    'Aug': 8,
    'Sep': 9,
    'Oct': 10
  }
  request('https://in.m.jd.com/help/app/private_policy.html', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = response.headers.date;
      var serverTime = result;
      var timeArr = serverTime.split(',')[1].split(' ');
      //console.log(result.toLocaleString());
      //var serverNum = new Date(Number(timeArr[3]), Number(month[timeArr[2]])-1, Number(timeArr[1]), Number(timeArr[4].split(':')[0])+8, Number(timeArr[4].split(':')[1]), Number(timeArr[4].split(':')[2])).toLocaleString();
      //console.log(new Date().getTime());
      res.send({
        time: serverTime
      });
    }
  })
});
router.get('/getTbTime', function(req, res, next) {
  request('http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp&clk1=70a27c60d5e00928da8e28dd80bcfb94&upsid=70a27c60d5e00928da8e28dd80bcfb94', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(response.body).data.t;
      res.send({
        time: result
      });
    }
  })
});
router.get('/getSnTime', function(req, res, next) {
  request('http://quan.suning.com/getSysTime.do', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(response.body);
      res.send({
        time: result
      });
    }
  })
});
module.exports = router;