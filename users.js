const Models = require('./models'),
    passport = require('passport');

require('./auth')
require('./passport');

const { check, validationResult } = require('express-validator');

const Users = Models.User;

module.exports = (app) => {
    //get all users- returns json
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
    //get specific user
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
    //create new user - returns string confirmation
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
    //update user info- returns json of updated user
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
    //add movie to favorites - returns string confirmation
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
                    res.status(200).send(req.params._id);
                }
            });
    });
    //remove movie from favorites - returns string confirmation
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
                    res.status(200).send(req.params._id);
                }
            });
    });
    //deletes a user - returns string confirmation
    app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(req.params.Username + ' was not found');
                } else {
                    res.status(200).send(req.params.Username + ' was deleted.');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    })
}
