var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , flash = require('connect-flash')
  , config = require('./config.json')
  , fs = require("fs")
  , path = require('path')
  , GitHubStrategy = require('passport-github').Strategy;

var Canvas = require("canvas")
  , Image = Canvas.Image;


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
  if (req.user) {
    var img = req.files.img;
    if (img && img.type.indexOf("image/") != -1) {
      image = new Image;
      image.src = img.path;
      var canvas = new Canvas(200,200)
        , context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, 200, 200);
      canvas.toBuffer(function(err, buf){
        fs.writeFile(path.join(app.get('updir'),req.user.username+"-"+img.name.replace(/\.\./g,'')), buf, function(){
          console.log('Resized and saved');
        });
      });
    } else {
      req.flash('error',err);
    }
  }
  res.redirect('/');
});

app.get('/del/:img', function(req, res){
  if (req.user) {
    sane = req.params.img.replace(/\.\./g,'');
    fs.unlink(path.join(app.get('updir'),sane),function() {
      console.log("erased "+sane);
    });
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
