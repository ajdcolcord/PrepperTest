module.exports = function() {
    var mongoose = require("mongoose");
    
    var EmployeeSchema = mongoose.Schema({
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        email: String,
        restaurantId: Number,
        dateCreate: {type: Date, default: Date.now()},
        dateUpdated: Date,
        google: {
            id:    String,
            token: String
        },
        manager: {type: Boolean, default: false},
        active:  {type: Boolean, default: false}
    }, {collection: "employee"});
    
    return EmployeeSchema;
};