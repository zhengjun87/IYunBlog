var express = require('express')
var articlemodel = require('../model/db').article
var usermodel = require('../model/db').user
var router = express.Router()
var async = require('async')

router.get('/', function(req, res, next) {
  var page = req.query.page
  var queryOption = {}
  async.series(
    [
      function(callback) {
        articlemodel.count(queryOption).exec(function(err, allPageNum) {
          callback(null, allPageNum)
        })
      },
      function(callback) {
        articlemodel
          .find(queryOption)
          .sort({ created_time: -1 })
          .skip((page - 1) * 10)
          .limit(10)
          .exec(function(err, articles) {
            callback(null, articles)
          })
      }
    ],
    function(err, result) {
      res.render('mobile/index', {
        allPageNum: result[0],
        articles: result[1],
        currentPage: page
      })
    }
  )
})
router.get('/article_info', function(req, res, next) {
  res.render('mobile/article_info')
})
router.get('/login', function(req, res, next) {
  res.render('mobile/login')
})
router.post('/login', function(req, res, next) {
  var user = req.body
  console.log(user)
  usermodel
    .findOne({ username: user.username, password: user.password })
    .exec(function(err, doc) {
      console.log(doc)
      if (doc) {
        req.session.username = doc.username
        res.send({ code: '00' })
      } else {
        res.send({ code: '01' })
      }
    })
})
router.get('/register', function(req, res, next) {
  res.render('mobile/register')
})
router.post('/regis', function(req, res, next) {
  var user = req.body
  usermodel.findOne({ username: user.username }, function(err, doc) {
    //count返回集合中文档的数量，和 find 一样可以接收查询条件。query 表示查询的条件
    if (doc) {
      res.send({ code: '02' }) //用户名已存在
    } else {
      usermodel.create(
        {
          username: user.username,
          password: user.password
        },
        function(err, doc) {
          if (err) {
            res.send({ code: '01' }) //注册失败
          } else {
            res.send({ code: '00' }) //注册成功
          }
        }
      )
    }
  })
})
router.get('/blog/:id', function(req, res, next) {
  var articleId = req.params.id
  articlemodel
    .findOne({ _id: articleId })
    .populate('user')
    .populate('comment.user')
    .exec(function(err, articleinfo) {
      res.render('mobile/article_info', {
        title: '详情',
        articleInfo: articleinfo
      })
    })
})

module.exports = router
