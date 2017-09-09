(function() {
    angular
        .module("Prepper")
        .controller("RecipeEditController", RecipeEditController);

    function RecipeEditController($location, $routeParams, RecipeService) {
        var vm = this;
        vm.navButton = 'recipe';
        vm.updateRecipe = updateRecipe;
        vm.deleteRecipe = deleteRecipe;
        vm.addIngredientRow = addIngredientRow;
        vm.removeIngredient = removeIngredient;

        vm.uid = $routeParams["uid"];
        vm.rid = $routeParams["rid"];
        vm.submitted = false;

        /**
         * Initializes the state of the page for the current recipe ID (vm.rid), by requesting all of the
         * information about the recipe to display to be edited. Sets vm.recipe when the server successfully
         * responds with a found recipe from the database.
         */
        function init() {
            RecipeService
                .findRecipeById(vm.rid)
                .then(
                    function(response) {
                        vm.recipe = response.data;
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }
        init();

        /**
         * Updates the current recipe with what has been changed to the state of the model through the UI.
         * When successful, redirects the user to the recipe-view page for the current recipe.
         */
        function updateRecipe() {
            vm.submitted = true;
            if(vm.recipe.name) {
                RecipeService
                    .updateRecipe(vm.rid, vm.recipe)
                    .then(
                        function (response) {
                            vm.submitted = false;
                            $location.url("/user/" + vm.uid + "/recipe/" + vm.rid);
                        },
                        function (error) {
                            vm.error = error.data;
                        }
                    )
            }
            else {
                vm.error = "Recipe name is required";
            }
        }

        /**
         * Deletes the current recipe, after the OK in the confirmation message has been clicked by the
         * user. Then, redirects the user to the restaurant's recipe-book.
         */
        function deleteRecipe() {
            if (window.confirm("Are you sure you want to delete this recipe (" + vm.recipe.name + ")?")) {
                RecipeService
                    .deleteRecipe(vm.rid)
                    .then(
                        function (response) {
                            $location.url("/user/" + vm.uid + "/recipe/recipe-book");
                        },
                        function (error) {
                            vm.error = error.data;
                        }
                    )
            }
        }

        /**
         * Adds a new ingredient row to the recipe.ingredients, with a new ID for the row.
         */
        function addIngredientRow() {
            vm.recipe.ingredients.push({_id: (new Date).getTime()});
        }

        /**
         * After the user confirms to remove the ingredient, removes the ingredient row from the recipe.ingredients list
         * that matches the given ingredient id
         *
         * @param ingredientId String - the given _id of the ingredient to remove from the recipe
         */
        function removeIngredient(ingredientId) {
            if (window.confirm("Are you sure you want to delete this ingredient?")) {
                for (var i in vm.recipe.ingredients) {
                    if (vm.recipe.ingredients[i]._id == ingredientId) {
                        vm.recipe.ingredients.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
})();