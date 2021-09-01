const express = require('express'),
    morgan = require('morgan');
const app = express();

let favMovies = [
    {
        title: 'Lord of the Rings',
        director: 'Peter Jackson'
    },
    {
        title: 'Blade Runner',
        director: 'Ridley Scott'
    },
    {
        title: 'Alien',
        director: 'Ridley Scott'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan'
    },
    {
        title: 'Parasite',
        director: 'Bong Joon-ho'
    },
    {
        title: 'Jurassic Park',
        director: 'Steven Spielberg'
    },
    {
        title: 'The Social Network',
        director: 'David Fincher'
    },
    {
        title: 'The Good, the Bad, and the Ugly',
        director: 'Sergio Leone'
    },
    {
        title: 'Jaws',
        director: 'Steven Spielberg'
    },
    {
        title: 'Rear Window',
        director: 'Alfred Hitchcock'
    },
];

app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to myFlix Movies Database!');
});

app.get('/movies', (req, res) => {
    res.json(favMovies);
});


// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});