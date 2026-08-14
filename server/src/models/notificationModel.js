const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    type:{type:String,required:true,enum:['newproposal','proposalaccepted','proposalrejected','milestonecompleted','milestoneapproved','milestonerejected']},
    message:{type:String,required:true,trim:true},
    isRead:{type:Boolean,default:false}
},{timestamps:true})
const notificationModel = mongoose.model('Notification',notificationSchema);
module.exports = notificationModel;