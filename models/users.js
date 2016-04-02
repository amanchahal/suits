var mongoose = require('mongoose');  
var userSchema = new mongoose.Schema({  
  username: {type:String,unique : true,index:true,required:true},
  password: String,
  type: Number,
  created: { type : Date, default: Date.now }
});
mongoose.model('User', userSchema);