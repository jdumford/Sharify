var express = require('express'); // Express web server framework
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var http = require('http');
var https = require('https');
var fs = require('fs');

//DB stuff
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

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

/* Database joining work - Luigi*/

oracledb.createPool(
  dbConfig,
  function(err, pool) {
    if (err)
      console.error(err.message)
    else
      doit(pool);
  });
var doit = function(pool) {
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
var enableDbmsOutput = function (conn, cb) {
  conn.execute(
    "begin dbms_output.enable(null); end;",
    function(err) { return cb(err, conn) });
}
var getLiveStreams = function (conn, cb) {
  conn.execute(
    "begin "
     + "getPack.getLiveStreams;"
     + "end;",
    function(err) { return cb(err, conn) });
}
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

https.createServer(options, app).listen(8888);
