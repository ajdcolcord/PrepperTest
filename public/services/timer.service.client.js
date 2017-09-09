(function() {
    angular
        .module("Prepper")
        .factory("TimerService", TimerService);

    function TimerService($http) {

        var api = {
            createTimer: createTimer,
            findTimerById: findTimerById,
            findTimersByUserId: findTimersByUserId,
            updateTimer: updateTimer,
            deleteTimer: deleteTimer,
            findTimersByRestaurantId: findTimersByRestaurantId
        };
        return api;

        function createTimer(timer) {
            return $http.post("/api/timer", timer);
        }

        function findTimerById(timerId) {
            return $http.get("/api/timer/" + timerId);
        }

        function findTimersByUserId(userId) {
            return $http.get("/api/user/" + userId + "/timer");
        }

        function updateTimer(timerId, newTime) {
            return $http.put("/api/timer/" + timerId, newTime);
        }
        
        function deleteTimer(timerId) {
            return $http.delete("/api/timer/" + timerId);
        }
        function findTimersByRestaurantId(restaurantId) {
            return $http.get("/api/" + restaurantId + "/timers/");
        }
    }

})();