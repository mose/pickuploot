
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , flash = require('connect-flash')
  , config = require('./config.json')
  , stylus = require("stylus")
  , nib = require("nib")
  , path = require('path');

var app = express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('title', 'Pickuploot');
  app.use(express.favicon());
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(stylus.middleware(
    { src: __dirname + '/public'
    , compile: compile
    }
  ));

});

app.configure('development', function(){
  app.set('title', 'Pickuploot (dev)');
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index.jade', {
    title: 'Home',
    message: req.flash('info'),
    error: req.flash('error')
  });
});

app.post('/', function(req, res){
  res.redirect('/');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: 'Invalid username or password.',
    successFlash: 'Welcome!'
  })
);

app.get('/logout', function(req, res) {
  delete req.session.username;
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
