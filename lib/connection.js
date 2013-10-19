/**
 * Forward/Connection
 */

var inherits = require('util').inherits;
var events = require('events');
var net = require('net');

/**
 * Connection constructor
 *
 * @param  string host
 * @param  int port,
 * @param  function callback
 */
var Connection = function(host, port, callback) {
	
	events.EventEmitter.call(this);

	this.stream = null;
	this.connected = false;
	this.buffer = [];

	this.host = host;
	this.port = port;

	this.__callbacks = {};
	this.__callbackId = 0;

	this.connect(callback);
};

inherits(Connection, events.EventEmitter);

/**
 * Initiate stream connection.
 *
 * @param  function callback
 */
Connection.prototype.connect = function(callback) {

	var self = this;
	this.stream = net.connect(this.port, this.host, function(stream) {
		self.connected = true;
		callback && callback(self);
	});
	this.stream.on('error', function(err) {
		self.emit('error.network', err);
	});
	this.stream.on('close', function(err) {
		self.close();
	});
	this.stream.on('data', function(buffer) {
		self.receive(buffer);
	});
	this.stream.setEncoding('utf8');
};

/**
 * Call remote server method
 *
 * @param  string method
 * @param  array args
 * @param  function response
 */
Connection.prototype.remote = function(method, args, response) {

	if (!this.stream) {
		this.emit('error.network', 'Unable to execute '+method+' (Error: Connection closed)');
		return;
	}

	this.__callbackId++;
	this.__callbacks[this.__callbackId] = response;

	// TODO: change this in the future
	var callback = {};
	callback[this.__callbackId] = [args.length];

	try {
		var request = JSON.stringify([method, args, callback]);
	} catch (err) {
		this.emit('error.protocol', 'Unable to compile request ('+err+')');
		return;
	}

	this.stream.write(request + "\n");
};

/**
 * Receive data from the server
 *
 * @param  object buffer
 */
Connection.prototype.receive = function(buffer) {

	var data;

	for (var i = 0, j = 0; i < buffer.length; i++) {
		// split buffer data on newline char
		if (buffer[i] === "\n") {
			this.buffer.push(buffer.slice(j, i));

			var line = '';
			for (var k = 0; k < this.buffer.length; k++) {
				line += String(this.buffer[k]);
			}

			this.buffer = [];
			this.receiveResponse(line);

			j = i + 1;
		}
	}
	if (j < buffer.length) {
		this.buffer.push(buffer.slice(j, buffer.length));
	}
};

/**
 * Handle server response data (JSON string)
 *
 * @param  string data
 */
Connection.prototype.receiveResponse = function(data) {

	var response;

	try {
		response = JSON.parse(data);
	} catch (err) {
		this.emit('error.protocol', 'Unable to parse response from server ('+line+')');
		return;
	}

	if (!(response instanceof Array)) {
		this.emit('error.protocol', 'Invalid response from server ('+line+')');
		return;
	}

	var id = response[0];
	var result = response[1];
	var callback = this.__callbacks[id];

	this.__callbacks[id] && this.__callbacks[id](result);

	delete this.__callbacks[id];
};

/**
 * Close this connection
 */
Connection.prototype.close = function() {

	if (this.stream) {
		this.stream.end();
	}
	this.stream = null;
	this.connected = false;
	this.emit('close');
};

// Exports
exports.Connection = Connection;
