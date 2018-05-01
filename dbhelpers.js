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
      async.waterfall(
        [
          function(cb) {
            pool.getConnection(cb);
          },
          enableDbmsOutput,
          query(params),
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
    function getResults(result){
        return cb(null, conn, result);
    }
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
          getResult(query(params))
        ],
        function (err, conn, result) {
          if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
          conn.release(function (err) { if (err) console.error(err.message); });
          res.jsonp(result)
        }
      )
    };

}

function ExecuteQuery(query, params, res){
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
          query(params)
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
var getUserPrivacy = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getUserPrivacy(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}


//getStreamHostID
var getStreamHostID = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamHostID(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getStreamDescription
var getStreamDescription = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 72 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamDescription(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getStreamUAccess
var getStreamUAccess = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 16 }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamUAccess(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getStreamLiveCount
var getStreamLiveCount = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getStreamLiveCount(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getFollowersCount
var getFollowersCount = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getFollowersCount(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getFolloweesCount
var getFolloweesCount = function (conn, cb, id) {
   var bindvars = {
      p1:  uid,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := getPack.getFolloweesCount(:p1);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        doRelease(connection);
   	return result.outBinds;
      });
}

//getAllFollowers
var getAllFollowers = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "getPack.getAllFollowers(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getAllFollowees
var getAllFollowers = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "getPack.getAllFollowees(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}


//getLiveStreams PL/SQL execution (gets All live streams)
var getLiveStreams = function (conn, cb) {
  conn.execute(
    "begin "
     + "getPack.getLiveStreams;"
     + "end;",
    function(err) { return cb(err, conn) });
}

//getFollowedStreams
var getFollowedStreams = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "getPack.getFollowedStreams(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getGlobalStreams
var getGlobalStreams = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "getPack.getGlobalStreams(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getQueue
var getQueue = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid
   };
  conn.execute(
    "begin "
     + "getPack.getQueue(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getHistory
var getHistory = function (conn, cb, stid) {
   var bindvars = {
      p1:  stid
   };
  conn.execute(
    "begin "
     + "getPack.getHistory(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//getPlaylistSongs
var getPlaylistSongs = function (conn, cb, pid) {
   var bindvars = {
      p1:  pid
   };
  conn.execute(
    "begin "
     + "getPack.getPlaylistSongs(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

/*	SET Functions	*/

//startCollabStream
var startCollabStream = function (conn, cb, uid, dsc) {
   var bindvars = {
      p1:  uid,
      p2: dsc,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := setPack.startCollabStream(:p1, :p2);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
   	console.log(result.outBinds);
        doRelease(connection);
      });
}


//startPubStream
var startPubStream = function (conn, cb, uid, dsc) {
   var bindvars = {
      p1:  uid,
      p2: dsc,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := setPack.startPubStream(:p1, :p2);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
   	console.log(result.outBinds);
        doRelease(connection);
      });
}

//startPrivStream
var startPrivStream = function (conn, cb, uid, dsc) {
   var bindvars = {
      p1:  uid,
      p2: dsc,
      ret:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
   };
   conn.execute(
    "begin "
     + ":ret := setPack.startPrivStream(:p1, :p2);"
     + "end;",
   bindvars,
   function (err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
   	console.log(result.outBinds);
        doRelease(connection);
      });
}


//addtoQueue
var addtoQueue = function (conn, cb, stid, sid) {
   var bindvars = {
      p1:  stid,
      p2: sid
   };
  conn.execute(
    "begin "
     + "setPack.addtoQueue(:p1, :p2);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//addUser
var addUser = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "setPack.addUser(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//setPrivate
var add = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "setPack.setPrivate(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}

//addUser
var addUser = function (conn, cb, uid) {
   var bindvars = {
      p1:  uid
   };
  conn.execute(
    "begin "
     + "setPack.addUser(:p1);"
     + "end;",
   bindvars,
    function(err) { return cb(err, conn) });
}
