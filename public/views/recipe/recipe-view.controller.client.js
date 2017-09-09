(function() {
    angular
        .module("Prepper")
        .controller("RecipeViewController", RecipeViewController);

    function RecipeViewController($routeParams, RecipeService, PrepService, TimerService, UserService) {
        var vm = this;
        vm.navButton = 'recipe';
        vm.addToPrepToDo = addToPrepToDo;
        vm.addTimer = addTimer;
        
        vm.uid = $routeParams["uid"];
        vm.rid = $routeParams["rid"];
        vm.multiplier = 1;
        vm.timerAdded = false;
        vm.addedToPrepToDo = false;
        
        function init() {
            RecipeService
                .findRecipeById(vm.rid)
                .then(
                    function(response) {
                        vm.recipe = response.data;
                        vm.restaurantId = vm.recipe.restaurantId;

                        vm.recipe.hidden = vm.recipe.hidden ? 'yes' : 'no';

                        return PrepService
                            .findPrepListByRestaurantId(vm.restaurantId);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.prepList = response.data;
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    UserService
                        .findUserById(vm.uid)
                        .then(
                            function(response) {
                                vm.user = response.data;
                            },
                            function(error) {
                                vm.error = error.data;
                            }
                        )
                )
        }
        init();

        function askQuantity() {
            do {
                var quantity = parseInt(window.prompt("Please enter a quantity to prepare (greater than 0)", ""), 10);
            }
            while(quantity && (isNaN(quantity) || quantity < 1));

            return quantity;
        }
        
        function addToPrepToDo() {
            vm.loading = true;
            vm.addedToPrepToDo = false;
            var quantity = askQuantity();
            if (isNaN(quantity)) {
                vm.addedToPrepToDo = false;
                vm.loading = false;
            }
            else {
                var newPrepItem = {
                    _recipeId: vm.recipe._id,
                    name: vm.recipe.name,
                    important: false,
                    notes: "",
                    timeStamp: (new Date).toDateString(),
                    quantity: quantity,
                    users: [vm.user.username]
                };

                PrepService
                    .addToPrepListToDo(vm.prepList._id, newPrepItem)
                    .then(
                        function (response) {
                            vm.success = "Successfully added recipe to to-do";
                            vm.addedToPrepToDo = true;
                            vm.loading = false;
                        },
                        function (error) {
                            vm.error = error.data;
                            vm.addedToPrepToDo = false;
                            vm.loading = false;
                        }
                    )
            }
        }
        
        function addTimer(minutes) {
            if(minutes) {
                var newTimer = {
                    name: vm.recipe.name,
                    _recipe: vm.recipe._id,
                    _user: vm.uid,
                    restaurantId: vm.recipe.restaurantId,
                    timeStart: new Date(Date.now()),
                    setMinutes: minutes,
                    timeEnd: new Date(Date.now() + (minutes * 60000))
                };
                TimerService
                    .createTimer(newTimer)
                    .then(
                        function(response) {
                            vm.success = "Successfully added timer";
                            vm.timerAdded = true;
                        },
                        function(error) {
                            vm.error = error.data;
                            vm.timerAdded = false;
                        }
                    )
            }
            else {
                vm.error = "Please enter a time for the timer";
            }
        }
    }
    
})();