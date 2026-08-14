const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    content:{type:String,required:true,trim:true}
},{timestamps:true})
const messageModel = mongoose.model('Message',messageSchema);
module.exports = messageModel;
