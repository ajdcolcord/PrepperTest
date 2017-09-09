module.exports = function() {
    var mongoose = require("mongoose");

    var TimerSchema = mongoose.Schema({
        name: String,
        _recipe: {type: mongoose.Schema.Types.ObjectId, ref: 'Timer'},
        _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        timeStart: Date,
        setMinutes: Number,
        timeEnd: Date,
        restaurantId: Number,
        dateCreate: {type: Date, default: Date.now()}
    }, {collection: "timer"});
    
    return TimerSchema;
};