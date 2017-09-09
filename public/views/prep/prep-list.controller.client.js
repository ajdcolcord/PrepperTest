(function() {
    angular
        .module("Prepper")
        .controller("PrepListController", PrepListController);

    function PrepListController($routeParams, UserService, PrepService) {
        var vm = this;
        vm.navButton = 'prep';
        vm.moveToInProgress = moveToInProgress;
        vm.moveToCompleted = moveToCompleted;
        vm.moveToDeleted = moveToDeleted;
        vm.moveBackToToDo = moveBackToToDo;
        vm.sorted = sorted;
        vm.addNotesToDo = addNotesToDo;
        vm.addNotesInProgress = addNotesInProgress;
        
        vm.uid = $routeParams["uid"];
        vm.unlocked = true;
        vm.initialized = false;

        /**
         * Initializes everything needed for the state of this prep-list, including finding the user and
         * prep list to display
         */
        function init() {
            UserService
                .findUserById(vm.uid)
                .then(
                    function(response) {
                        vm.user = response.data;
                        getPrepList();
                        vm.initialized = true;
                    },
                    function(error) {
                        vm.error = error.data;
                        vm.initialized = true;
                    }
                );

        }
        init();

        /**
         * Retrieves the prep list for the restaurant of the current user. If there is an error returned
         * from the service, then it is determined that the current user doesn't have access to the prep list
         * for the restaurant yet.
         */
        function getPrepList() {
            PrepService
                .findPrepListByRestaurantId(vm.user.restaurantId)
                .then(
                    function(response) {
                        vm.prepList = response.data;
                    },
                    function(error) {
                        vm.unlocked = false;
                        vm.error = "Please add a Restaurant ID to your profile to view items on the PrepList";
                    }
                )
        }

        /**
         * Adds the given new notes to the given prep ticket that is located at the given index. Blurs the
         * input for the notes on that ticket (to drop the keyboard).
         *
         * @param ticket {_id: String, name: String, notes: String, ...} - the given prep ticket to add notes to
         * @param newNotes String - the notes to add to the ticket
         * @param index Number - the index of the ticket in the list
         */
        function addNotesToDo(ticket, newNotes, index) {
            if (newNotes) {
                PrepService
                    .addNotesToDo(vm.prepList._id, ticket._id, newNotes)
                    .then(
                        function(response) {
                            ticket.notes += newNotes + " - ";
                            $("#toDoItemInput_" + index).blur();
                            vm.success = "Notes Updated"
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    )
            }
        }

        /**
         * Adds the given new notes to the given prep ticket that is located at the given index. Blurs the
         * input for the notes on that ticket (to drop the keyboard).
         *
         * @param ticket {_id: String, name: String, notes: String, ...} - the given prep ticket to add notes to
         * @param newNotes String - the notes to add to the ticket
         * @param index Number - the index of the ticket in the list
         */
        function addNotesInProgress(ticket, newNotes, index) {
            if (newNotes) {
                PrepService
                    .addNotesInProgress(vm.prepList._id, ticket._id, newNotes)
                    .then(
                        function(response) {
                            ticket.notes += newNotes + " - ";
                            $("#inProgressItemInput_" + index).blur();
                            vm.success = "Notes Updated"
                        },
                        function(error) {
                            vm.error = error.data;
                        }
                    )
            }
        }

        /**
         * Moves the given prep list item/ticket to the in-progress list, adding any un-submitted notes to the
         * ticket prior to moving the ticket.
         *
         * Moves the ticket to the inProgress list in the UI first (to speed up interface), setting prepListItem.moving
         * to true until the server responds with an OK or error message.
         *
         * @param prepListItem {_id: String, name: String, notes: String, ...} - the ticket to move
         * @param newNotes String - the un-submitted notes in the input field to add prior to moving
         */
        function moveToInProgress(prepListItem, newNotes) {
            prepListItem.moving = true;
            prepListItem.timeStamp = new Date();

            if(newNotes) {
                prepListItem.notes += newNotes + " - ";
            }
            prepListItem.users.push(vm.user.username);

            vm.prepList.inProgress.push(prepListItem);
            removeItemFromList(prepListItem, vm.prepList.toDo);

            PrepService
                .addToPrepListInProgress(vm.prepList._id, prepListItem)
                .then(
                    function(response) {
                        return PrepService
                            .removeFromPrepToDoList(vm.prepList._id, prepListItem._id);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.success = "Item moved successfully";
                        prepListItem.moving = false;
                    },
                    function(error) {
                        vm.error = error.data;
                        prepListItem.moving = false;
                    }
                )
        }

        /**
         * Moves the given prep list item/ticket to the completed list, adding any un-submitted notes to the
         * ticket prior to moving the ticket.
         *
         * Moves the ticket to the completed list in the UI first (to speed up interface), setting prepListItem.moving
         * to true until the server responds with an OK or error message.
         *
         * @param prepListItem {_id: String, name: String, notes: String, ...} - the ticket to move
         * @param newNotes String - the un-submitted notes in the input field to add prior to moving
         */
        function moveToCompleted(prepListItem, newNotes) {
            prepListItem.moving = true;
            prepListItem.completeTime = new Date();

            if(newNotes) {
                prepListItem.notes += newNotes + " - ";
            }
            prepListItem.users.push(vm.user.username);

            vm.prepList.completed.push(prepListItem);
            removeItemFromList(prepListItem, vm.prepList.inProgress);

            PrepService
                .addToPrepListCompleted(vm.prepList._id, prepListItem)
                .then(
                    function(response) {
                        return PrepService
                            .removeFromPrepInProgressList(vm.prepList._id, prepListItem._id);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.success = "Item moved successfully";
                        prepListItem.moving = false;
                    },
                    function(error) {
                        vm.error = error.data;
                        prepListItem.moving = false;
                    }
                )
        }

        /**
         * Moves the given prep list item/ticket to the deleted list (history).
         *
         * Moves the ticket to the deleted list in the UI first (to speed up interface), setting prepListItem.moving
         * to true until the server responds with an OK or error message.
         *
         * @param prepListItem {_id: String, name: String, notes: String, ...} - the ticket to move
         */
        function moveToDeleted(prepListItem) {
            prepListItem.moving = true;

            prepListItem.users.push(vm.user.username);

            removeItemFromList(prepListItem, vm.prepList.completed);

            PrepService
                .addToPrepListDeleted(vm.prepList._id, prepListItem)
                .then(
                    function(response) {
                        return PrepService
                            .removeFromPrepCompletedList(vm.prepList._id, prepListItem._id);
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                function(response) {
                    vm.success = "Item moved successfully";
                    prepListItem.moving = false;
                },
                function(error) {
                    vm.error = error.data;
                    prepListItem.moving = false;
                }
            )
        }

        /**
         * Moves the given prep list item/ticket to the to-do list, adding any un-submitted notes to the
         * ticket prior to moving the ticket.
         *
         * Moves the ticket to the to-do list in the UI first (to speed up interface), setting prepListItem.moving
         * to true until the server responds with an OK or error message.
         *
         * @param prepListItem {_id: String, name: String, notes: String, ...} - the ticket to move
         * @param newNotes String - the un-submitted notes in the input field to add prior to moving
         */
        function moveBackToToDo(prepListItem, newNotes) {
            prepListItem.moving = true;

            if(newNotes) {
                prepListItem.notes += newNotes + " - ";
            }
            prepListItem.users.push(vm.user.username);

            vm.prepList.toDo.push(prepListItem);
            removeItemFromList(prepListItem, vm.prepList.inProgress);

            PrepService
                .addToPrepListToDo(vm.prepList._id, prepListItem)
                .then(
                    function(response) {
                        return PrepService
                            .removeFromPrepInProgressList(vm.prepList._id, prepListItem._id)
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                ).then(
                    function(response) {
                        vm.success = "Item moved back successfully";
                        prepListItem.moving = false;
                    },
                    function(error) {
                        vm.error = error.data;
                        prepListItem.moving = false;
                    }
                )
        }

        /**
         * Removes the given item (prep ticket) form the given list (to-do, inprogress, completed, etc.).
         * THIS IS A UI CHANGE ONLY
         *
         * @param item {_id: String, name: String, notes: String, ...} - the ticket to remove
         * @param list [{_id: String, name: String, notes: String, ...}, ...] - the list of tickets to remove from
         */
        function removeItemFromList(item, list) {
            for (var i = 0; i < list.length; i++) {
                if (item._id == list[i]._id) {
                    list.splice(i, 1);
                    break;
                }
            }
        }

        /**
         * Call the service to reorder the items in the to-do prep list, where the item moved was at startIndex,
         * and it was moved to endIndex
         * @param startIndex Number - the starting index of the ticket
         * @param endIndex Number - the ending index of the ticket
         */
        function sorted(startIndex, endIndex) {
            PrepService
                .reorderToDo(vm.prepList._id, startIndex, endIndex)
                .then(
                    function(response) {
                        vm.success = "Reordering successful";
                    },
                    function(error) {
                        vm.error = error.data;
                    }
                )
        }
    }
    
})();