/**
 * Forward // Node Client Connection
 */

var events = require('events'),
    net    = require('net'),
    util   = require('util');

/**
 * Forward Connection constructor
 *
 * @param  string host
 * @param  int port
 */
var Connection = function (host, port) {
	
	events.EventEmitter.call(this);

	this.host = host;
	this.port = port;
};

util.inherits(Connection, events.EventEmitter);

// Exports
module.exports.Connection = Connection;
