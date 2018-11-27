var express = require('express')
var request = require('request')
var articlemodel = require('../model/db').article
var usermodel = require('../model/db').user
var router = express.Router()
var async = require('async')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loading', {
    title: '艾云博客-欢迎页'
  })
})
router.get('/blog', function(req, res, next) {
  if (!req.query.page || !req.query.type) {
    return res.redirect('/blog?type=all&page=1')
  }
  res.render('index', {
    title: '艾云博客-首页'
  })
})
router.get('/blogList', function(req, res, next) {
  var page = req.query.page
  var type = req.query.type
  var pageSize = parseInt(req.query.pageSize) || 10
  if (!page || !type) {
    return res.redirect('/blog?type=all&page=1')
  }
  var queryOption
  switch (type) {
    case 'all':
      queryOption = {}
      break
    case 'reprint':
      queryOption = { type: '原创' }
      break
    case 'origin':
      queryOption = { type: '转载' }
      break
  }
  async.series(
    [
      function(callback) {
        articlemodel.count(queryOption).exec(function(err, allPageNum) {
          callback(null, allPageNum)
        })
      },
      function(callback) {
        articlemodel
          .find(queryOption, { content: 0, html: 0 })
          .sort({ created_time: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .populate('user', { username: 1, _id: 0 })
          .exec(function(err, articles) {
            callback(null, articles)
          })
      }
    ],
    function(err, result) {
      var pageCountNum = 0
      if (result[0] % pageSize === 0) {
        pageCountNum = result[0] / pageSize
      } else {
        pageCountNum = parseInt(result[0] / pageSize) + 1
      }
      res.send({
        allPageNum: result[0],
        articles: result[1],
        pageCount: pageCountNum,
        currentPage: page,
        type: type
      })
    }
  )
})
router.get('/addarticle', function(req, res, next) {
  if (req.session.username) {
    res.render('add_article', {
      title: '艾云博客-发表'
    })
  } else {
    res.redirect('/user/login')
  }
})
router.post('/addarticle', function(req, res, next) {
  usermodel
    .findOne({ username: req.session.username })
    .exec(function(err, doc) {
      var option = {
        title: req.body.title,
        content: req.body.content,
        html: req.body.html,
        type: req.body.type,
        created_time: new Date(),
        user: doc._id
      }
      console.log(doc._id)
      articlemodel.create(option, function(err, doc) {
        if (err) {
          console.log(err)
          res.send({ code: '01' })
        } else {
          res.send({ code: '00' })
        }
      })
    })
})

router.post('/blog/comment', function(req, res, next) {
  console.log(req.session)
  if (!req.session.username) {
    res.send({ code: '03', msg: '未登录' })
    return
  }
  var option = {
    articleId: req.query.id,
    username: req.session.username,
    content: req.body.content,
    created_time: new Date()
  }
  async.waterfall(
    [
      function(callback) {
        usermodel
          .findOne({ username: option.username })
          .exec(function(err, user) {
            callback(null, user)
          })
      },
      function(user, callback) {
        articlemodel
          .findOne({ _id: option.articleId })
          .exec(function(err, article) {
            callback(null, user, article)
          })
      },
      function(user, article, callback) {
        console.log(user)
        article.comment.push({
          user: user._id,
          content: option.content,
          created_time: new Date()
        })
        article.save(function(err) {
          callback(err, user, article)
        })
      }
    ],
    function(err, result) {
      if (!err) {
        console.log(err)
        res.send({ code: '00', msg: '发表成功' })
      } else {
        res.send({ code: '01', msg: '位置错误' })
      }
    }
  )
})

router.get('/blogInfo', function(req, res, next) {
  res.render('article_info', { title: '详情' })
})
router.get('/blogData', function(req, res, next) {
  var articleId = req.query.id
  articlemodel
    .findOne({ _id: articleId })
    .populate('user', { username: 1, _id: 0 })
    .populate('comment.user', { username: 1, _id: 0 })
    .exec(function(err, articleinfo) {
      res.send({ articleInfo: articleinfo })
    })
})
//获取京东服务器时间
router.get('/getJdTime', function(req, res, next) {
  var month = {
    Aug: 8,
    Sep: 9,
    Oct: 10
  }
  request('https://in.m.jd.com/help/app/private_policy.html', function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      var result = response.headers.date
      var serverTime = result
      var timeArr = serverTime.split(',')[1].split(' ')
      //console.log(result.toLocaleString());
      //var serverNum = new Date(Number(timeArr[3]), Number(month[timeArr[2]])-1, Number(timeArr[1]), Number(timeArr[4].split(':')[0])+8, Number(timeArr[4].split(':')[1]), Number(timeArr[4].split(':')[2])).toLocaleString();
      //console.log(new Date().getTime());
      res.send({
        time: serverTime
      })
    }
  })
})
router.get('/getTbTime', function(req, res, next) {
  request(
    'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp&clk1=70a27c60d5e00928da8e28dd80bcfb94&upsid=70a27c60d5e00928da8e28dd80bcfb94',
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(response.body).data.t
        res.send({
          time: result
        })
      }
    }
  )
})
router.get('/getSnTime', function(req, res, next) {
  request('http://quan.suning.com/getSysTime.do', function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(response.body)
      res.send({
        time: result
      })
    }
  })
})
router.get('/getQqTime', function(req, res, next) {
  request('http://cgi.im.qq.com/cgi-bin/cgi_svrtime', function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      var result = response.body.replace('\n', '')
      res.send({
        time: result
      })
    }
  })
})
router.get('/getGrowthList', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  console.log(req.query)
  var _req = req.query
  request(
    {
      url:
        'https://testm-yqzb.xuehedata.com/activity/groupPointlist.htm?type=' +
        _req.type +
        '&userId=' +
        _req.userId,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application'
      }
      //body: JSON.stringify(reqBody)
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = response.body
        res.send(_req.jsonpCallback + '(' + result + ')')
      }
    }
  )
})

