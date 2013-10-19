/**
 * Forward/Client
 */

var events = require('events');
var crypto = require('crypto');
var inherits = require('util').inherits;

var Connection = require('./connection').Connection;
var Collection = require('./collection').Collection;
var Record = require('./record').Record;

var defaults = {
	host: 'api.getfwd.com',
	port: 8880
};

/**
 * Client constructor
 *
 * @param  string clientId
 * @param  string clientKey
 * @param  object options
 * @param  function callback
 */
var Client = function(clientId, clientKey, options, callback) {

	events.EventEmitter.call(this);

	this.server = null;
	this.buffer = [];

	this.init(clientId, clientKey, options, callback);
	this.connect(function(self) {
		callback && callback(self);
	});
};

inherits(Client, events.EventEmitter);

/**
 * Initialize client parameters
 *
 * @param  string clientId
 * @param  string clientKey
 * @param  object options
 * @param  function callback
 */
Client.prototype.init = function(clientId, clientKey, options) {

	options = options || {};

	if (typeof options === 'function') {
		callback = options;
		options = {};
	} else if (typeof clientKey === 'function') {
		callback = clientKey;
		options = {};
	}
	if (typeof clientKey === 'object') {
		options = clientKey;
	} else if (typeof clientId === 'object') {
		options = clientId;
	}

	this.params = {
		host: options.host || defaults.host,
		port: options.port || defaults.port,
		clientId: clientId || options.clientId,
		clientKey: clientKey || options.clientKey,
		version: options.version || 1,
		session: options.session,
		api: options.api
	};
};

/**
 * Connect to remote server
 */
Client.prototype.connect = function(callback) {

	var self = this;
	this.server = new Connection(
		this.params.host || params.host,
		this.params.port || params.port,
		function() {
			self.flushBuffer();
			callback && callback(self);
			self.emit('connect', self);
		}
	);
	this.server.on('error', function(err, type) {
		self.emit('error', 'Error: '+err);
	});
	this.server.on('error.network', function(err) {
		self.emit('error', 'Network Error: '+err, 'network');
	});
	this.server.on('error.protocol', function(err) {
		self.emit('error', 'Protocol Error: '+err, 'protocol');
	});
	this.server.on('error.server', function(err) {
		self.emit('error', 'Server Error: '+err, 'server');
	});
};

/**
 * Client request helper
 *
 * @param  string method
 * @param  string url
 * @param  mixed data
 * @param  function callback
 */
Client.prototype.request = function(method, url, data, callback) {

	if (!this.server.connected) {
		this.buffer.push(arguments);
	} else {
		url = url && url.toString ? url.toString() : '';
		var self = this;
		this.server.remote(method, [url, data], function(result) {
			if (result.$auth) {
				self.authed = true;
				return self.auth(result.$auth, function(result) {
					return self.response(method, url, result, callback);
				});
			} else {
				return self.response(method, url, result, callback);
			}
		});
	}
};

/**
 * Client response handler
 *
 * @param  string method
 * @param  string url
 * @param  mixed result
 * @param  function callback
 */
Client.prototype.response = function(method, url, result, callback) {

	var actualResult = null;

	if (result
	&& result.$data
	&& (typeof result.$data === 'object')) {
		// TODO: use a header to determine url of a new record
		if (method.toLowerCase() === 'post') {
			url = url.replace(/\/$/, '') + '/' + result.$data.id;
		}
		actualResult = Client.createResource(url, result, this);
	} else {
		actualResult = result.$data;
	}
	return callback && callback.call(this, actualResult);
};

/**
 * Client GET request
 *
 * @param  string url
 * @param  object data
 * @param  function callback
 * @return mixed
 */
Client.prototype.get = function(url, data, callback) {
	return this.request('get', url, data, callback);
};

/**
 * Client PUT request
 */
Client.prototype.put = function(url, data, callback) {
	return this.request('put', url, data, callback);
};

/**
 * Client POST request
 */
Client.prototype.post = function(url, data, callback) {
	return this.request('post', url, data, callback);
};

/**
 * Client DELETE request
 */
Client.prototype.delete = function(url, data, callback) {
	return this.request('delete', url, data, callback);
};

/**
 * Client auth request
 *
 * @param  object params
 * @param  function callback
 * @return mixed;
 */
Client.prototype.auth = function(nonce, callback) {

	var self = this;
	var clientId = this.params.clientId;
	var clientKey = this.params.clientKey;

	if (typeof nonce === 'function') {
		callback = nonce;
		nonce = null;
	}

	// 1) Get nonce
	if (!nonce) {
		return this.server.remote('auth', [], function(nonce) {
			self.auth(nonce, callback);
		});
	}

	// 2) Create key hash
	var keyHash = crypto.createHash('md5')
		.update(clientId + ":fwd:" + clientKey)
		.digest('hex');

	// 3) Create auth key
	var authKey = crypto.createHash('md5')
		.update(nonce + clientId + keyHash)
		.digest('hex');

	// 4) Authenticate with client creds and options
	var creds = {
		client: clientId,
		key: authKey
	};
	if (this.params.api) {
		creds.$api = this.params.api;
	}
	if (this.params.version) {
		creds.$v = this.params.version;
	}
	if (this.params.session) {
		creds.$session = this.params.session;
	}

	// TODO: send local $ip address

	return this.server.remote('auth', [creds], function(result) {
		if (result.$error) {
			self.emit('error', 'Authentication failed (client: '+clientId+')');
		} else {
			callback && callback.call(this, result);
		}
	});
};

/**
 * Flush local request buffer (when connected)
 *
 * @return void
 */
Client.prototype.flushBuffer = function() {

	if (this.buffer.length && this.server.connected) {
		for (var i = 0; i < this.buffer.length; i++) {
			this.request.apply(this, this.buffer[i]);
		}
	}
};

/**
 * Client create/init helper
 *
 * @param  string clientId
 * @param  string clientKey
 * @param  object options
 * @param  function callback
 * @return Client
 */
Client.create = function(clientId, clientKey, options, callback) {
	return new Client(clientId, clientKey, options, callback);
};

/**
 * Create a resource from result data
 *
 * @param  string url
 * @param  mixed result
 * @param  Client client
 * @return Resource
 */
Client.createResource = function(url, result, client) {
	if (result && result.$data && result.$data.count && result.$data.results) {
        return new Collection(url, result, client);
    }
    return new Record(url, result, client);
};

// Exports
exports.Client = Client;
exports.defaults = defaults;
exports.createClient = Client.create;
