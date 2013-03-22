
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
  , fs = require("fs")
  , path = require('path')
  , GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(config.auth.github,
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var app = express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

app.configure(function(){
  app.set('port', process.env["app_port"] || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('title', 'Pickuploot');
  app.set('updir',path.join(__dirname, 'public','up'));
  app.use(express.favicon());
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session());
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
  app.use(passport.initialize());
  app.use(passport.session());

});

app.configure('development', function(){
  app.set('title', 'Pickuploot (dev)');
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  fs.readdir(app.get('updir'), function (err, files) {
    if (err) {
      req.flash('error',err);
    }
    console.log(req.user);
    res.render('index.jade', {
      title: app.get('title'),
      message: req.flash('info'),
      error: req.flash('error'),
      files: files,
      user: req.user
    });

  });
});

app.post('/', function(req, res){
  var img = req.files.img;
  if (img && img.type.indexOf("image/") != -1) {
    fs.rename(img.path, path.join(app.get('updir'),img.name), function (err) {
      req.flash('message',"Image uploaded.");
    });
  } else {
    req.flash('error',err);
  }
  res.redirect('/');
});

app.get('/auth/github',
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: 'Invalid username or password.',
    successFlash: 'Welcome!'
  })
);
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
