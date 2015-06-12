var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  timestamp: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);


module.exports = User;

