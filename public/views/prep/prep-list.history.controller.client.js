(function() {
    angular
        .module("Prepper")
        .controller("PrepListHistoryController", PrepListHistoryController);

    function PrepListHistoryController($routeParams, UserService, PrepService) {
        var vm = this;
        vm.navButton = 'prep';
        vm.uid = $routeParams["uid"];

        /**
         * Initializes everything needed for the prep-list-history state, retrieving the current user's information,
         * as well as the full prep-list history for the user's restaurant
         */
        function init() {
            UserService
                .findUserById(vm.uid)
                .then(
                    function(response) {
                        vm.user = response.data;
                        return PrepService
                            .findPrepListHistoryByRestaurantId(vm.user.restaurantId);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.deleted = response.data;
                    },
                    function(error) {
                        vm.error = "Please add a Restaurant ID to your profile to view items on the PrepList History";
                    }
                );

        }
        init();
    }
    
})();