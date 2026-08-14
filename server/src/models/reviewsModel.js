const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    jobId:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
    reviewer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    reviewee:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    rating:{type:Number,required:true,min:1,max:5},
    comment:{type:String,trim:true}
},{timestamps:true})

const reviewModel = mongoose.model('Review', reviewSchema);
module.exports = reviewModel;