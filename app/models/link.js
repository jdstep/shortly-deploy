var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkSchema = new Schema({
  url:  String,
  base_url: String,
  code:   String,
  title: String,
  visits: {type: Number, default: 0},
  timestamp: { type: Date, default: Date.now }
});

linkSchema.methods.shortenURL = function() {
  var shasum = crypto.createHash('sha1');
  console.log('shortening URL: ', this);
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  console.log('New code: ', this.code);
};

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;
