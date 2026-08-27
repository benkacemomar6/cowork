const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
name:{type:String,required:true,trim:true},
email:{type:String,required:true,trim:true,unique:true},
password:{type:String,required:true,trim:true,minlength:6},
role:{type:String,default:'client',enum:['client','admin','freelancer']},
bio:{type:String,trim:true},
skills:{type:[String],trim:true},
profileImage:{type:String,trim:true,default:'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'},
refreshTokens:[String],

isVerified:{type:Boolean,default:false},
isBlocked:{type:Boolean,default:false},

// store only the SHA-256 hash of these tokens — never the raw value —
// so a DB read alone can't be replayed to verify/reset someone's account
verificationTokenHash:{type:String,select:false},
verificationTokenExpires:{type:Date,select:false},
resetPasswordTokenHash:{type:String,select:false},
resetPasswordExpires:{type:Date,select:false},

},{timestamps:true})
const userModel = mongoose.model('User',userSchema);
module.exports = userModel; 