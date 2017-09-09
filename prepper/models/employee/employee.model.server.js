module.exports = function() {

    var mongoose = require("mongoose");

    var EmployeeSchema = require("./employee.schema.server")();
    var Employee = mongoose.model("Employee", EmployeeSchema);

    var api = {
        createUser: createUser,
        findUserById: findUserById,
        findUserByCredentials: findUserByCredentials,
        findUserByUsername: findUserByUsername,
        updateUser: updateUser,
        deleteUser: deleteUser,
        addTimerIdToUser: addTimerIdToUser,
        removeTimerIdFromUser: removeTimerIdFromUser,
        findUserByGoogleId: findUserByGoogleId,
        addRestaurantId: addRestaurantId,
        findUsersByRestaurantId: findUsersByRestaurantId,
        activateUser: activateUser,
        deactivateUser: deactivateUser
    };
    return api;

    function addTimerIdToUser(timerId, userId) {
        return Employee.findOne({_id: userId},
            function(err, doc) {
                doc.timers.push(timerId);
                doc.save();
        });
    }
    
    function removeTimerIdFromUser(timerId, userId) {
        return Employee.findOne({_id: userId},
            function(err, doc) {
                doc.timers.pull(timerId);
                doc.save();
            });
    }
    
    function createUser(user) {
        return Employee.create(user);
    }
    
    function findUserById(userId) {
        return Employee.findById(userId);
    }
    
    function findUserByCredentials(username, password) {
        return Employee.findOne({username: username, password: password});
    }
    
    function findUserByUsername(username) {
        return Employee.findOne({username: username});
    }
    
    function updateUser(userId, newUser) {
        return Employee.update(
            {_id: userId},
            {$set :
                {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    password: newUser.password
                }
            }
        )
    }

    function addRestaurantId(userId, newRestaurantId, managerStatus) {
        return Employee.update(
            {_id: userId},
            {$set :
                {
                    restaurantId: newRestaurantId,
                    manager: managerStatus,
                    active: managerStatus
                }
            }
        )
    }

    function deleteUser(userId) {
        return Employee.remove({_id: userId});
    }

    function findUserByGoogleId(googleId) {
        return Employee.findOne({'google.id': googleId});
    }
    
    function findUsersByRestaurantId(restaurantId) {
        return Employee.find({restaurantId: restaurantId});
    }

    function activateUser(userId) {
        return Employee.update(
            {_id: userId},
            {$set :
                {
                    active: true
                }
            }
        )
    }

    function deactivateUser(userId) {
        return Employee.update(
            {_id: userId},
            {$set :
                {
                    active: false
                }
            }
        )
    }
};