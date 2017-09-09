module.exports = function() {
    var mongoose = require("mongoose");

    var RecipeSchema = mongoose.Schema({
        name: String,
        prepTime: Number,
        type: String,
        description: String,
        ingredients: [{
            _id: Number,
            name: String,
            amount: Number,
            measure: String
        }],
        directions: String,
        restaurantId: Number,
        lastUsedDate: {type: Date, default: Date.now()},
        dateCreate: {type: Date, default: Date.now()},
        dateModified: Date,
        hidden: Boolean
    }, {collection: "recipe"});
    
    return RecipeSchema;
};