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
var userModel=db.model('users', userSchema);
var articleSchema=new Schema({
	title: {type:String},
    content: {type:String},
    html:{type:String},
    type:{type:String},
    created_time:{type: Date},
    user:{
    	type:Schema.Types.ObjectId
    }
});
var articleModel=db.model('articles', articleSchema);
exports.user = userModel;
exports.article = articleModel;