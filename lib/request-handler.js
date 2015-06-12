var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    if(err) return console.log(err);
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({url: uri}, function(err, foundLink) {
    if (foundLink) {
      console.log(foundLink);
      res.send(200, foundLink.url); // may need to change to urlBase
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        link.shortenURL();
        link.save(function(err, newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    console.log("user: ", user);
    if(!user) {
      console.log('User not found');
      res.redirect('/login');
    }
    else {
      console.log('made it into "found user"');
      console.log('The user password in login is: ', user.password);
      user.comparePassword(password, function(err, match) {
        if(match) {
          console.log('Password matches!');
          util.createSession(req, res, user);
        }
        else {
          console.log('Password was incorrect');
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err,user) {
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err, savedUser) {
        console.log(savedUser);
        util.createSession(req, res, savedUser);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  console.log('entered navToLink');
  console.log(req.params);
  Link.findOne( {code: req.params[0]}, function(err, link) {
    console.log("the link is " + link);
    console.log("looking for code", req.params[0]);
    if (!link) {
      console.log("link not found, redirecting to home");
      res.redirect('/');
    } else {
      console.log("link found, increment", link.url);
      link.visits++;
      link.save(function(err, savedLink) {
        if(err) {
          return console.log(err);
        }
        res.redirect(link.url);
      });
    }
  });
};
