const { timeStamp } = require('console');
const mongoose=require('mongoose');

var dataSchema=mongoose.Schema({
    transaction_from: { type: String, required: true,},
    transaction_to : { type: String,required:true },
    transaction_value :{ type: Number,required: true},
    transaction_hash :{type: String, required:true},
    tokenAddress:{type:String,require:true}
},{timestamps:true})

module.exports=mongoose.model('data',dataSchema);