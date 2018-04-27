var express = require('express'); // Express web server framework 
var request = require('request');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var http = require('http');
var https = require('https');
var fs = require('fs');

var routes = require('./routes/index');

var options = {
key: fs.readFileSync('keys/key.pem'),
cert: fs.readFileSync('keys/key-cert.pem') };

var app = express();

//JD adding from Node.js Login tutorial
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname,  'public')));

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.get("/getsong", function (req, res) {
  var options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + 'access_code' }
  };
  request.get(options, function(error, response, body) {
    res.status(200).jsonp(body);
  });

});

https.createServer(options, app).listen(443);

// the following doesn't seem compatible with  the login callback
//app.set('port', (process.env.PORT || 3000));
//app.listen(app.get('port'), function(){
//  console.log('Server started on port ' + app.get('port'));
//});

