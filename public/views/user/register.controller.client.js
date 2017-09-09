(function() {
    angular
        .module("Prepper")
        .controller("RegisterController", RegisterController);
    

    function RegisterController($location, $rootScope, UserService) {

        var vm = this;
        vm.register = register;
        vm.submitted = false;
        vm.badPassword = false;
        vm.badEmail = false;

        function register(username, password, verifyPassword, firstName, lastName, email, restaurantId) {
            vm.submitted = true;
            if (username && password && verifyPassword) {
                if (firstName == null) {
                    vm.error = "Please enter a first name";
                }
                else if (lastName == null) {
                    vm.error = "Please enter a last name";
                }
                else if (password !== verifyPassword) {
                    vm.badPassword = true;
                    vm.error = "Passwords do not match";
                }
                else if (!validateEmail(email)) {
                    vm.badEmail = true;
                    vm.error = "Invalid email address";
                }
                else if (restaurantId == null) {
                    vm.error = "Please enter a restaurant id";
                }
                else {
                    var newUser = {
                        username: username.toLowerCase(),
                        password: password,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        restaurantId: restaurantId
                    };

                    UserService
                        .register(newUser)
                        .then(
                            function(response) {
                                $rootScope.currentUser = response.data;
                                $location.url("/user/" + response.data._id);
                                vm.submitted = false;
                                vm.badPassword = false;
                                vm.badEmail = false;
                            },
                            function(error) {
                                vm.error = error.data;
                            }
                        )
                }
            }
            else {
                vm.error = "Please enter the required information"
            }
        }

        function validateEmail(email) {
            // found: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }
})();