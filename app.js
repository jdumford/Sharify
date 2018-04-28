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

// Get a non-pooled connection
oracledb.getConnection(
  {
    user          : dbConfig.user,
    password      : dbConfig.password,
    connectString : dbConfig.connectString
  },
  function(err, connection) {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      // The statement to execute
        `SELECT * from customer`,

      // The callback function handles the SQL execution results
      function(err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        console.log(result.metaData);
        console.log(result.rows);
        doRelease(connection);
      });
  });

// Note: connections should always be released when not needed
function doRelease(connection) {
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}

https.createServer(options, app).listen(8888);
