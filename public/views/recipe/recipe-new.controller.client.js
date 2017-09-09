(function() {
    angular
        .module("Prepper")
        .controller("RecipeNewController", RecipeNewController);

    function RecipeNewController($location, $routeParams, RecipeService, UserService) {
        var vm = this;
        vm.navButton = 'recipe';
        vm.createRecipe = createRecipe;
        vm.addIngredientRow = addIngredientRow;
        vm.removeIngredient = removeIngredient;

        vm.uid = $routeParams["uid"];
        vm.ingredients = [];
        vm.submitted = false;
        vm.addIngredientRow();

        /**
         * Initializes the state of the model by getting the information of the current user based
         * on the uid.
         */
        function init() {
            UserService
                .findUserById(vm.uid)
                .then(
                    function (response) {
                        vm.user = response.data;
                    },
                    function (error) {
                        vm.error = error.data;
                    }
                )
        }
        init();

        /**
         * Creates a new recipe based on the information in the state of the model, and then calls the
         * RecipeService to add the new recipe to the database for the user's restaurant.
         * On success, redirects the user to the recipe view page for the new recipe.
         */
        function createRecipe() {
            vm.submitted = true;
            if (vm.recipe && vm.recipe.name) {
                var newRecipe = {
                    name: vm.recipe.name,
                    prepTime: vm.recipe.prepTime,
                    type: vm.recipe.type,
                    description: vm.recipe.description,
                    ingredients: vm.ingredients,
                    directions: vm.recipe.directions,
                    hidden: vm.recipe.hidden
                };
                RecipeService
                    .createRecipe(vm.user.restaurantId, newRecipe)
                    .then(
                        function(response) {
                            vm.success = "Successfully created recipe";
                            vm.submitted = false;
                            $location.url("/user/" + vm.uid + "/recipe/" + response.data);
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    );
            }
            else {
                vm.error = "Recipe Name is Required";
            }
        }

        /**
         * Adds a new row for the list of ingredients with a new ID
         */
        function addIngredientRow() {
            vm.ingredients.push({_id: (new Date).getTime()});
        }

        /**
         * Removes the ingredient from the list of ingredients for this recipe, after the user
         * confirms that they wish to do so
         *
         * @param ingredientId String - the _id of the ingredient to remove
         */
        function removeIngredient(ingredientId) {
            if (window.confirm("Are you sure you want to delete this ingredient?")) {
                for (var i in vm.ingredients) {
                    if (vm.ingredients[i]._id == ingredientId) {
                        vm.ingredients.splice(i, 1);
                    }
                }
            }
        }
    }
    
})();