(function() {
    angular
        .module("Prepper")
        .config(Config);
    
    function Config($routeProvider) {
        $routeProvider
            .when("/landing", {
                templateUrl: "views/landing/landing.view.client.html"
            })
            .when("/login", {
                templateUrl: "views/user/login.view.client.html",
                controller: "LoginController",
                controllerAs: "model"
            })
            .when("/register", {
                templateUrl: "views/user/register.view.client.html",
                controller: "RegisterController",
                controllerAs: "model"
            })
            .when("/search", {
                templateUrl: "views/recipe/recipe-search.view.client.html",
                controller: "RecipeSearchController",
                controllerAs: "model"
            })
            .when("/user", {
                templateUrl: "views/user/employee-profile.view.client.html",
                controller: "ProfileController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid", {
                templateUrl: "views/user/employee-profile.view.client.html",
                controller: "ProfileController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/edit", {
                templateUrl: "views/user/employee-profile-edit.view.client.html",
                controller: "ProfileEditController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/prep/prep-list", {
                templateUrl: "views/prep/prep-list.view.client.html",
                controller: "PrepListController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/prep/prep-list/history", {
                templateUrl: "views/prep/prep-list.history.view.client.html",
                controller: "PrepListHistoryController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/prep/timer-list", {
                templateUrl: "views/timer/timer-list.view.client.html",
                controller: "TimerListController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/recipe/new", {
                templateUrl: "views/recipe/recipe-new.view.client.html",
                controller: "RecipeNewController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/recipe/recipe-book", {
                templateUrl: "views/recipe/recipe-book.view.client.html",
                controller: "RecipeBookController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/recipe/:rid", {
                templateUrl: "views/recipe/recipe-view.view.client.html",
                controller: "RecipeViewController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/recipe/:rid/edit", {
                templateUrl: "views/recipe/recipe-edit.view.client.html",
                controller: "RecipeEditController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when("/user/:uid/recipe/new/search", {
                templateUrl: "views/recipe/recipe-search.view.client.html",
                controller: "RecipeSearchController",
                controllerAs: "model",
                resolve: {
                    loggedin: checkLoggedin
                }
            })

            //default route - login
            .otherwise({
                redirectTo: "/login"
            });

        function checkLoggedin(UserService, $q, $location, $rootScope) {
            var deferred = $q.defer();
            UserService
                .checkLoggedin()
                .then(
                    function(response) {
                        var user = response.data;
                        if (user == '0') {
                            deferred.reject();
                            $rootScope.currentUser = null;
                            $location.url("/login");
                        }
                        else {
                            $rootScope.currentUser = user;
                            deferred.resolve();
                        }
                    },
                    function(error) {
                        deferred.reject();
                        $rootScope.currentUser = null;
                        $location.url("/login");
                    }
                );

            return deferred.promise;
        }
    }
})();
