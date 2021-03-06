const Models = require('./models'),
    passport = require('passport');

const Movies = Models.Movie;

module.exports = (app) => {
    /**
     * gets all movies
     * @method getMovies
     * @returns {array} - array of all movie objects
     */
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

    /**
     * gets individual movies
     * @method getMovie
     * @param {string} - movie title
     * @returns {object} - returns movie object
     */
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

    /**
     * gets genre details
     * @method getGenre
     * @param {string} - genre name
     * @returns {string} - genre description
     */
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

    /**
     * gets director details
     * @method getDirector
     * @param {string} - director name
     * @returns {object} - director object
     */
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






