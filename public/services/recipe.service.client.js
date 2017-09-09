(function() {
    angular
        .module("Prepper")
        .factory("RecipeService", RecipeService);

    function RecipeService($http) {
        var api = {
            createRecipe: createRecipe,
            findRecipesByRestaurant: findRecipesByRestaurant,
            findRecipeById: findRecipeById,
            updateRecipe: updateRecipe,
            deleteRecipe: deleteRecipe
        };
        return api;

        function createRecipe(restaurantId, recipe) {
            recipe.restaurantId = restaurantId;
            return $http.post("/api/recipe", recipe);
        }

        function findRecipesByRestaurant(restaurantId) {
            return $http.get("/api/restaurant/" + restaurantId + "/recipe");
        }

        function findRecipeById(recipeId) {
            return $http.get("/api/recipe/" + recipeId);
        }

        function updateRecipe(recipeId, recipe) {
            return $http.put("/api/recipe/" + recipeId, recipe);
        }

        function deleteRecipe(recipeId) {
            return $http.delete("/api/recipe/" + recipeId);
        }
    }

})();