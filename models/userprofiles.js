var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userprofileSchema = new mongoose.Schema({  
    fname: String,
    lname: String,
    email: String,
    phone: String,
    _user : { type: Schema.Types.ObjectId, ref: 'User' },
    created: { type : Date, default: Date.now }
});
mongoose.model('Userprofile', userprofileSchema);