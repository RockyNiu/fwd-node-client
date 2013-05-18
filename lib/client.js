/**
 * Forward // Node Client
 */

var events = require('events');
var crypto = require('crypto');
var util = require('util');
var defaultHost = "dev.getfwd.com";
var defaultPort = 88473;

/**
 * Forward Client constructor
 *
 * @param  string host
 * @param  int port
 * @param  object login
 */
var ForwardClient = function (host, port, login) {

	events.EventEmitter.call(this);
};

util.inherits(ForwardClient, events.EventEmitter);

/**
 * Remote request
 *
 */
ForwardClient.prototype.remote = function (method, url, data, callback) {

};

/**
 * Remote GET request
 *
 */
ForwardClient.prototype.get = function (url, data, callback) {

};

/**
 * Remote PUT request
 *
 */
ForwardClient.prototype.put = function (url, data, callback) {
        
};

/**
 * Remote POST request
 *
 */
ForwardClient.prototype.post = function (url, data, callback) {
        
};

/**
 * Remote DELETE request
 *
 */
ForwardClient.prototype.delete = function (url, data, callback) {
        
};

/**
 * Remote auth request
 *
 */
ForwardClient.prototype.auth = function (credentials) {
        
};

// Exports
module.exports = {

	ForwardClient: ForwardClient,
	
	defaults: {
                host: defaultHost,
                port: defaultPort
        },
	
	createClient: function (host, port, login) {
		return new ForwardClient(host, port, login);
	}
};
