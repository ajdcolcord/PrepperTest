module.exports = function() {

    var mongoose = require("mongoose");

    var TimerSchema = require("./timer.schema.server")();
    var Timer = mongoose.model("Timer", TimerSchema);

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
        return Timer.create(timer);
    }
    
    function findTimerById(timerId) {
        return Timer.findById(timerId);
    }
    
    function findTimersByUserId(userId) {
        return Timer.find({_user: userId});
    }
    
    function updateTimer(timerId, newTimer) {
        return Timer.update(
            {_id: timerId},
            {$set :
                {
                    timeStart: newTimer.timeStart
                }
            }
        )
    }
    
    function deleteTimer(timerId) {
        return Timer.remove({_id: timerId});
    }
    
    function findTimersByRestaurantId(restaurantId) {
        return Timer.find({restaurantId: restaurantId});
    }
};