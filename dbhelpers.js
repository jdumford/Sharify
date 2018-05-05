//DB stuff
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

function getProcResults(query, params, res){
    var dbResults = []
    function compileResults(result){
      if (result){
        dbResults.push(result)
      } else {
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
      dbResults = []
      async.waterfall(
        [
          function(cb) {
            pool.getConnection(cb);
          },
          enableDbmsOutput,
          async.apply(query, params),
          fetchDbmsOutputLine,
        ],
        function (err, conn, result) {
          if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
          conn.release(function (err) { if (err) console.error(err.message); });
          res.jsonp(result)
        }
      )
    };

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
              compileResults(null);
              return cb(null, conn, dbResults);
            }
            else {
              compileResults(result.outBinds.ln)
              return fetchDbmsOutputLine(conn, cb);
            }
          });
        }
}

function getFuncResult(query,params, res){
    oracledb.createPool(dbConfig, function(err, pool) {
      if (err)
      console.error(err.message)
      else{
        doit(pool)
      }
    });

    var doit = function(pool) {
      async.waterfall(
        [
          function(cb) {
            pool.getConnection(cb);
          },
          async.apply(query, params)
        ],
        function (err, conn, result) {
          if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
          conn.release(function (err) { if (err) console.error(err.message); });
          res.jsonp(result)
        }
      )
    };

}

function ExecuteQuery(query, params){
    oracledb.createPool(dbConfig, function(err, pool) {
      if (err)
      console.error(err.message)
      else{
        doit(pool)
      }
    });

    var doit = function(pool) {
      async.waterfall(
        [
          function(cb) {
            pool.getConnection(cb);
          },
          async.apply(query, params),
        ]
      )
    };
}



//Helper "SET SERVEROUTPUT ON"
var enableDbmsOutput = function (conn, cb) {
  conn.execute(
    "begin dbms_output.enable(null); end;",
    function(err) { return cb(err, conn) });
}

function doRelease(connection) {
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}

//getUserPrivacy PL/SQL execution
var getUserPrivacy = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getUserPrivacy(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}


//getStreamHostID
var getStreamHostID = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamHostID(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getStreamDescription
var getStreamDescription = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 72 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamDescription(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getStreamUAccess
var getStreamUAccess = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 16 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamUAccess(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getStreamLiveCount
var getStreamLiveCount = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamLiveCount(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getFollowersCount
var getFollowersCount = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getFollowersCount(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getFolloweesCount
var getFolloweesCount = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getFolloweesCount(:p1);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}

//getAllFollowers
var getAllFollowers = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getAllFollowers(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getAllFollowees
var getAllFollowers = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getAllFollowees(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}


//getLiveStreams PL/SQL execution (gets All live streams)
var getLiveStreams = function (p, conn, cb) {
  conn.execute(
    "begin "
     + "getPack.getLiveStreams;"
     + "end;",
    function(err) { return cb(err, conn) });
}

//getFollowedStreams
var getFollowedStreams = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getFollowedStreams(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getGlobalStreams
var getGlobalStreams = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getGlobalStreams(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getQueue
var getQueue = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getQueue(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getHistory
var getHistory = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getHistory(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getPlaylistSongs
var getPlaylistSongs = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "getPack.getPlaylistSongs(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

/*	SET Functions	*/

//startStream
var startStream = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1],
      p3: p[2],
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := setPack.startStream(:p1, :p2, :p3);"
     + "end;",
   bindvars,
   function(err) { return cb(err, conn) });
}


//addtoQueue
var addtoQueue = function (p, conn, cb) {
   var bindvars = {
      p1: p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.addtoQueue(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//addUser
var addUser = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "setPack.addUser(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//setPrivate
var setPrivate = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "setPack.setPrivate(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//setPublic
var setPublic = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "setPack.setPublic(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//followUser
var followUser = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.followUser(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//unfollowUser
var unfollowUser = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.unfollowUser(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//acceptFollow
var acceptFollow = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.accpetFollow(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}


//declineFollow
var declineFollow = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.declineFollow(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//endStream
var endStream = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0]
   };
  conn.execute(
    "begin "
     + "setPack.endStream(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//upVoteSong
var upVoteSong = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1],
      p3: p[2]
   };
  conn.execute(
    "begin "
     + "setPack.upVoteSong(:p1, :p2, :p3);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//downVoteSong
var downVoteSong = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1],
      p3: p[2]
   };
  conn.execute(
    "begin "
     + "setPack.downVoteSong(:p1, :p2, :p3);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//playedSong
var playedSong = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.playedSong(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//joinStream
var joinStream = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.joinStream(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//joinStream
var leaveStream = function (p, conn, cb) {
   var bindvars = {
      p1:  p[0],
      p2: p[1]
   };
  conn.execute(
    "begin "
     + "setPack.leaveStream(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}



module.exports = {
	getFuncResult : getFuncResult,
	getProcResults : getProcResults,
	ExecuteQuery : ExecuteQuery,
	getUserPrivacy : getUserPrivacy,
	getStreamHostID : getStreamHostID,
	getStreamDescription : getStreamDescription,
	getStreamUAccess : getStreamUAccess,
	getStreamLiveCount : getStreamLiveCount,
	getFollowersCount : getFollowersCount,
	getFolloweesCount : getFolloweesCount,
	getAllFollowers : getAllFollowers,
	getAllFollowers : getAllFollowers,
	getLiveStreams : getLiveStreams,
	getFollowedStreams : getFollowedStreams,
	getGlobalStreams : getGlobalStreams,
	getQueue : getQueue,
	getHistory : getHistory,
	getPlaylistSongs : getPlaylistSongs,
	startStream : startStream,
	addtoQueue : addtoQueue,
	addUser : addUser,
	setPrivate : setPrivate,
	setPublic : setPublic,
	followUser : followUser,
	unfollowUser : unfollowUser,
	acceptFollow : acceptFollow,
	declineFollow : declineFollow,
	endStream : endStream,
	upVoteSong : upVoteSong,
	downVoteSong : downVoteSong,
	playedSong : playedSong,
	joinStream : joinStream,
	leaveStream : leaveStream
}
