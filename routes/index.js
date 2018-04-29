var express = require('express');
var request = require('request');
var querystring = require('querystring');

var router = express.Router();

var client_id = '55ca26e27b504f9599192446f26b25cb';
var client_secret = '44dce2df9d474eeea72e3e52b94badff';
var redirect_uri = 'https://34.224.122.69:8888/callback/';

var stateKey = 'spotify_auth_state';
var webtoken = 'webplayer-token';

//get request for a view named index
router.get('/', function(req, res){
        if (!req.cookies[webtoken]){
         res.redirect('/login');
        }
        else{
         res.render('index');
         console.log('home');
        }
});

router.get('/profile', function(req, res){
	res.render('profile');
	console.log('profile');
});

router.get('/stream', function(req, res){
	res.render('stream');
	console.log('stream');
});

router.get('/login', function(req, res){
	res.render('login', { title: 'Login', layout: 'loglayout' });
	console.log('login');
})

router.get('/logout', function(req, res){
        res.clearCookie(webtoken);
        res.redirect('/login');
});

router.get('/login/spotify', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-currently-playing ' +
  'user-read-playback-state user-modify-playback-state streaming user-read-birthdate';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || (storedState && state !== storedState)) {
    console.log(error);
    res.redirect('/login' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  }
  else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

        var refresh_token = body.refresh_token;

        res.cookie(webtoken, body.access_token);
        req.app.set('tokens', {'access': body.access_token,
         'refresh': body.refresh_token});

        res.redirect('/');
     }
     // invalid token
     else {
      res.redirect('/#' +
       querystring.stringify({
       error: 'invalid_token'
      }));
     }
   });
  }
});

// sample request without using cookie
router.get("/getsong", function (req, res) {
  var tokens = req.app.get('tokens');

  var options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + tokens.access}
  };

  request.get(options, function(error, response, body) {
     res.jsonp(body);
  });

});


var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = router;
