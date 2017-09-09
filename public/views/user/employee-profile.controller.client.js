(function() {
    angular
        .module("Prepper")
        .controller("ProfileController", ProfileController);

    function ProfileController($routeParams, $rootScope, $location, UserService) {
        var vm = this;
        vm.navButton = 'user';
        vm.logout = logout;
        
        vm.uid = $routeParams["uid"];
        vm.employees = [];
        
        function init() {
            if(!vm.uid && $rootScope.currentUser) {
                vm.user = $rootScope.currentUser;
                if(vm.user.manager) {
                    getEmployees();
                }
            }
            else {
                UserService
                    .findUserById(vm.uid)
                    .then(
                        function(response) {
                            vm.user = response.data;
                            if (vm.user.manager) {
                                getEmployees();
                            }
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    )
            }
        }
        init();
        
        function getEmployees() {
            UserService
                .findUsersByRestaurantId(vm.user.restaurantId)
                .then(
                    function(response) {
                        var users = response.data;
                        for(var i in users) {
                            if (users[i]._id != vm.user._id) {
                                vm.employees.push(users[i]);
                            }
                        }
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }

        function logout() {
            $rootScope.currentUser = null;

            UserService
                .logout()
                .then(
                    function(response) {
                        $location.url("/login");
                    },
                    function(error) {
                        $location.url("/login");
                    }
                )
        }
    }
    
})();