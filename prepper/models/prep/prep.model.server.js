module.exports = function() {

    var mongoose = require("mongoose");

    var PrepSchema = require("./prep.schema.server")();
    var Prep = mongoose.model("Prep", PrepSchema);

    var api = {
        createPrepList: createPrepList,
        findPrepListById: findPrepListById,
        findPrepListByRestaurantId: findPrepListByRestaurantId,
        findPrepListHistoryByRestaurantId: findPrepListHistoryByRestaurantId,
        updatePrepList: updatePrepList,
        deletePrepList: deletePrepList,

        addToPrepToDo: addToPrepToDo,
        addToPrepInProgress: addToPrepInProgress,
        addToPrepCompleted: addToPrepCompleted,
        addToPrepDeleted: addToPrepDeleted,
        removeFromPrepToDoList: removeFromPrepToDoList,
        removeFromPrepInProgressList: removeFromPrepInProgressList,
        removeFromPrepCompletedList: removeFromPrepCompletedList,

        reorderToDo: reorderToDo,
        addNotesToDo: addNotesToDo,
        addNotesInProgress: addNotesInProgress
    };
    return api;

    function addNotesToDo(prepListId, ticketId, newNotes) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                for(var i in doc.toDo) {
                    if (doc.toDo[i]._id == ticketId) {
                        doc.toDo[i].notes += newNotes + " - ";
                        doc.save();
                    }
                }
            });
    }
    
    function addNotesInProgress(prepListId, ticketId, newNotes) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                for(var i in doc.inProgress) {
                    if (doc.inProgress[i]._id == ticketId) {
                        doc.inProgress[i].notes += newNotes + " - ";
                        doc.save();
                    }
                }
            });
    }

    function createPrepList(prepList) {
        return Prep.create(prepList);
    }
    
    function findPrepListById(prepListId) {
        var prepList = Prep.findById(prepListId);
        prepList.deleted = [];
        return prepList;
    }
    
    function findPrepListByRestaurantId(restaurantId) {
        var prepList = Prep.findOne({restaurantId: restaurantId});
        prepList.deleted = [];
        return prepList;
    }

    function findPrepListHistoryByRestaurantId(restaurantId) {
        return Prep.findOne({restaurantId: restaurantId},
            function(err, doc) {
                if (!doc.deleted) {
                    doc.deleted = [];
                    doc.save();
                }
            });
    }
    
    function updatePrepList(prepListId, newPrepList) {
        return Prep.update(
            {_id: prepListId},
            {$set :
                {
                    type: newRecipe.type,
                    toDo: newPrepList.toDo,
                    inProgress: newPrepList.inProgress,
                    completed: newPrepList.completed
                }
            }
        )
    }
    
    function deletePrepList(prepListId) {
        return Prep.remove({_id: prepListId});
    }

    function addToPrepToDo(prepListId, ticket) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                doc.toDo.push(ticket);
                doc.save();
        });
    }

    function addToPrepInProgress(prepListId, ticket) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                ticket.timeStamp = Date.now();
                doc.inProgress.push(ticket);
                doc.save();
            })
    }

    function addToPrepCompleted(prepListId, ticket) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                ticket.completeTime = Date.now();
                doc.completed.push(ticket);
                doc.save();
            })
    }

    function addToPrepDeleted(prepListId, ticket) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                doc.deleted.push(ticket);
                doc.save();
            })
    }

    function removeFromPrepToDoList(prepListId, ticketId) {
        return Prep
            .findOne({_id: prepListId}, function (err, prepList) {

                for (var i in prepList.toDo) {
                    if (prepList.toDo[i]._id == ticketId) {
                        for (var x in prepList.toDo) {
                            if (prepList.toDo[x].order > prepList.toDo[i].order) {
                                prepList.toDo[x].order -= 1;
                            }
                        }
                        prepList.save();
                    }
                }

                for(var i in prepList.toDo) {
                    if (prepList.toDo[i]._id == ticketId) {
                        prepList.toDo.splice(i, 1);
                        prepList.save();
                    }
                }
            });
    }

    function removeFromPrepInProgressList(prepListId, ticketId) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                for(var i in doc.inProgress) {
                    if (doc.inProgress[i]._id == ticketId) {
                        doc.inProgress.splice(i, 1);
                        doc.save();
                    }
                }
            });
    }

    function removeFromPrepCompletedList(prepListId, ticketId) {
        return Prep.findOne({_id: prepListId},
            function(err, doc) {
                for(var i in doc.completed) {
                    if (doc.completed[i]._id == ticketId) {
                        doc.completed.splice(i, 1);
                        doc.save();
                    }
                }
            });
    }

    function reorderToDo(startOrder, endOrder, prepListId) {
        var start = parseInt(startOrder);
        var end = parseInt(endOrder);
        return Prep
            .findOne({_id: prepListId}, function(err, prepList) {
                prepList.toDo.forEach(function(ticket) {
                    if(start < end) {
                        if(ticket.order > start && ticket.order <= end) {
                            ticket.order--;
                            prepList.save();
                        }
                        else if(ticket.order === start) {
                            ticket.order = end;
                            prepList.save();
                        }
                    }
                    else {
                        if(ticket.order >= end && ticket.order < start) {
                            ticket.order++;
                            prepList.save();
                        }
                        else if(ticket.order === start) {
                            ticket.order = end;
                            prepList.save();
                        }
                    }
                })
            });
    }

};