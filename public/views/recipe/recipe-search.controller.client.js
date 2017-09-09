(function() {
    angular
        .module("Prepper")
        .controller("RecipeSearchController", RecipeSearchController);

    function RecipeSearchController($location, $routeParams, Food2ForkService, RecipeService, UserService) {
        var vm = this;
        vm.navButton = 'search';
        vm.searching = "";
        vm.selectedRecipe = null;
        
        vm.searchRecipes = searchRecipes;
        vm.selectRecipe = selectRecipe;
        vm.addRecipe = addRecipe;

        vm.uid = $routeParams["uid"];


        function init() {
            if(vm.uid) {
                UserService
                    .findUserById(vm.uid)
                    .then(
                        function (response) {
                            vm.user = response.data;
                        },
                        function (error) {
                            vm.error = error.data;
                        }
                    );
                searchRecipes("");
            }
        }
        init();


        function searchRecipes(searchTerm) {
            $("#searchInput").blur();
            vm.searching = "searching ";
            Food2ForkService
                .searchRecipes(searchTerm)
                .then(
                    function(response) {
                        var data = response.data;
                        vm.recipes = data.recipes;
                        if (vm.recipes == null) {
                            vm.searching = "search service is temporarily down"
                        }
                        else if (vm.recipes.length) {
                            vm.searching = "";
                        }
                        else {
                            vm.searching = "no recipes found";
                        }
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }

        function selectRecipe(recipeId) {
            Food2ForkService
                .selectRecipe(recipeId)
                .then(
                    function(response) {
                        vm.selectedRecipe = response.data.recipe;
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }

        function addRecipe(recipe) {
            var ingredientsString = "";
            for(var i in recipe.ingredients) {
                ingredientsString += recipe.ingredients[i] + "\n"
            }

            var newRecipe = {
                name: recipe.title,
                description: "Source: " + recipe.source_url,
                ingredients: vm.ingredients,
                directions: ingredientsString
            };
            
            RecipeService
                .createRecipe(vm.user.restaurantId, newRecipe)
                .then(
                    function(response) {
                        vm.success = "Successfully created recipe";
                        $location.url("/user/" + vm.uid + "/recipe/" + response.data + "/edit");
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                );
        }
    }
})();