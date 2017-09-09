module.exports = function(app, models) {

    var timerModel = models.timerModel;

    app.post("/api/timer/", createTimer);
    app.get("/api/timer/:timerId", findTimerById);
    app.get("/api/user/:userId/timer", findTimersByUserId);
    app.put("/api/timer/:timerId", updateTimer);
    app.delete("/api/timer/:timerId", deleteTimer);
    app.get("/api/:restaurantId/timers/", findTimersByRestaurantId);


    function createTimer(req, res) {
        var newTimer = req.body;

        timerModel
            .createTimer(newTimer)
            .then(
                function(timer) {
                    var timerId = timer._id;
                    res.status(200).send(timerId);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function findTimerById(req, res) {
        var timerId = req.body;

        timerModel
            .findTimerById(timerId)
            .then(
                function(timer) {
                    res.json(timer);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
    
    function findTimersByUserId(req, res) {
        var userId = req.params.userId;

        timerModel
            .findTimersByUserId(userId)
            .then(
                function(timers) {
                    res.json(timers);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }

    function updateTimer(req, res) {
        var timerId = req.params.timerId;
        var newTime = req.body;

        timerModel
            .updateTimer(timerId, timer)
            .then(
                function(timer) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update timer with ID " + timerId);
                }
            );
    }
    
    function deleteTimer(req, res) {
        var timerId = req.params.timerId;

        timerModel
            .deleteTimer(timerId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to delete timer with ID " + timerId);
                }
            );
    }
    
    function findTimersByRestaurantId(req, res) {
        var restaurantId = req.params.restaurantId;
        timerModel
            .findTimersByRestaurantId(restaurantId)
            .then(
                function(timers) {
                    res.json(timers);
                },
                function(error) {
                    res.status(404).send(error);
                }
            );
    }
};