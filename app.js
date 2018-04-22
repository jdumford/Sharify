var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var path = require('path');
var querystring = require('querystring');
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

var client_id = '55ca26e27b504f9599192446f26b25cb';
var client_secret = '44dce2df9d474eeea72e3e52b94badff'; 
var redirect_uri = 'https://34.224.122.69:443/callback/'; 


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

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





// app.get('/refresh_token', function(req, res) {
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });






//https.createServer(options, app).listen(443);
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
  console.log('Server started on port ' + app.get('port'));
});

