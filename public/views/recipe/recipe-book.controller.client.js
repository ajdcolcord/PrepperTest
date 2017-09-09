(function() {
    angular
        .module("Prepper")
        .controller("RecipeBookController", RecipeBookController);

    function RecipeBookController($routeParams, $location, RecipeService, UserService, PrepService) {
        var vm = this;
        vm.navButton = 'recipe';
        vm.loadingNew = false;
        vm.addToPrepToDo = addToPrepToDo;
        vm.newRecipe = newRecipe;
        vm.recipeFilter = recipeFilter;
        vm.recipeFilterRecent = recipeFilterRecent;
        vm.hitSearch = hitSearch;

        vm.uid = $routeParams["uid"];
        vm.recentDate = new Date();
        vm.unlocked = true;
        vm.initialized = false;

        /**
         * Adds the given number of days to the given timestamp (theDate)
         * @param theDate Date - the timestamp to add days to
         * @param days Number - the given number of days to add to the date
         * @returns {Date} - the incremented date
         */
        function addDays(theDate, days) {
            // http://stackoverflow.com/questions/3818193/how-to-add-number-of-days-to-todays-date
            return new Date(theDate.getTime() - days*24*60*60*1000);
        }

        vm.recentDate = addDays(vm.recentDate, 5);

        /**
         * Initializes everything needed for the recipe-book for the current user, including the information about
         * the current user, the recipe book for the restaurant of the current user, and the prep-list for the
         * restaurant that the current user is in.
         */
        function init() {
            UserService
                .findUserById(vm.uid)
                .then(
                    function(response) {
                        vm.user = response.data;
                        return RecipeService
                            .findRecipesByRestaurant(vm.user.restaurantId);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.recipeBook = response.data;
                        return PrepService
                            .findPrepListByRestaurantId(vm.user.restaurantId);
                    },
                    function(error) {
                        vm.unlocked = false;
                        vm.error = "Please add a Restaurant ID to your profile to view and create Recipes";
                    }
                ).then(
                    function(response) {
                        if (response) {
                            vm.prepList = response.data;
                        }
                        else {
                            vm.error = "Please add a Restaurant ID to your profile to view and create Recipes";
                        }
                        vm.initialized = true;
                    },
                    function(error) {
                        vm.error = error.data;
                        vm.initialized = true;
                    }
                )
        }
        init();

        /**
         * Creates a prompt asking for the user to enter a given quantity for an item to be prepped. The given
         * number must be a number greater than 0, or else the prompt is re-initialized.
         *
         * @returns {Number} - the desired quantity for the prep item
         */
        function askQuantity() {
            do {
                var quantity = parseInt(window.prompt("Please enter a quantity to prepare (greater than 0)", ""), 10);
            }
            while(quantity && (isNaN(quantity) || quantity < 1));

            return quantity;
        }

        /**
         * Adds the given recipe as a new ticket to the to-do list in the prep-list for
         * the current user's restaurant.
         *
         * @param recipe {_id: String, name: String, ingredients: [...], ...} - the given recipe to create a ticket for
         * @returns {Promise} - A promise that, when ready, sets variables stating that the item was successfully added
         *                      and that the server is finished with the request.
         */
        function addToPrepToDo(recipe) {
            recipe.added = false;
            recipe.loading = true;
            var quantity = askQuantity();
            if (isNaN(quantity)) {
                recipe.loading = false;
            }
            else {
                var newPrepItem = {
                    _recipeId: recipe._id,
                    name: recipe.name,
                    important: false,
                    notes: "",
                    timeStamp: (new Date).toDateString(),
                    quantity: quantity,
                    users: [vm.user.username]
                };

                return PrepService
                    .addToPrepListToDo(vm.prepList._id, newPrepItem)
                    .then(
                        function (response) {
                            recipe.added = true;
                            recipe.loading = false;
                            vm.success = "Successfully added item to ToDo";
                        },
                        function (error) {
                            recipe.added = false;
                            recipe.loading = false;
                            vm.error = error.data;
                        }
                    )
            }
        }

        /**
         * Use this function for the onClick event for the 'new recipe' button for the recipe-book.
         * Redirects the user to the new recipe creation page.
         */
        function newRecipe() {
            vm.loadingNew = true;
            $location.url("/user/" + vm.uid + "/recipe/new");
        }

        /**
         * Removing focus of the recipeSearchInput when this function
         * is fired. Used for an ng-enter on the input.
         */
        function hitSearch() {
            $("#recipeSearchInput").blur();
        }

        /** Filtering for the recipe filter, based on the given searchTerm,
         * determines if the given recipe's name is contained in the searchTerm
         * (or if the item shouldn't be filtered out if there is no searchTerm at all
         * @param searchTerm String - the given search term to filter by
         * @return Boolean - true if the item should be visible, false if filtered
         */
        function recipeFilter(searchTerm) {
            return function(recipe) {
                return (!recipe.hidden || vm.user.manager)
                    && (searchTerm == ''
                        || searchTerm == null
                        || recipe.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
                        || (recipe.type && recipe.type.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
                    );
            }
        }

        /** Filtering for the recipe filter for recent items only, based on the given searchTerm,
         * determines if the given recipe's name is contained in the searchTerm
         * (or if the item shouldn't be filtered out if there is no searchTerm at all
         * @param searchTerm String - the given search term to filter by
         * @return Boolean - true if the item should be visible, false if filtered
         */
        function recipeFilterRecent(searchTerm) {
            return function(recipe) {
                return (!recipe.hidden || vm.user.manager)
                    && vm.recentDate.toISOString() < recipe.lastUsedDate
                    && (
                        searchTerm == ''
                        || searchTerm == null
                        || recipe.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
                        || (recipe.type && recipe.type.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
                    )
            }
        }
    }
    
})();