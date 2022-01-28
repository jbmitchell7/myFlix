const Models = require('./models'),
    passport = require('passport');

require('./auth')
require('./passport');

const { check, validationResult } = require('express-validator');

const Users = Models.User;
// const Movies = Models.Movie;

module.exports = (app) => {
    /**
     * gets all user objects
     * @method getUsers
     * @requires authentication JWT
     * @returns {array} - returns array of user objects
     */
    app.get('/users', (req, res) => {
        Users.find()
            .then(users => {
                res.status(201).json(users);
            })
            .catch(error => {
                console.error(error);
                res.status(500).send(`Error: ${error}`);
            });
    });

    /**
     * gets individual user object
     * @method getUser
     * @requires authentication JWT
     * @param {string} - string of username
     * @returns {object} - returns user object
     */
    app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOne({ Username: req.params.Username })
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

    /**
     * gets array of user's favorite movies
     * @method getFavorites
     * @requires authentication JWT
     * @param {string} - username
     * @returns {array} - array of favorite movie objects
     */
    app.get('/users/:Username/FavoriteMovies', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOne({ Username: req.params.Username })
            .then((user) => {
                let userFavs = user.FavoriteMovies;
                Movies.find({
                    '_id': { $in: userFavs}
                }).then((favs) => {
                    res.json(favs);
                }).catch((err) => {
                    res.status(500).send('Error' + err);
                })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

    /**
     * creates a new user in the database
     * @method postUser
     * @param {object} - object of user data - username, password, email are required
     * @returns {string} - string confirmation of user creation
     */
    app.post('/users', [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Password', 'Password is required').isLength({ min: 8 }),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + ' already exists');
                }

                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                    .then(() => { res.status(201).send(req.body.Username + ' has been created.') })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })

            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

    /**
     * updates user data
     * @method putUser
     * @param {object} - object of user data - username, password, email are required
     * @returns {object} - updated user object
     */
    app.put('/users/:Username', [
        check('Username', 'Username is required').isLength({ min: 5 }),
        //check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Password', 'Password is required').isLength({ min: 8 }),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], passport.authenticate('jwt', { session: false }), (req, res) => {

        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $set:
            {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
            { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.status(200).send(updatedUser);
                }
            });
    });

    /**
     * adds movie to user's favorites
     * @method postFavorite
     * @param {string} - username
     * @param {string} - movie id
     * @returns {json} - returns json response of success/failure
     */
    app.post('/users/:Username/movies/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $addToSet: { FavoriteMovies: req.params._id }
        },
            { new: true },
            (response) => {
                if (response) {
                    console.error(response);
                    res.status(500).send('Error: ' + response);
                } else {
                    res.status(200).send(response);
                }
            });
    });

    /**
     * removes movie from user's favorites
     * @method deleteFavorite
     * @param {string} - username
     * @param {string} - movie id
     * @returns {json} - returns json response of success/failure
     */
    app.delete('/users/:Username/movies/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $pull: { FavoriteMovies: req.params._id }
        },
            { new: true }, // This line makes sure that the updated document is returned
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.status(200).send(err);
                }
            });
    });

    /**
     * deletes a user
     * @method deleteUser
     * @param {string} - username
     * @returns {json} - returns json response of success/failure
     */
    app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(req.params.Username + ' was not found');
                } else {
                    res.status(200).send(user);
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    })
}
