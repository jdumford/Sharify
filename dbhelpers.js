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


//getLiveStreams PL/SQL execution
var getLiveStreams = function (conn, cb) {
  conn.execute(
    "begin "
     + "getPack.getLiveStreams;"
     + "end;",
    function(err) { return cb(err, conn) });
}

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
