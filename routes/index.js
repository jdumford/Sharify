var express = require('express');
var request = require('request');
var querystring = require('querystring');


var router = express.Router();

var client_id = '55ca26e27b504f9599192446f26b25cb';
var client_secret = '44dce2df9d474eeea72e3e52b94badff'; 
var redirect_uri = 'https://34.224.122.69:443/callback/'; 
var stateKey = 'spotify_auth_state';

//get request for a view named index
router.get('/', function(req, res){
	res.render('index');
	console.log('home')
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
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  //previously if (state === null || state !== storedState))
  // changed this from the example provided by spotify. the first time someone tried to login, there was
  // no cookie for the spotify_auth_state key, and user got an error screen even though authentication with spotify worked
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

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        // use the access token to access the Spotify Web API
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        request.get(options, function(error, response, body) {
          console.log("successful /me call");
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
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


function ensureAuth(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

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

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports = router;
