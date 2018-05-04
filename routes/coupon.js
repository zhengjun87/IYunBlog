var express = require('express');
var couponmodel = require('../model/db').coupon;
var router = express.Router();
router.get('/', function(req, res, next) {
  res.send('地址更改（将www修改为quan）请访问：http://quan.woiyun.com/coupon/#/aa8888');
});
router.post('/getCoupon', function(req, res, next) {
  var body=req.body;
  couponmodel.find({user_flag:body.user_flag}).sort({'_id':-1}).exec(function(err,docs){
    if(!err){
      res.send({code:'00',couponList:docs});
    }
  })
});
router.post('/addCoupon', function(req, res, next) {
  var body=req.body;
  couponmodel.create({
  	coupon_name:body.coupon_name,
  	coupon_time:body.coupon_time,
  	coupon_url:body.coupon_url,
  	coupon_remark:body.coupon_remark,
    user_flag:body.user_flag
  },function(err,doc){
  	if(err){
      console.log(err);
  		res.send({code:'01'});
  	}else{
  		res.send({code:'00'});
  	}
  });
});
router.post('/removeCoupon',function(req,res,next){
	var body=req.body;
	couponmodel.remove({_id:body.id},function(err,doc){
		if(!err){
			res.send({code:'00'});
		}else{
      res.send({code:'01'});
    }
	})
})
router.post('/editCoupon',function(req,res,next){
  var body=req.body;
  couponmodel.updata({_id:body.id},{
    coupon_name:body.coupon_name,
    coupon_time:body.coupon_time,
    coupon_url:body.coupon_url,
    coupon_remark:body.coupon_remark,
    user_flag:body.user_flag
  },function(err,doc){
    if(!err){
      res.send({code:'00'});
    }else{
      res.send({code:'01'});
    }
  })
})
module.exports=router;