require('dotenv').config();
const express = require('express');
const cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
const dns = require('dns');
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number  
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
  var original_url = req.body.url;
  if (original_url.search(/http(s|):\/\//i) == -1) {
    res.json({error: 'invalid url'});
  }
  console.log(original_url.replace(/http(s|):\/\//i, '').replace(/\/\S*/, ''));
  dns.lookup(original_url.replace(/http(s|):\/\//i, '').replace(/\/\S*/, '') , function(err, data) {
    if (err) {
      res.json({error: 'invalid url'});
      return console.log(err);
    }
    URL.findOne({original_url: original_url}, function(err, data){
      if (err) return console.log(err);
      if (data) {
        res.json({original_url: data.original_url, short_url: data.short_url});
        done(null, data);
      } else {
        URL.find({}, function(err, URLS){
           if (err) return console.log(err);
           var short_url = URLS.length + 1;
           var url = new URL({short_url: short_url, original_url: original_url});
           url.save(function(err, data) {
             if (err) return console.log(err);
             res.json({original_url: original_url, short_url: short_url});
             done(null, data);
           });
        });
      }
    });
     
  });
});

app.get('/api/shorturl/:short_url', function(req, res, done) {
  URL.findOne({short_url: req.params.short_url}, function(err, data) {
    if(err) return console.log(err);
    if(data){
      res.redirect(data.original_url);
    } else {
      res.json({error: "No short URL found for the given input"});
    }
    done(err, data);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
