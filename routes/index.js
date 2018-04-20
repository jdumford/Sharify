var express = require('express');
var router = express.Router();

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

module.exports = router;