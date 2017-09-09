var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bcrypt = require("bcrypt-nodejs");


module.exports = function(app, models) {

    var employeeModel = models.employeeModel;
    var prepModel = models.prepModel;

    var googleConfig = {
        clientID     : process.env.GOOGLE_CLIENT_ID,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL  : process.env.GOOGLE_CALLBACK_URL
    };

    app.post("/api/prepper/login", passport.authenticate('prepper'), login);
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/#/user',
            failureRedirect: '/#/login'
        }));

    app.post("/api/prepper/register", register);
    app.post('/api/prepper/logout', logout);
    app.get ('/api/prepper/loggedin', loggedin);

    app.get("/api/employee", getUsers);
    app.post("/api/employee", createUser);
    app.get("/api/employee/:userId", findUserById);
    app.put("/api/employee/:userId", updateUser);
    app.delete("/api/employee/:userId", deleteUser);
    app.post("/api/employee/newRestaurantId", addRestaurantId);
    app.get("/api/employees/:restaurantId", findUsersByRestaurantId);
    app.put("/api/activate/:userId", activateUser);
    app.put("/api/deactivate/:userId", deactivateUser);


    passport.use('prepper', new LocalStrategy(localStrategy));
    passport.use(new GoogleStrategy(googleConfig, googleStrategy));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);


    function googleStrategy(token, refreshToken, profile, done) {
        employeeModel
            .findUserByGoogleId(profile.id)
            .then(
                function(user) {
                    if(user) {
                        return done(null, user);
                    } else {
                        var email = profile.emails[0].value;
                        var emailParts = email.split("@");
                        var newGoogleUser = {
                            username:  emailParts[0],
                            firstName: profile.name.givenName,
                            lastName:  profile.name.familyName,
                            email:     email,
                            google: {
                                id:    profile.id,
                                token: token
                            }
                        };
                        return employeeModel
                            .createUser(newGoogleUser);
                    }
                },
                function(err) {
                    if (err) { return done(err); }
                }
            )
            .then(
                function(user){
                    return done(null, user);
                },
                function(err){
                    if (err) { return done(err); }
                }
            );
    }


    function serializeUser(user, done) {
        done(null, user);
    }

    function deserializeUser(user, done) {
        employeeModel
            .findUserById(user._id)
            .then(
                function(user) {
                    done(null, user);
                },
                function(err) {
                    done(err, null);
                }
            );
    }

    function localStrategy(username, password, done) {
        employeeModel
            .findUserByUsername(username)
            .then(
                function(user) {
                    if(user && !user.google.id && bcrypt.compareSync(password, user.password)) {
                            return done(null, user);
                    }
                    else if (user && user.google.id) {
                        return done(null, "googleUserError");
                    }
                    else {
                        return done(null, false);
                    }
                },
                function(err) {
                    if (err) {
                        return done(err);
                    }
                }
            )
    }


    function login(req, res) {
        if (req.user == "googleUserError") {
            res.status(403).send("googleUserError");
        }
        else {
            var user = req.user;
            res.json(user);
        }
    }

    function register(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        employeeModel.findUsersByRestaurantId(req.body.restaurantId)
            .then(
                function(users) {
                    req.body.manager = users.length == 0;
                    req.body.active = req.body.manager;
                    return employeeModel
                        .findUserByUsername(username)
                },
                function(error) {
                    res.status(404).send("Error when searching for users with restaurantId: " + req.body.restaurantId);
                }
            ).then(
                function(user) {
                    if(user) {
                        res.status(400).send("Username already exists");
                    }
                    else {
                        req.body.password = bcrypt.hashSync(password);
                        return employeeModel
                            .createUser(req.body);
                    }
                },
                function(error) {
                    res.status(400).send(error);
                }
            ).then(
                function(user) {
                    req.login(user, function(err) {
                        if(err) {
                            res.status(400).send(err);
                        } else {
                            prepModel
                                .findPrepListByRestaurantId(user.restaurantId)
                                .then(
                                    function(response) {
                                        if (response == null) {
                                            var newPrepList = {
                                                restaurantId: parseInt(user.restaurantId),
                                                toDo: [],
                                                inProgress: [],
                                                completed: []
                                            };
                                            return prepModel
                                                .createPrepList(newPrepList);
                                        }
                                        else {
                                            res.json(user);
                                        }
                                    },
                                    function(error) {
                                        res.status(400).send("Error creating prepList ");
                                    }
                                ).then(
                                    function(response) {
                                        res.json(user);
                                    },
                                    function(error) {
                                        res.status(400).send("Error creating prepList");
                                    }
                                )
                        }
                    });


                },
                function(error) {
                    res.status(400).send("Unable to create new user: " + newUser.username);
                }
            )
    }

    function logout(req, res) {
        req.logout();
        res.sendStatus(200);
    }

    function loggedin(req, res) {
        if (req.isAuthenticated()) {
            res.json(req.user);
        }
        else {
            res.send('0');
        }
    }
    
    function createUser(req, res) {
        var newUser = req.body;
        employeeModel
            .findUserByUsername(newUser.username)
            .then(
                function(user) {
                    if(!user) {
                        employeeModel
                            .createUser(newUser)
                            .then(
                                function(user) {
                                    res.send(user._id);
                                    return prepModel
                                        .findPrepListByRestaurantId(newUser.restaurantId);
                                },
                                function(error) {
                                    res.status(400).send("Unable to create new user: " + newUser.username);
                                }
                            ).then(
                                function(response) {
                                    if (response == null) {
                                        var newPrepList = {
                                            restaurantId: parseInt(newUser.restaurantId),
                                            toDo: [],
                                            inProgress: [],
                                            completed: []
                                        };
                                        return prepModel
                                            .createPrepList(newPrepList);
                                    }
                                },
                                function(error) {
                                    res.status(400).send("Error creating prepList ");
                                }
                            ).then(
                                function(response) {
                                    res.sendStatus(200);
                                },
                                function(error) {
                                    res.status(400).send("Error creating prepList");
                                }
                            )
                    }
                    else {
                        res.status(400).send("Username " + newUser.username + " is already in use");
                    }
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function deleteUser(req, res) {
        var userId = req.params.userId;
        employeeModel
            .deleteUser(userId)
            .then(
                function(status) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to remove user with ID " + userId);
                }
            );
    }
    
    function updateUser(req, res) {
        var userId = req.params.userId;
        var newUser = req.body.user;
        var newPassword = req.body.newPassword;
        employeeModel
            .findUserByUsername(newUser.username)
            .then(
                function(user) {
                    if (user && !user.google.id && bcrypt.compareSync(newUser.password, user.password)) {
                        newUser.password = bcrypt.hashSync(newPassword);
                        return employeeModel
                            .updateUser(userId, newUser);
                    }
                    else {
                        res.status(404).send('Unable to find user in database with username ' + newUser.username);
                    }
                },
                function(error) {
                    res.status(404).send("Unable to find user with ID " + userId);
                }
            ).then(
                function(user) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(404).send("Unable to update user with ID " + userId);
                }
        );
    }

    function addRestaurantId(req, res) {
        var userId = req.body.userId;
        var newRestaurantId = req.body.restaurantId;

        employeeModel.findUsersByRestaurantId(newRestaurantId)
            .then(
                function(users) {
                    var managerStatus = users.length == 0;
                    return employeeModel
                        .addRestaurantId(userId, newRestaurantId, managerStatus)
                },
                function(error) {
                    res.status(404).send("Unable to update user with ID " + userId);
                }
            ).then(
                function(user) {
                    return prepModel
                        .findPrepListByRestaurantId(newRestaurantId);
                },
                function(error) {
                    res.status(404).send("Unable to update user with ID " + userId);
                }
            ).then(
                function(response) {
                    if (response == null) {
                        var newPrepList = {
                            restaurantId: parseInt(newRestaurantId),
                            toDo: [],
                            inProgress: [],
                            completed: []
                        };
                        return prepModel
                            .createPrepList(newPrepList)
                    }
                    else {
                        res.sendStatus(200);
                    }
                },
                function(error) {
                    res.status(400).send("Error creating prepList");
                }
            ).then(
                function(response) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send("Error creating prepList");
                }
        )
    }
    
    function getUsers(req, res) {
        var username = req.query['username'];
        var password = req.query['password'];
        if(username && password) {
            findUserByCredentials(username, password, req, res);
        }
        else if (username) {
            findUserByUsername(username, res);
        }
        else {
            res.status(403).send("Username and Password not Provided");
        }
    }

    function findUserByCredentials(username, password, req, res) {
        req.session.username = username;
        employeeModel
            .findUserByCredentials(username, password)
            .then(
                function(user) {
                    if(user) {
                        res.json(user);
                    }
                    else {
                        res.status(403).send("Username and Password Not Found");
                    }
                },
                function(error) {
                    res.status(403).send("Unable to login");
                }
            );
    }

    function findUserByUsername(username, res) {
        employeeModel
            .findUserByUsername(username)
            .then(
                function(user) {
                    res.json(user);
                },
                function(error) {
                    res.status(400).send("User with username " + username + " not found");
                }
            );
    }

    function findUserById(req, res) {
        var userId = req.params.userId;
        employeeModel
            .findUserById(userId)
            .then(
                function(user) {
                    res.send(user);
                },
                function(error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function findUsersByRestaurantId(req, res) {
        employeeModel
            .findUsersByRestaurantId(req.params.restaurantId)
            .then(
                function (users) {
                    res.send(users);
                },
                function (error) {
                    res.status(400).send(error);
                }
            );
    }
    
    function activateUser(req, res) {
        employeeModel
            .activateUser(req.params.userId)
            .then(
                function(response) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            )
    }

    function deactivateUser(req, res) {
        employeeModel
            .deactivateUser(req.params.userId)
            .then(
                function(response) {
                    res.sendStatus(200);
                },
                function(error) {
                    res.status(400).send(error);
                }
            )
    }
};