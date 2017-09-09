(function() {
    angular
        .module("Prepper")
        .factory("PrepService", PrepService);

    function PrepService($http) {

        var api = {
            createPrepList: createPrepList,
            findPrepListById: findPrepListById,
            findPrepListByRestaurantId: findPrepListByRestaurantId,
            findPrepListHistoryByRestaurantId: findPrepListHistoryByRestaurantId,
            addToPrepListToDo: addToPrepListToDo,
            addToPrepListInProgress: addToPrepListInProgress,
            addToPrepListCompleted: addToPrepListCompleted,
            removeFromPrepCompletedList: removeFromPrepCompletedList,
            removeFromPrepToDoList: removeFromPrepToDoList,
            removeFromPrepInProgressList: removeFromPrepInProgressList,
            updatePrepList: updatePrepList,
            deletePrepList: deletePrepList,
            reorderToDo: reorderToDo,
            addNotesToDo: addNotesToDo,
            addNotesInProgress: addNotesInProgress,
            addToPrepListDeleted: addToPrepListDeleted
        };
        return api;

        function createPrepList(prepList) {
            return $http.post("/api/prep", prepList);
        }

        function findPrepListById(prepListId) {
            return $http.get("/api/prep/" + prepListId);
        }

        function findPrepListByRestaurantId(restaurantId) {
            return $http.get("/api/restaurant/" + restaurantId + "/prep");
        }

        function findPrepListHistoryByRestaurantId(restaurantId) {
            return $http.get("/api/restaurant/" + restaurantId + "/prep/history");
        }

        function addToPrepListToDo(prepListId, ticket) {
            return $http.put("/api/prep/" + prepListId + "/toDo", ticket);
        }

        function addToPrepListInProgress(prepListId, ticket) {
            return $http.put("/api/prep/" + prepListId + "/inProgress", ticket);
        }

        function addToPrepListCompleted(prepListId, ticket) {
            return $http.put("/api/prep/" + prepListId + "/completed", ticket);
        }

        function removeFromPrepCompletedList(prepListId, ticketId) {
            return $http.delete("/api/prep/" + prepListId + "/completed/" + ticketId);
        }
        
        function addToPrepListDeleted(prepListId, ticket) {
            return $http.put("/api/prep/" + prepListId + "/deleted", ticket);
        }

        function removeFromPrepToDoList(prepListId, ticketId) {
            return $http.delete("/api/prep/" + prepListId + "/toDo/" + ticketId);
        }

        function removeFromPrepInProgressList(prepListId, ticketId) {
            return $http.delete("/api/prep/" + prepListId + "/inProgress/" + ticketId);
        }

        function updatePrepList(prepListId, prepList) {
            return $http.put("/api/prep/" + prepListId, prepList);
        }
        
        function deletePrepList(prepListId) {
            return $http.delete("/api/prep/" + prepListId);
        }

        function reorderToDo(prepListId, startIndex, endIndex) {
            return $http.put("/api/prep/" + prepListId + "/todo/reorder?start=" + startIndex + "&end=" + endIndex);
        }
        
        function addNotesToDo(prepListId, ticketId, newNotes) {
            return $http.put("/api/prep/" + prepListId + "/toDo/" + ticketId + "/notes", {notes: newNotes});
        }

        function addNotesInProgress(prepListId, ticketId, newNotes) {
            return $http.put("/api/prep/" + prepListId + "/inProgress/" + ticketId + "/notes", {notes: newNotes});
        }
    }

})();