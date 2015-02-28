var http = require('http'),
	express = require('express'),
	app = express(),
	qs = require('querystring'),
	OAuth = require('oauth').OAuth,
	bodyParser = require('body-parser'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	util = require('util'),
	fitbitClient = require('./fitbitClient.js');

var sess = {
	secret: 'keyboard cat',
	cookie: {}},
	userId;

app.use(bodyParser.json());
app.use(session(sess));
app.use(cookieParser());

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// Fitbit initialization
fitbitClient.init(
	process.env.FITBIT_CONSUMER_KEY, 
	process.env.FITBIT_CONSUMER_SECRET,
	process.env.FITBIT_CALLBACK_URL);

// Routes
app.get('/', function(request, response) {
	fitbitClient.getRequestToken(function (error, oauth_token, oauth_token_secret, results) {
		if (error) {
			console.log('error' + error);
		} else {
			request.session.oauth_token = oauth_token;
			request.session.oauth_token_secret = oauth_token_secret;
			response.redirect(fitbitClient.getAuthorizeURL(oauth_token));
		}
	});
});


app.get('/authorizationcompleted', function (request, response) {
	fitbitClient.getAccessToken(request.session.oauth_token, request.session.oauth_token_secret, request.param('oauth_verifier'), 
		function (error, oauth_access_token, oauth_access_token_secret, results) {
			if (error) {
				console.log('error ' + error);
			} else {
				request.session.oauth_access_token = oauth_access_token;
				request.session.oauth_access_token_secret = oauth_access_token_secret;

				fitbitClient.setToken(oauth_access_token);
				fitbitClient.setTokenSecret(oauth_access_token_secret);

				userId = results.encoded_user_id;

				fitbitClient.requestResource('/profile.json', 'GET', oauth_access_token, oauth_access_token_secret, results.encoded_user_id,
					function (error, data, result) {
						var feed = JSON.parse(data);
						response.send(feed);
					}
				);
			}
		}
	);
});


app.get('/getWeight', function (request, response) {
	fitbitClient.requestResource(
		'/body/log/weight/date/2015-03-01/30d.json', 
		'GET', 
		fitbitClient.getToken(),
		fitbitClient.getTokenSecret(),
		userId,
		function (error, data, result) {
			var feed = JSON.parse(data);
			response.send(feed);
		}
	);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
