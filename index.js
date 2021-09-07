const express = require('express'),
    morgan = require('morgan');
const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

// GET requests

app.get('/movies', (req, res) => {
    res.json('returns all movies');
});

app.get('/movies/:title', (req, res) => {
    res.json('returns of movie with given title');
});

app.get('/genres/:title', (req, res) => {
    res.send('Returns description of movie genre');
});

app.get('/directors/:name', (req, res) => {
    res.send('Returns data about a director');
});

app.post('/users', (req, res) => {
    res.send('New user has been created');
});

app.put('/users/:username', (req, res) => {
    res.send('Updates username of the user');
});

app.post('/users/:id/favorites/:title', (req, res) => {
    res.send('Movie has been added to favorites');
});

app.delete('/users/:id/favorites/:title', (req, res) => {
    res.send('Movie has been removed to favorites');
});

app.delete('/users/:id', (req, res) => {
    res.send('Email has been deregistered')
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});