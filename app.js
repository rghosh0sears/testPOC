// set variables for environment
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require("body-parser");
var jsonfile = require('jsonfile');
var config = require('./config');
var mongoose = require('mongoose');
// Specify a string key:
// Don't do this though, your keys should most likely be stored in env variables
// and accessed via process.env.MY_SECRET_KEY
var key = 'real secret keys should be long and random';

// Create an encryptor:
var encryptor = require('simple-encryptor')(key);
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var path = require('path');
var originalPassword = "SamplePassWord";
// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // use either jade or ejs       // instruct express to server up static assets
app.use(express.static('public'));
// Set server port
app.listen(4000);
console.log('server is running');
var datafile = 'C:/Users/rghosh0/ran/data.json';
var filePath = "config/mongoSecured.json";
jsonfile.readFile(datafile, function(err, obj) {
  var mongohosthash = encryptor.encrypt(obj.credentials.mongo.host);
  var mongousernamehash = encryptor.encrypt(obj.credentials.mongo.username);
  var mongopasswordhash = encryptor.encrypt(obj.credentials.mongo.password);
  var mongoporthash = encryptor.encrypt(obj.credentials.mongo.port);
  var mongodbnamehash = encryptor.encrypt(obj.credentials.mongo.dbname);
  var sendMongoInfo = {
    mongohosthash: mongohosthash,
    mongousernamehash: mongousernamehash,
    mongopasswordhash: mongopasswordhash,
    mongoporthash: mongoporthash,
    mongodbnamehash: mongodbnamehash
  };

  jsonfile.writeFile(filePath, sendMongoInfo, function (err) {
    if(err == null) {
      jsonfile.readFile(filePath, function(err, obj) {
        var mongohosthash = encryptor.decrypt(obj.mongohosthash);
        var mongousernamehash = encryptor.decrypt(obj.mongousernamehash);
        var mongopasswordhash = encryptor.decrypt(obj.mongopasswordhash);
        var mongoporthash = encryptor.decrypt(obj.mongoporthash);
        var mongodbnamehash = encryptor.decrypt(obj.mongodbnamehash);
        var mongoURI = "mongodb://"+mongousernamehash+":"+mongopasswordhash+"@"+mongohosthash+":"+mongoporthash+"/"+mongodbnamehash;
        console.log(mongoURI)
        mongoose.connect(
          mongoURI,
          function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log('MongoDB for Application connected');
            }
          }
        );
      });
    } else {
      console.log(err);
    }
  })
});

app.get('/', function(req, res) {
  res.render('index');
});
app.get('/signup', function(req, res) {
  res.render('signup');
});
app.post('/signupsave', function(req, res) {
  var fileName = req.body.name+".json";
  var file = 'public/tmp/'+fileName;
  var hash = bcrypt.hashSync(req.body.password);
  var sendInfo = {
    name: req.body.name,
    password: hash,
    emailid: req.body.emailid
  };
  jsonfile.writeFile(file, sendInfo, function (err) {
    if(err == null) {
      res.send('done');
    } else {
      res.send("err");
    }
  })

});

app.post('/loginValidation', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var fileName = req.body.username+".json";
  var file = 'public/tmp/'+fileName;
  jsonfile.readFile(file, function(err, obj) {
    var passStored = obj.password;
    var comparedPassword = bcrypt.compareSync(password, passStored);
    if(comparedPassword == true) {
      res.send("validate");
    } else {
      res.send("invalid");
    }
  })
});



app.get('/passwordEncrypt/:password', function(req, res) {
  var password = req.params.password;
  var comparedPassword = bcrypt.compareSync(password, hash);
  if(comparedPassword) {
    res.render('passsuccess');
  } else {
    res.render('passfailure');
  }
});
