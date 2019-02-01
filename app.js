const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb', { useNewUrlParser: true });
let db = mongoose.connection;

// Check connection
db.once('open', function() {
    console.log('Connected to MongoDB');
})

// Check for db errors
db.on('error', function(err) {
    console.log(err);
});

const app = express();

// Bring in models
let Article = require('./models/article');

// Body Parser Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Home route
app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            // Render index.pug from views
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
        
    });
});

app.get('/articles/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        // Render index.pug from views
        res.render('article', {
            article: article
        });
    });
});

app.get('/articles/add', function(req, res) {
    // Render index.pug from views
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add submit POST route
app.post('/articles/add', function(req, res) {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err) {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }
    });
});

// Creates a server to display our page
app.listen(3000, function() {
    console.log('Server started on port 3000...');
});