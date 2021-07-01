require('dotenv').config();
const express = require('express');
const cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlSchema = new mongoose.Schema({
  shortUrl: Number,
  longUrl: String
});

var URL = mongoose.model('URL', urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res, done) {
  var longUrl = req.body.url;
  dns.lookup(longUrl, function(err, data) {
    if (err) {
      res.json({error: err});
      return console.log(err);
    }
    URL.find({}, function(err, URLS){
       if (err) return console.log(err);
       var shortUrl = URLS.length + 1;
       var url = new URL({shortURL: shortUrl, longUrl: longUrl});
       url.save(function(err, data) {
         if (err) return console.log(err);
         res.json({original_url: longUrl, short_url: shortUrl});
         done(err, data);
      });
    }); 
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
