var OAuth = require('oauth').OAuth;

fitBitClient = (function () {
	var baseUrl = 'https://api.fitbit.com',
		requestPath = '/oauth/request_token',
		accessPath = '/oauth/access_token',
		oauth,
		session = {};

	return {
		init: function (consumerKey, consumerSecret, callbackUrl) {
			oauth = new OAuth(
				baseUrl + requestPath,
				baseUrl + accessPath,
				consumerKey,
				consumerSecret,
				'1.0',
				callbackUrl,
				'HMAC-SHA1'
			);  
		},

		getRequestToken: function (callback) {
			oauth.getOAuthRequestToken(callback);
		},

		getAccessToken: function (token, token_secret, verifier, callback) {
			oauth.getOAuthAccessToken(token, token_secret, verifier, callback);
		},

		requestResource: function (path, method, accessToken, accessTokenSecret, userId, callback) {
			var url = baseUrl + '/1/user/' + (userId || '-') + path;
			oauth.getProtectedResource(url, method, accessToken, accessTokenSecret, callback);
		},

		setToken: function (accessToken) {
			session.accessToken = accessToken;
		},
		
		getToken: function () {
			return session.accessToken;
		},

		setTokenSecret: function (accessTokenSecret) {
			session.accessTokenSecret = accessTokenSecret;
		},

		getTokenSecret: function () {
			return session.accessTokenSecret;
		},

		getAuthorizeURL: function(oAuthToken) {
			return 'http://www.fitbit.com/oauth/authorize?oauth_token=' + oAuthToken;
		}
	}
})();

module.exports = fitBitClient;