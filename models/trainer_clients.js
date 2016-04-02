var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var trainerClientSchema = new mongoose.Schema({  
    _trainerid : { type: Schema.Types.ObjectId, ref: 'User' },
    _clientid : { type: Schema.Types.ObjectId, ref: 'User' },
    created: { type : Date, default: Date.now }
});
mongoose.model('TrainerClient', trainerClientSchema);