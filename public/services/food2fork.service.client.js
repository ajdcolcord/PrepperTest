(function() {
    angular
        .module("Prepper")
        .factory("Food2ForkService", Food2ForkService);

    function Food2ForkService($http) {

        var api = {
            searchRecipes: searchRecipes,
            selectRecipe: selectRecipe
        };
        return api;

        function searchRecipes(searchTerm) {
            return $http.get("/api/food?searchterm=" + searchTerm);
        }
        
        function selectRecipe(recipeId) {
            return $http.get("/api/food/" + recipeId);
        }

    }

})();