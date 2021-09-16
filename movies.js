const Models = require('./models'),
    passport = require('passport');

const Movies = Models.Movie;

// GET requests
module.exports = (app) => {
    //get all movies- returns as json
    app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    //get one movie by title- returns as json
    app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
        Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    //get genre description- returns String
    app.get('/movies/Genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
        Movies.find({ 'Genre.Name': req.params.Name })
            .then((movie) => {
                res.json(movie[0].Genre.Description);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
    //get all director info- returns json
    app.get('/movies/Directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
        Movies.find({ 'Director.Name': req.params.Name })
            .then((movie) => {
                res.json(movie[0].Director);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });
}






