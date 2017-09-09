(function() {
    angular
        .module("Prepper")
        .factory("UserService", UserService);

    function UserService($http) {

        var api = {
            login: login,
            register: register,
            logout: logout,
            checkLoggedin: checkLoggedin,

            createUser: createUser,
            findUserById: findUserById,
            findUserByUsername: findUserByUsername,
            findUserByCredentials: findUserByCredentials,
            findUsersByRestaurantId: findUsersByRestaurantId,
            updateUser: updateUser,
            deleteUser: deleteUser,
            addRestaurantId: addRestaurantId,
            activateUser: activateUser,
            deactivateUser: deactivateUser
        };
        return api;


        function login(username, password) {
            var url = "/api/prepper/login";
            var user = {
                username: username,
                password: password
            };
            return $http.post(url, user);
        }

        function register(user) {
            return $http.post("/api/prepper/register", user);
        }

        function logout() {
            return $http.post('/api/prepper/logout');
        }

        function checkLoggedin() {
            return $http.get("/api/prepper/loggedin");
        }

        function createUser(user) {
            return $http.post("/api/employee", user);
        }

        function findUserById(userId) {
            return $http.get("/api/employee/" + userId);
        }

        function findUserByUsername(username) {
            return $http.get("/api/employee?username=" + username);
        }

        function findUserByCredentials(username, password) {
            return $http.get("/api/employee?username=" + username + "&password=" + password);
        }

        function updateUser(userId, user, newPassword) {
            return $http.put("/api/employee/" + userId, {user: user, newPassword: newPassword});
        }
        
        function deleteUser(userId) {
            return $http.delete("/api/employee/" + userId);
        }

        function addRestaurantId(userId, newRestaurantId) {
            return $http.post("/api/employee/newRestaurantId", {userId: userId, restaurantId: newRestaurantId})
        }
        
        function findUsersByRestaurantId(restaurantId) {
            return $http.get("/api/employees/" + restaurantId);
        }
        
        function activateUser(userId) {
            return $http.put("/api/activate/" + userId);
        }
        
        function deactivateUser(userId) {
            return $http.put("/api/deactivate/" + userId);
        }
    }
})();