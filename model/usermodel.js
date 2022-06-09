const { strictEqual } = require('assert');
const { timeStamp } = require('console');
const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    username:{type:String},
    accountAddress:{type:String},
    accountPrivateKey:{type:String}
},{timestamps:true})

module.exports=mongoose.model('user',userSchema);