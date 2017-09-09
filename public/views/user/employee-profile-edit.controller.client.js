(function() {
    angular
        .module("Prepper")
        .controller("ProfileEditController", ProfileEditController);

    function ProfileEditController($location, $routeParams, UserService) {
        var vm = this;
        vm.navButton = 'user';
        vm.updateUser = updateUser;
        vm.addRestaurantId = addRestaurantId;
        vm.activatedChanged = activatedChanged;
        vm.unRegister = unRegister;
        
        vm.submitted = false;
        vm.uid = $routeParams["uid"];
        vm.employees = [];
        vm.badEmail = false;

        function init() {
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

        function updateUser(current_pass, new_pass, verify_new_pass) {
            vm.user.password = current_pass;
            vm.submitted = true;
            if (new_pass && verify_new_pass && new_pass == verify_new_pass) {
                if (validateEmail(vm.user.email)) {
                    UserService
                        .updateUser(vm.uid, vm.user, new_pass)
                        .then(
                            function (res) {
                                vm.success = "User successfully updated";
                                $location.url("/user/" + vm.uid);
                                vm.badEmail = false;
                                vm.submitted = false;
                            },
                            function (error) {
                                vm.error = error.data;
                            }
                        )
                }
                else {
                    vm.badEmail = true;
                    vm.error = "Invalid email address";
                }
            }
            else {
                vm.error = "New passwords must match and must not be empty";
            }
        }

        function addRestaurantId(newRestaurantId) {
            if(newRestaurantId) {
                UserService
                    .addRestaurantId(vm.uid, newRestaurantId)
                    .then(
                        function(res) {
                            vm.success = "User successfully updated";
                            $location.url("/user/" + vm.uid);
                            vm.submitted = false;
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    );
            }
            else {
                vm.error = "Please enter a Restaurant ID";
            }
        }

        function activatedChanged(employee) {
            if(employee.active) {
                activateUser(employee._id);
            }
            else {
                deactivateUser(employee._id);
            }
        }
        
        function activateUser(userId) {
            UserService
                .activateUser(userId)
                .then(
                    function(response) {
                        vm.success = "User successfully activated: " + userId;
                    },
                    function(error) {
                        vm.error = "Error activating user: " + userId;
                    }
                )
        }

        function deactivateUser(userId) {
            UserService
                .deactivateUser(userId)
                .then(
                    function(response) {
                        vm.success = "User successfully deactivated: " + userId;
                    },
                    function(error) {
                        vm.error = "Error deactivating user: " + userId;
                    }
                )
        }

        function unRegister() {
            UserService
                .deleteUser(vm.user._id)
                .then(
                    function(response) {
                        $location.url("/login");
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }

        function validateEmail(email) {
            // found: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }

})();