var mongoose = require("mongoose");
var config = require("../config");
var db = mongoose.connect(config.db.url);
var Schema = mongoose.Schema;
var userSchema=new Schema({
	username: {type:String},
    password: {type:String},
    type:{type:Number},
    lv:{type:String}
});
var commentSchema=new Schema({
    user:{type:Schema.Types.ObjectId,ref:'users'},
    content:{type:String},
    created_time:{type: Date}
})
var articleSchema=new Schema({
	title: {type:String},
    content: {type:String},
    html:{type:String},
    type:{type:String},
    created_time:{type: Date},
    user:{
    	type: Schema.Types.ObjectId,
        ref:'users'
    },
    comment:[commentSchema]
});
var billSchema=new Schema({
    event_theme:{type:String},
    touzi_money:{type:String},
    yuji_profit:{type:String},
    start_time:{type: String},
    term:{type:String},
    out_time:{type:String},
    user_num:{type:String},
    state:{type:Number,default:0}
})
var couponSchema = new Schema({
    coupon_name:{type:String},
    coupon_time:{type:String},
    coupon_url:{type:String},
    coupon_remark:{type:String},
    user_flag:{type:String}
})
var userModel=db.model('users', userSchema);
var articleModel=db.model('articles', articleSchema);
var billModel=db.model('bills', billSchema);
var couponModel=db.model('coupon', couponSchema);
module.exports = {
   user: userModel,
   article:articleModel,
   bill:billModel,
   coupon:couponModel
}