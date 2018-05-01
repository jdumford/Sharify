var express = require('express');
var request = require('request');
var querystring = require('querystring');

var router = express.Router();

var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('../dbconfig.js');

var client_id = '55ca26e27b504f9599192446f26b25cb';
var client_secret = '44dce2df9d474eeea72e3e52b94badff';
var redirect_uri = 'https://34.224.122.69:8888/callback/';

var stateKey = 'spotify_auth_state';
var webtoken = 'webplayer-token';
var userIDcookie = 'uid-cookie';
var dbhelper = require('../dbhelpers.js');

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
    if (!req.cookies[webtoken]){
        res.redirect('/login');
    }
    else{
	res.render('profile');
        console.log('profile');
    }

});

router.get('/stream', function(req, res){
    if (!req.cookies[webtoken]){
        res.redirect('/login');
    }
    else{
	res.render('stream');
	console.log('stream');
    }

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
	  
 function setUserCookie(id){
    res.cookie(userIDcookie, id)
  }

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
        res.cookie(webtoken, body.access_token);
        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + body.access_token},
            json: true
        };
        var userID = {id : ""}
        request.get(options, function(error, response, user_info) {
            dbhelper.ExecuteQuery(dbhelper.addUser, [user_info["id"]], res)
            var tokens = req.app.get('tokens');
            tokens[user_info['id']] = {
                'access': body.access_token,
                'refresh': body.refresh_token,
		'name': user_info["display_name"]
            }
            req.app.set('tokens', tokens)
            setUserCookie(user_info["id"])
            res.redirect('/');
        });

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

function getStream(res, t, tokens, counter, streams){
    var token_count = Object.keys(tokens).length
    var options = {
	url: 'https://api.spotify.com/v1/me/player/currently-playing',
	type: "GET",
	headers: {
	    'Accept': 'application/json',
	    'Content-Type':'application/json'
	},
	json:true
    }
    options.headers.Authorization = 'Bearer ' + tokens[t].access;
    request.get(options, function(error, response, body) {
	if (body == null) {
	}else{
	    var stream = {
		streamerID: t,
		streamerName: tokens[t].name,
		name: body.item.name,
		artist: body.item.artists[0].name,
		album: body.item.album.name,
		album_cover: body.item.album.images[0].url
	    }
	    streams.push(stream)
	}
	
	if(counter == token_count){
	    res.jsonp(streams);
	}
    });
}


//uses access tokens of streaming friends to get info about what they're playing
router.get("/friends-streaming", function (req, res) {
    var tokens = req.app.get('tokens');
    var counter = 0;
    var streams = []
    var done = false
    for(var t in tokens){
	counter += 1
	getStream(res, t, tokens, counter, streams);
    }

});

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var getQueue = function (conn, cb) {
  conn.execute(
    "begin "
    + "getPack.getQueue(:sid);"
    + "end;",
    {sid : 2},
    function(err) { return cb(err, conn) });
  }


  router.get("/getqueue", function (req, res) {
    getDatabaseResult(getQueue, res)
  });


  router.get("/addToQueue", function (req, res) {
    var query = dbhelper.addToQueue
    dbhelper.getProcResults(query, [2, req.query.id], res)
  });

  router.get("/upvoteSong", function (req, res) {
    var query = dbhelper.upVoteSong
    dbhelper.ExecuteQuery(query, [req.query.streamID,
        req.query.userID, req.query.queuesongID], res)
  });


  router.get("/downvoteSong", function (req, res) {
    var query = dbhelper.downVoteSong
    dbhelper.ExecuteQuery(query, [req.query.streamID,
        req.query.userID, req.query.queuesongID], res)
  });


  function getDatabaseResult(query, res){
    var dbResults = []
    function compileResults(result, isDone){
      if (result){
        dbResults.push(result)
      }
      else{
        return dbResults; 
      }
    }

    oracledb.createPool(dbConfig, function(err, pool) {
      if (err)
      console.error(err.message)
      else{
        doit(pool)
      }
    });


    var doit = function(pool) {
      var output = [];
      async.waterfall(
        [
          function(cb) {
            pool.getConnection(cb);
          },

          enableDbmsOutput,
          // Method 1: Fetch a line of DBMS_OUTPUT at a time
          query,
          output = fetchDbmsOutputLine,
        ],
        function (err, conn, result) {
          if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
          conn.release(function (err) { if (err) console.error(err.message); });
          res.jsonp(result)
        }
      )
      return output;
    };

    var enableDbmsOutput = function (conn, cb) {
      conn.execute(
        "begin dbms_output.enable(null); end;",
        function(err) { return cb(err, conn) });
      }


      var fetchDbmsOutputLine = function (conn, cb) {
        conn.execute(
          "begin dbms_output.get_line(:ln, :st); end;",
          { ln: { dir: oracledb.BIND_OUT, type:oracledb.STRING, maxSize: 32767 },
          st: { dir: oracledb.BIND_OUT, type:oracledb.NUMBER } },
          function(err, result) {
            if (err) {
              return cb(err, conn, null);
            }
            else if (result.outBinds.st == 1) {
              compileResults(null, false);
              return cb(null, conn, dbResults);
            }
            else {
              compileResults(result.outBinds.ln, false)
              return fetchDbmsOutputLine(conn, cb);
            }
          });
        }}


module.exports = router;

