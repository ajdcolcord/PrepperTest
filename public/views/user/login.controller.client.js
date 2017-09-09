(function() {
    angular
        .module("Prepper")
        .controller("LoginController", LoginController);

    function LoginController($location, $rootScope, UserService) {
        var vm = this;
        vm.submitted = false;

        vm.login = login;
        function login(username, password) {
            vm.submitted = true;
            if (username != null) {
                UserService
                    .login(username.toLowerCase(), password)
                    .then(
                        function(response) {
                            var user = response.data;
                            if (user) {
                                $rootScope.currentUser = user;
                                $location.url("/user/" + user._id);
                                vm.submitted = false;
                            }
                        },
                        function(error) {
                            if (error.data == "googleUserError") {
                                vm.error = "This username needs to be signed in through Google";
                            }
                            else {
                                vm.error = "Incorrect Username or Password";
                            }
                        }
                    );
            }
            else {
                vm.error = "Please enter a username";
            }
        }
    }
    
})();