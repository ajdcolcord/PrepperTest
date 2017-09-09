module.exports = function(app) {

    var models = require("./models/models.js")();

    require("./services/user.service.server.js")(app, models);
    require("./services/prep.service.server.js")(app, models);
    require("./services/recipe.service.server.js")(app, models);
    require("./services/timer.service.server.js")(app, models);
};