const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const proposalSchema = new Schema({
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
    freelancerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
bidAmount:{type:Number,required:true},
status:{type:String,default:'pending',enum:['pending','accepted','rejected','withdrawn']},
coverLetter: { type: String, required: true, trim: true }
},{timestamps:true})
const proposalModel = mongoose.model('Proposal',proposalSchema);
module.exports = proposalModel;
