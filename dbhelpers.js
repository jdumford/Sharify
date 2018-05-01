//DB stuff
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

//this is actually what can be moved around and copied
oracledb.createPool(
  dbConfig,
  function(err, pool) {
    if (err)
      console.error(err.message)
    else
      getAllStreams(pool);
  });


//function to make asynchronous calls to get livestreams
var getAllStreams = function(pool) {
  async.waterfall(
    [
      function(cb) {
        pool.getConnection(cb);
      },
      // Tell the DB to buffer DBMS_OUTPUT
      enableDbmsOutput,
      // Method 1: Fetch a line of DBMS_OUTPUT at a time
      getLiveStreams,
      fetchDbmsOutputLine,
    ],
    function (err, conn) {
      if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
      conn.release(function (err) { if (err) console.error(err.message); });
    }
  )
};


//Helper "SET SERVEROUTPUT ON"
var enableDbmsOutput = function (conn, cb) {
  conn.execute(
    "begin dbms_output.enable(null); end;",
    function(err) { return cb(err, conn) });
}
//Helper function to get multiple returns from PL/SQL procedures (prints to console)
var fetchDbmsOutputLine = function (conn, cb) {
  conn.execute(
    "begin dbms_output.get_line(:ln, :st); end;",
    { ln: { dir: oracledb.BIND_OUT, type:oracledb.STRING, maxSize: 32767 },
      st: { dir: oracledb.BIND_OUT, type:oracledb.NUMBER } },
    function(err, result) {
      if (err) {
        return cb(err, conn);
      } else if (result.outBinds.st == 1) {
        return cb(null, conn);  // no more output
      } else {
        console.log(result.outBinds.ln);
        return fetchDbmsOutputLine(conn, cb);
      }
    });
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
   	console.log(result.outBinds);
        doRelease(connection);
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
