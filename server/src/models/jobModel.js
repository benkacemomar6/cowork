const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
    client:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    title:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    category:{type:String,required:true,trim:true},
    budget:{
        min:{type:Number,required:true},
        max:{type:Number,required:true},
        type:{type:String,enum:['fixed','hourly'],default:'fixed'}
    },
    status:{type:String,default:'open',enum:['open','in_progress','completed','cancelled']},
    acceptedProposal:{type:mongoose.Schema.Types.ObjectId,ref:'Proposal'},
},{timestamps:true})

const jobModel = mongoose.model('Job',jobSchema);
module.exports = jobModel;