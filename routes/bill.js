var express = require('express');
var billmodel = require('../model/db').bill;
var router = express.Router();

router.get('/', function(req, res, next) {
  billmodel.find({}).sort({'state':1}).exec(function(err,docs){
  	res.render('bill',{bills:docs});
  });
});
router.post('/addBill', function(req, res, next) {
  var body=req.body;
  billmodel.create({
  	event_theme:body.event_theme,
  	touzi_money:body.touzi_money,
  	yuji_profit:body.yuji_profit,
  	start_time:body.start_time,
  	term:body.term,
  	out_time:body.out_time,
  	user_num:body.user_num
  },function(err,doc){
  	if(err){
  		res.send({code:'01'});
  	}else{
  		res.send({code:'00'});
  	}
  });
});
router.post('/modifyState',function(req,res,next){
	var body=req.body;
	billmodel.update({_id:body._id},{state:1}).exec(function(err,doc){
		if(!err){
			res.send({code:00});
		}
	})
})
router.post('/rmBill',function(req,res,next){
	var body=req.body;
	billmodel.remove({_id:body._id}).exec(function(err,doc){
		if(!err){
			res.send({code:00});
		}
	})
})
module.exports=router;