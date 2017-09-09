var http = require('http');

module.exports = function(app, models) {

    var recipeModel = models.recipeModel;
    var key = process.env.FOOD2FORK_KEY;
    
    app.post("/api/recipe", createRecipe);
    app.get("/api/restaurant/:restaurantId/recipe", findAllRecipesByRestaurantId);
    app.get("/api/recipe/:recipeId", findRecipeById);
    app.put("/api/recipe/:recipeId", updateRecipe);
    app.delete("/api/recipe/:recipeId", deleteRecipe);
    app.get("/api/food", searchFood);
    app.get("/api/food/:recipeId", selectRecipe);

    function searchFood(req, res) {
        var searchTerm = req.query['searchterm'];
        searchTerm = searchTerm.replace(/\s+/g, "%20");

        var options = {
            hostname: 'food2fork.com',
            path: '/api/search?key=' + key + '&q=' + searchTerm
        };
        
        http.request(options, function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                res.send(str);
            });
        }).end();
    }

    function selectRecipe(req, res) {
        var recipeId = req.params.recipeId;

        var options = {
            hostname: 'food2fork.com',
            path: '/api/get?key=' + key + '&rId=' + recipeId
        };
        
        http.request(options, function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });
    
            response.on('end', function () {
                res.send(str);
            });
        }).end();
    
    }

    function createRecipe(req, res) {
        var newRecipe = req.body;

        recipeModel
            .createRecipe(newRecipe)
            .then(
                function(recipe) {
                    var recipeId = recipe._id;
                    res.status(200).send(recipeId);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function findAllRecipesByRestaurantId(req, res) {
        var restaurantId = req.params.restaurantId;

        recipeModel
            .findAllRecipesByRestaurantId(restaurantId)
            .then(
                function(recipes) {
                    res.json(recipes);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
    
    function findRecipeById(req, res) {
        var recipeId = req.params.recipeId;

        recipeModel
            .findRecipeById(recipeId)
            .then(
                function(recipe) {
                    res.json(recipe);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
    
    function updateRecipe(req, res) {
        var recipe = req.body;
        var recipeId = req.params.recipeId;

        recipeModel
            .updateRecipe(recipeId, recipe)
            .then(
                function(recipe) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update recipe with ID " + recipeId);
                }
            );
    }
    
    function deleteRecipe(req, res) {
        var recipeId = req.params.recipeId;

        recipeModel
            .deleteRecipe(recipeId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to delete recipe with ID " + recipeId);
                }
            );
    }
};