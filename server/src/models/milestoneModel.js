const mongoose=require('mongoose');
const milestoneSchema = new mongoose.Schema({
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
    title:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    amount:{type:Number,required:true},
status:{type:String,default:'pending',enum:['pending','submitted','approved','revision_requested']},
deliverableUrl:{type:String,trim:true}
},{timestamps:true})
const milestoneModel = mongoose.model('Milestone',milestoneSchema);
module.exports = milestoneModel;