/**
 * 上下班公交查询
 */
router.get('/bus850-up', function(req, res, next) {
  const request = require('request')
  let firstArriveTime = 0
  let secondArriveTime = 0
  let beforeStationTime = []
  let sid = ''
  let startNum = 11
  let resResult = ''
  main()

  async function main() {
    await getSid().then(res => {
      res = JSON.parse(res)
      sid = res.sid
      console.log('sid为' + sid)
    })
    await getStationInfo(startNum).then(res => {
      res = JSON.parse(res)
      firstArriveTime = JSON.parse(res[0].time)
    })
    let isBreak = false
    for (let i = startNum - 1; i >= 1; i--) {
      if (isBreak) break
      await getStationInfo(i).then(res => {
        res = JSON.parse(res)
        let temp = parseInt(res[0].time)
        console.log(temp)
        if (beforeStationTime.length === 0) return beforeStationTime.push(temp)
        if (temp < beforeStationTime[beforeStationTime.length - 1]) {
          beforeStationTime.push(temp)
        } else {
          secondArriveTime = temp
          isBreak = true
        }
      })
    }
    let beforeSum = 0
    beforeStationTime.forEach(item => {
      beforeSum += item
    })
    let firstDesc = firstArriveTime === 99999 ? '等待发车' : `${(firstArriveTime/60).toFixed(1)}分钟到`
    let secondDesc = secondArriveTime === 99999 || firstArriveTime === 99999 ? '等待发车' : ((firstArriveTime+secondArriveTime)/60).toFixed(1) + '分钟到达'
    resResult = `第一班车：${firstDesc}，第二班车：${secondDesc}`
    res.render('bus/bus850', { title: '上班', contnet: resResult })
  }
  function getSid() {
    let options = {
      url: 'https://shanghaicity.openservice.kankanews.com/public/bus/get',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 wxwork/2.2.0 MicroMessenger/4.5.255',
        method: 'GET',
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://shanghaicity.openservice.kankanews.com'
      },
      form: 'idnum=850%E8%B7%AF'
    }
    return new Promise((resolve, reject) => {
      request.post(options, function(error, response, body) {
        resolve(body)
      })
    })
  }
  function getStationInfo(index) {
    let options = {
      url: 'https://shanghaicity.openservice.kankanews.com/public/bus/Getstop',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 wxwork/2.2.0 MicroMessenger/4.5.255',
        method: 'GET',
        // 'path': '/activemcenter/mfreecoupon/getcoupon?key=6799eb3ac6024ba0b7df30272414032f&roleId=15016605&to=https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2Fo91NRGPA9s5JvRFFkWfkoRQV9aU%2Findex.html&verifycode=&verifysession=&_=1540433934140&sceneval=2&g_login_type=1&callback=jsonpCBKD&g_ty=ls',
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://shanghaicity.openservice.kankanews.com',
        cookie: ''
        // 'X-Requested-With': 'XMLHttpRequest'
      },
      form: 'stoptype=0&stopid=' + index + '.&sid=' + sid + ''
    }
    return new Promise((resolve, reject) => {
      request.post(options, function(error, response, body) {
        body = JSON.parse(body)
        if (!(body instanceof Array)) {
          body = [
            {
              time: 99999
            }
          ]
        }
        resolve(JSON.stringify(body))
      })
    })
  }
})
router.get('/bus850-down', function(req, res, next) {
  const request = require('request')
  let firstArriveTime = 0
  let secondArriveTime = 0
  let beforeStationTime = []
  let sid = ''
  let startNum = 2
  let resResult = ''
  main()

  async function main() {
    await getSid().then(res => {
      res = JSON.parse(res)
      sid = res.sid
      console.log('sid为' + sid)
    })
    await getStationInfo(startNum).then(res => {
      res = JSON.parse(res)
      firstArriveTime = JSON.parse(res[0].time)
    })
    let isBreak = false
    for (let i = startNum - 1; i >= 1; i--) {
      if (isBreak) break
      await getStationInfo(i).then(res => {
        res = JSON.parse(res)
        let temp = parseInt(res[0].time)
        console.log(temp)
        if (beforeStationTime.length === 0) return beforeStationTime.push(temp)
        if (temp < beforeStationTime[beforeStationTime.length - 1]) {
          beforeStationTime.push(temp)
        } else {
          secondArriveTime = temp
          isBreak = true
        }
      })
    }
    let beforeSum = 0
    beforeStationTime.forEach(item => {
      beforeSum += item
    })
    let firstDesc = firstArriveTime === 99999 ? '等待发车' : `${(firstArriveTime/60).toFixed(1)}分钟到`
    let secondDesc = secondArriveTime === 99999 || firstArriveTime === 99999 ? '等待发车' : ((firstArriveTime+secondArriveTime)/60).toFixed(1) + '分钟到达'
    resResult = `第一班车：${firstDesc}，第二班车：${secondDesc}`
    res.render('bus/bus850', { title: '下班', contnet: resResult })
  }
  function getSid() {
    let options = {
      url: 'https://shanghaicity.openservice.kankanews.com/public/bus/get',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 wxwork/2.2.0 MicroMessenger/4.5.255',
        method: 'GET',
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://shanghaicity.openservice.kankanews.com'
      },
      form: 'idnum=850%E8%B7%AF'
    }
    return new Promise((resolve, reject) => {
      request.post(options, function(error, response, body) {
        resolve(body)
      })
    })
  }
  function getStationInfo(index) {
    let options = {
      url: 'https://shanghaicity.openservice.kankanews.com/public/bus/Getstop',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 wxwork/2.2.0 MicroMessenger/4.5.255',
        method: 'GET',
        // 'path': '/activemcenter/mfreecoupon/getcoupon?key=6799eb3ac6024ba0b7df30272414032f&roleId=15016605&to=https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2Fo91NRGPA9s5JvRFFkWfkoRQV9aU%2Findex.html&verifycode=&verifysession=&_=1540433934140&sceneval=2&g_login_type=1&callback=jsonpCBKD&g_ty=ls',
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://shanghaicity.openservice.kankanews.com',
        cookie: ''
        // 'X-Requested-With': 'XMLHttpRequest'
      },
      form: 'stoptype=1&stopid=' + index + '.&sid=' + sid + ''
    }
    return new Promise((resolve, reject) => {
      request.post(options, function(error, response, body) {
        body = JSON.parse(body)
        if (!(body instanceof Array)) {
          body = [
            {
              time: 99999
            }
          ]
        }
        resolve(JSON.stringify(body))
      })
    })
  }
  
})
module.exports = router
