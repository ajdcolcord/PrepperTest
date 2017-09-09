(function() {
    angular
        .module("Prepper")
        .controller("TimerListController", TimerListController);

    function TimerListController($interval, $routeParams,  UserService, RecipeService, PrepService, TimerService) {
        var vm = this;
        vm.deleteTimer = deleteTimer;
        vm.testGetTimeRemaining = testGetTimeRemaining;
                
        vm.uid = $routeParams["uid"];
        vm.unlocked = true;
        vm.initialized = false;

        $interval(function(){
        }, 1000);

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
                        vm.error = "Please add a Restaurant ID to your profile to view and create Timers";
                    }
                ).then(
                    function(response) {
                        if(response) {
                            vm.prepList = response.data;
                            getTimers();
                        }
                        else {
                            vm.error = "Please add a Restaurant ID to your profile to view and create Timers";
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

        function str_pad_left(string,pad,length) {
            return (new Array(length+1).join(pad)+string).slice(-length);
        }
        
        function testGetTimeRemaining(timeEnd) {
            // http://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
            var time = new Date(timeEnd) - new Date(Date.now());
            var strippedTime = parseInt(String(time).slice(0, -3));
            var hours = Math.floor(strippedTime / 3600);
            strippedTime = strippedTime - hours * 3600;
            var minutes = Math.floor(strippedTime / 60);
            var seconds = strippedTime - minutes * 60;

            var section = 'n';
            if ((hours < 1 && minutes >= 10) || hours >= 1) {
                section = 'w';
            }
            if (hours < 1 && minutes < 10) {
                section = 'g';
            }
            if (hours < 0) {
                section = 'r';
                return ['00:00:00', section];
            }
            return [str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2), section];
        }

        function getTimers() {
            if (vm.user.manager) {
                TimerService
                    .findTimersByRestaurantId(vm.user.restaurantId)
                    .then(
                        function(response) {
                            vm.timers = response.data;
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    )
            }
            else {
                TimerService
                    .findTimersByUserId(vm.user._id)
                    .then(
                        function (response) {
                            vm.timers = response.data;
                        },
                        function (error) {
                            vm.error = error.data;
                        }
                    )
            }
        }

        function deleteTimer(timerId) {
            TimerService
                .deleteTimer(timerId)
                .then(
                    function(response) {
                        vm.success = "Successfully removed timer";
                        getTimers();
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }
    }
    
})();