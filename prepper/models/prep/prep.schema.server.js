module.exports = function() {
    var mongoose = require("mongoose");

    var PrepSchema = mongoose.Schema({
        restaurantId: Number,
        toDo: [{
            _recipeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
            name: String,
            important: Boolean,
            notes: String,
            timeStamp: {type: Date, default: Date.now()},
            quantity: Number,
            order: Number,
            users: [{type: String}]
        }],
        inProgress: [{
            _recipeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
            name: String,
            important: Boolean,
            notes: String,
            timeStamp: Date,
            quantity: Number,
            order: Number,
            users: [{type: String}]
        }],
        completed: [{
            _recipeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
            name: String,
            important: Boolean,
            notes: String,
            timeStamp: Date,
            order: Number,
            quantity: Number,
            completeTime: Date,
            users: [{type: String}]
        }],
        deleted: [{
            _recipeId: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'},
            name: String,
            important: Boolean,
            notes: String,
            timeStamp: Date,
            order: Number,
            quantity: Number,
            completeTime: Date,
            users: [{type: String}],
            deletedTime: {type: Date, default: Date.now()}
        }]
    }, {collection: "prep"});
    
    return PrepSchema;
};