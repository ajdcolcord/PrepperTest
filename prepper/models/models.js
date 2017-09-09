module.exports = function() {

    
    var employeeModel = require("./employee/employee.model.server.js")();
    var timerModel = require("./timer/timer.model.server.js")();
    var recipeModel = require("./recipe/recipe.model.server.js")();
    var prepModel = require("./prep/prep.model.server.js")();

    var models = {
        employeeModel: employeeModel,
        timerModel: timerModel,
        recipeModel: recipeModel,
        prepModel: prepModel
    };
    return models;
};