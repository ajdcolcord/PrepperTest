module.exports = function(app, models) {

    var prepModel = models.prepModel;
    var recipeModel = models.recipeModel;

    app.post("/api/prep/", createPrepList);
    app.get("/api/prep/:prepListId", findPrepListById);
    app.get("/api/restaurant/:restaurantId/prep", findPrepListByRestaurantId);
    app.get("/api/restaurant/:restaurantId/prep/history", findPrepListHistoryByRestaurantId);
    app.put("/api/prep/:prepListId", updatePrepList);
    app.delete("/api/prep/:prepListId", deletePrepList);

    app.put("/api/prep/:prepListId/toDo", addToPrepToDo);
    app.put("/api/prep/:prepListId/inProgress", addToPrepInProgress);
    app.put("/api/prep/:prepListId/completed", addToPrepCompleted);
    app.put("/api/prep/:prepListId/deleted", addToPrepDeleted);
    app.delete("/api/prep/:prepListId/toDo/:ticketId", removeFromPrepToDoList);
    app.delete("/api/prep/:prepListId/inProgress/:ticketId", removeFromPrepInProgressList);
    app.delete("/api/prep/:prepListId/completed/:ticketId", removeFromPrepCompletedList);

    app.put("/api/prep/:prepListId/toDo/reorder", reorderToDo); // "/api/prep/:prepListId/todo/reorder?start=start&end=end"

    app.put("/api/prep/:prepListId/toDo/:ticketId/notes", addNotesToDo);
    app.put("/api/prep/:prepListId/inProgress/:ticketId/notes", addNotesInProgress);
    
    function addNotesToDo(req, res) {
        var newNotes = req.body.notes;
        var prepListId = req.params.prepListId;
        var ticketId = req.params.ticketId;
        
        prepModel
            .addNotesToDo(prepListId, ticketId, newNotes)
            .then(
                function(response) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update notes");
                }
            )
        
    }

    function addNotesInProgress(req, res) {
        var newNotes = req.body.notes;
        var prepListId = req.params.prepListId;
        var ticketId = req.params.ticketId;

        prepModel
            .addNotesInProgress(prepListId, ticketId, newNotes)
            .then(
                function(response) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update notes");
                }
            )

    }
    
    function reorderToDo(req, res) {
        var startIndex = req.query['start'];
        var endIndex = req.query['end'];
        var prepListId = req.params.prepListId;
        
        prepModel
            .reorderToDo(startIndex, endIndex, prepListId)
            .then(
                function(prepList) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to reorder tickets for prepList " + prepListId);
                }
            )
    }


    function removeFromPrepToDoList(req, res) {
        var prepListId = req.params.prepListId;
        var ticketId = req.params.ticketId;

        prepModel
            .removeFromPrepToDoList(prepListId, ticketId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }

    function removeFromPrepInProgressList(req, res) {
        var prepListId = req.params.prepListId;
        var ticketId = req.params.ticketId;

        prepModel
            .removeFromPrepInProgressList(prepListId, ticketId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }

    function removeFromPrepCompletedList(req, res) {
        var prepListId = req.params.prepListId;
        var ticketId = req.params.ticketId;

        prepModel
            .removeFromPrepCompletedList(prepListId, ticketId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function addToPrepToDo(req, res) {
        var newTicket = req.body;
        var prepListId = req.params.prepListId;
        prepModel
            .findPrepListById(prepListId)
            .then(
                function(prepList) {
                    newTicket.order = prepList.toDo.length;
                    return prepModel
                        .addToPrepToDo(prepListId, newTicket)
                },
                function(error) {
                    res.status(400).send(error);
                }
            ).then(
            function(prepList) {
                recipeModel
                    .updateLastUsed(newTicket._recipeId, Date.now())
                    .then(
                        function(response) {
                            res.sendStatus(200);
                        },
                        function(error) {
                            res.status(400).send(error)
                        }
                    )
            },
            function(error) {
                res.status(400).send(error);
            }
        );
    }
    
    function addToPrepInProgress(req, res) {
        var ticket = req.body;
        var prepListId = req.params.prepListId;

        prepModel
            .addToPrepInProgress(prepListId, ticket)
            .then(
                function(prepList) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }

    function addToPrepCompleted(req, res) {
        var ticket = req.body;
        var prepListId = req.params.prepListId;

        prepModel
            .addToPrepCompleted(prepListId, ticket)
            .then(
                function(prepList) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }

    function addToPrepDeleted(req, res) {
        var ticket = req.body;
        var prepListId = req.params.prepListId;

        prepModel
            .addToPrepDeleted(prepListId, ticket)
            .then(
                function(prepList) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }

    function createPrepList(req, res) {
        var newPrepList = req.body;

        prepModel
            .createPrepList(newPrepList)
            .then(
                function(prepList) {
                    res.status(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function findPrepListById(req, res) {
        var prepListId = req.params.prepListId;

        prepModel
            .findPrepListById(prepListId)
            .then(
                function(prepList) {
                    res.json(prepList);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
    
    function findPrepListByRestaurantId(req, res) {
        var restaurantId = req.params.restaurantId;

        prepModel
            .findPrepListByRestaurantId(restaurantId)
            .then(
                function(prepList) {
                    res.json(prepList);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }

    function findPrepListHistoryByRestaurantId(req, res) {
        var restaurantId = req.params.restaurantId;

        prepModel
            .findPrepListHistoryByRestaurantId(restaurantId)
            .then(
                function(prepList) {
                    res.json(prepList.deleted);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
    
    function updatePrepList(req, res) {
        var prepList = req.body;
        var prepListId = req.params.prepListId;

        prepModel
            .updatePrepList(prepListId, prepList)
            .then(
                function(prepList) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update prep list with ID " + prepListId);
                }
            );
    }
    function deletePrepList(req, res) {
        var prepListId = req.params.prepListId;

        prepModel
            .deletePrepList(prepListId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to delete prep list with ID " + prepListId);
                }
            );
    }
};