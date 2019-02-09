const express = require('express');
const router = express.Router();

// Bring in models
let Article = require('../models/article');
let User = require('../models/user');

router.get('/add', ensureAuthenticated, function(req, res) {
    // Render index.pug from views
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add submit POST route
router.post('/add', function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        article.save(function(err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article added');
                res.redirect('/');
            }
        });
    }
});


// Update submit POST route
router.post('/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.updateOne(query, article, function(err) {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article updated');
            res.redirect('/');
        }
    });
});

router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not authorised');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Get single article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });

    });
});

router.delete('/:id', function(req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = {_id:req.params.id};

    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.deleteOne(query, function(err) {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

// Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please log in');
        res.redirect('/users/login');
    }
}

module.exports = router;